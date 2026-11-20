import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import {
  ChevronLeft,
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  Check,
  Heart,
  MapPin,
  ShieldCheck,
  LocateFixed,
  Navigation,
  Compass,
  AlertCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { properties } from '../../data/properties';
import type { Property } from '../../types';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'distance';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'distance', label: 'Nearest First (Distance)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  madhapur: { lat: 17.4483, lng: 78.3915 },
  gachibowli: { lat: 17.4401, lng: 78.3489 },
  kondapur: { lat: 17.4699, lng: 78.3578 },
  hitec: { lat: 17.4435, lng: 78.3772 },
  jubilee: { lat: 17.4319, lng: 78.4073 },
  banjara: { lat: 17.4156, lng: 78.4358 },
  financial: { lat: 17.4159, lng: 78.3427 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  madhurawada: { lat: 17.8015, lng: 83.3524 },
  gajuwaka: { lat: 17.6908, lng: 83.2104 },
};

const CATEGORY_TABS = ['All Spaces', 'Offices', 'Retail Shops', 'Co-working'] as const;
type CategoryTab = typeof CATEGORY_TABS[number];

const LOCATION_OPTIONS = [
  'All',
  'HITEC City',
  'Banjara Hills',
  'Kondapur',
  'Hyderabad',
  'Vizag',
];

// Target commercial listings matching Image 1:
// 1. Premium Office Space (HITEC City, Hyderabad - ₹45,000/month)
// 2. Retail Shop (Banjara Hills, Hyderabad - ₹80,000/month)
// 3. Co-working Space (Kondapur, Hyderabad - ₹8,000/seat/month)
const TARGET_COMMERCIAL_IDS = ['6', '7', '9'];

export default function CommercialSpacesScreen() {
  const { pop, push, savedIds, toggleSaved, activeFilters } = useApp();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<CategoryTab>('All Spaces');
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedRadius, setSelectedRadius] = useState<number>(30); // 30km default
  const [autoExpandedNotice, setAutoExpandedNotice] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 17.4401,
    longitude: 78.3489,
  });

  // Auto-detect user's location on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  const getPropertyCoords = (p: Property) => {
    if ((p as any).latitude && (p as any).longitude) {
      return { lat: (p as any).latitude, lng: (p as any).longitude };
    }
    const locLower = ((p.location || '') + ' ' + (p.city || '')).toLowerCase();
    for (const [key, coords] of Object.entries(LOCALITY_COORDS)) {
      if (locLower.includes(key)) return coords;
    }
    return { lat: 17.4483, lng: 78.3915 };
  };

  // Commercial properties prioritized to match design order
  const commercialProperties = useMemo(() => {
    const targetProps: Property[] = [];
    TARGET_COMMERCIAL_IDS.forEach((id) => {
      const found = properties.find((p) => p.id === id);
      if (found) targetProps.push(found);
    });

    const otherCommercial = properties.filter(
      (p) => p.listingType === 'commercial' && !TARGET_COMMERCIAL_IDS.includes(p.id)
    );

    return [...targetProps, ...otherCommercial];
  }, []);

  // Filtered and sorted commercial spaces with distance and radius auto-expansion
  const filteredProperties = useMemo(() => {
    const userLat = currentCoords.latitude;
    const userLng = currentCoords.longitude;

    const withDistance = commercialProperties.map((p) => {
      const pCoords = getPropertyCoords(p);
      const dist = calculateDistanceKm(userLat, userLng, pCoords.lat, pCoords.lng);
      return {
        ...p,
        distanceKm: dist,
      };
    });

    const matched = withDistance.filter((p) => {
      if (selectedTab === 'Offices') {
        if (p.propertyType !== 'office') return false;
      } else if (selectedTab === 'Retail Shops') {
        if (p.propertyType !== 'shop') return false;
      } else if (selectedTab === 'Co-working') {
        if (p.propertyType !== 'coworking') return false;
      }

      if (selectedLocation !== 'All') {
        const locLower = selectedLocation.toLowerCase();
        const matchLoc =
          p.location.toLowerCase().includes(locLower) ||
          (p.city && p.city.toLowerCase().includes(locLower));
        if (!matchLoc) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // Radius Filter & 30km -> 60km -> 100km auto-expansion
    let radiusResults = matched;
    let noticeText: string | null = null;

    if (selectedRadius < 9999) {
      radiusResults = matched.filter((p) => p.distanceKm <= selectedRadius);

      if (radiusResults.length === 0 && selectedRadius <= 30) {
        const within60 = matched.filter((p) => p.distanceKm <= 60);
        if (within60.length > 0) {
          radiusResults = within60;
          noticeText = 'No commercial spaces within 30 km. Showing 60 km radius.';
        } else {
          const within100 = matched.filter((p) => p.distanceKm <= 100);
          if (within100.length > 0) {
            radiusResults = within100;
            noticeText = 'No commercial spaces within 60 km. Showing 100 km radius.';
          } else {
            radiusResults = matched;
            noticeText = 'Showing all available commercial spaces across cities.';
          }
        }
      } else if (radiusResults.length === 0 && selectedRadius <= 60) {
        const within100 = matched.filter((p) => p.distanceKm <= 100);
        if (within100.length > 0) {
          radiusResults = within100;
          noticeText = 'No commercial spaces within 60 km. Showing 100 km radius.';
        } else {
          radiusResults = matched;
          noticeText = 'Showing all available commercial spaces across cities.';
        }
      }
    }

    setAutoExpandedNotice(noticeText);

    return radiusResults.sort((a, b) => {
      if (selectedSort === 'distance') return a.distanceKm - b.distanceKm;
      if (selectedSort === 'price_asc') return a.price - b.price;
      if (selectedSort === 'price_desc') return b.price - a.price;
      if (selectedSort === 'newest') {
        return (b.yearBuilt || 2024) - (a.yearBuilt || 2024);
      }
      return 0;
    });
  }, [
    commercialProperties,
    selectedTab,
    selectedLocation,
    searchQuery,
    selectedSort,
    selectedRadius,
    currentCoords,
  ]);

  const handleCardPress = (property: Property) => {
    push({ name: 'propertyDetail', params: { property, flow: 'commercial' } });
  };

  const getBadgeLabel = (item: Property) => {
    // Matches Image 1: Premium Office Space shows "For Sale", Retail Shop & Co-working show "For Rent"
    if (item.id === '6') return 'For Sale';
    return 'For Rent';
  };

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === selectedSort)?.label || 'Relevance';

  return (
    <View style={styles.container}>
      {/* ── 1. Header Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={pop}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Commercial Spaces</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProperties.length} properties found
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => push({ name: 'filters', params: { scope: 'commercial' } })}
          style={styles.filterCircleBtn}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={18} color="#1A1C1A" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={17} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search spaces..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── 3. Category Tabs (All Spaces, Offices, Retail Shops, Co-working) ── */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 4. Utility Row (Sort Relevance Pill & Location Trigger) ── */}
      <View style={styles.utilityRow}>
        <TouchableOpacity
          style={styles.sortPillBtn}
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.8}
        >
          <ArrowUpDown size={13} color="#475569" strokeWidth={2.2} />
          <Text style={styles.sortPillText}>{activeSortLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationTriggerBtn}
          onPress={() => setShowLocationModal(true)}
          activeOpacity={0.75}
        >
          <LocateFixed size={16} color="#0F172A" strokeWidth={2.2} />
          <Text style={styles.locationTriggerText}>
            {selectedLocation === 'All' ? 'location' : selectedLocation}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Radius Filter Row (30km, 60km, 100km, All City) ── */}
      <View style={styles.radiusContainer}>
        <View style={styles.radiusHeaderRow}>
          <View style={styles.radiusTitleBox}>
            <Navigation size={13} color="#D97706" />
            <Text style={styles.radiusTitleText}>Commercial Radius:</Text>
          </View>
          <Text style={styles.radiusGpsHint}>
            📍 {currentCoords.latitude.toFixed(2)}, {currentCoords.longitude.toFixed(2)}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusPillsRow}>
          {[
            { id: 30, label: '30 km (Nearby)' },
            { id: 60, label: '60 km' },
            { id: 100, label: '100 km' },
            { id: 9999, label: 'All City' },
          ].map((r) => {
            const isRadActive = selectedRadius === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRadius(r.id)}
                style={[styles.radiusPill, isRadActive && styles.radiusPillActive]}
              >
                <Text style={[styles.radiusPillText, isRadActive && styles.radiusPillTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Auto-expansion banner */}
      {autoExpandedNotice && (
        <View style={styles.autoExpandBanner}>
          <AlertCircle size={14} color="#D97706" />
          <Text style={styles.autoExpandText}>{autoExpandedNotice}</Text>
        </View>
      )}

      {/* ── 5. 2-Column Commercial Property Grid ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No commercial spaces found</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search or switching space categories.
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedTab('All Spaces');
                setSelectedLocation('All');
              }}
            >
              <Text style={styles.clearBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredProperties.map((item) => {
              const isFav = savedIds.has(item.id);
              const badgeLabel = getBadgeLabel(item);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => handleCardPress(item)}
                  activeOpacity={0.92}
                >
                  {/* Card Image Container */}
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />

                    {/* Top-Left: Orange For Sale / For Rent Badge */}
                    <View style={styles.commercialBadge}>
                      <Text style={styles.commercialBadgeText}>{badgeLabel}</Text>
                    </View>

                    {/* Top-Right: Circular Heart Button */}
                    <TouchableOpacity
                      style={styles.heartCircle}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleSaved(item.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Heart
                        size={14}
                        color={isFav ? '#EF4444' : '#334155'}
                        fill={isFav ? '#EF4444' : 'transparent'}
                        strokeWidth={2.2}
                      />
                    </TouchableOpacity>

                    {/* Bottom-Right: Verified Pill */}
                    {item.verified && (
                      <View style={styles.verifiedPill}>
                        <ShieldCheck size={11} color="#059669" strokeWidth={2.5} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.locationRow}>
                      <MapPin size={11} color="#94A3B8" strokeWidth={2} />
                      <Text style={styles.cardLocation} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>

                    {(item as any).distanceKm !== undefined && (
                      <View style={styles.cardDistanceRow}>
                        <Compass size={10} color="#D97706" />
                        <Text style={styles.cardDistanceText}>
                          {(item as any).distanceKm} km away
                        </Text>
                      </View>
                    )}

                    <Text style={styles.cardPrice} numberOfLines={1}>
                      {item.priceLabel || `₹${item.price.toLocaleString('en-IN')}/month`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── 6. Sorting Bottom Sheet Modal ── */}
      <Modal
        visible={showSortModal}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View
            style={[
              styles.bottomSheetContent,
              { paddingBottom: Math.max(insets.bottom, 28) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sort By</Text>

            <View style={styles.optionsList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = selectedSort === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedSort(opt.value);
                      setShowSortModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected ? styles.optionTextActive : styles.optionTextInactive,
                      ]}
                    >
                      {opt.label}
                    </Text>

                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 7. Location Filter Bottom Sheet Modal ── */}
      <Modal
        visible={showLocationModal}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View
            style={[
              styles.bottomSheetContent,
              { paddingBottom: Math.max(insets.bottom, 28) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Location</Text>

            <View style={styles.optionsList}>
              {LOCATION_OPTIONS.map((loc) => {
                const isSelected = selectedLocation === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <MapPin size={15} color={isSelected ? '#0F172A' : '#94A3B8'} />
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.optionTextActive : styles.optionTextInactive,
                        ]}
                      >
                        {loc === 'All' ? 'All Locations' : loc}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F4F6FA',
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitles: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  filterCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  /* ── Search Bar ── */
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },

  /* ── Category Tabs ── */
  tabsWrapper: {
    marginBottom: 12,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tabPillActive: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* ── Utility Row ── */
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sortPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  locationTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  locationTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* ── Radius Filter Bar ── */
  radiusContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  radiusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  radiusTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radiusTitleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radiusGpsHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  radiusPillsRow: {
    gap: 8,
  },
  radiusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radiusPillActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  radiusPillTextActive: {
    color: '#FFFFFF',
  },
  autoExpandBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  autoExpandText: {
    flex: 1,
    fontSize: 11.5,
    color: '#92400E',
    fontWeight: '600',
  },
  cardDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 4,
  },
  cardDistanceText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#D97706',
  },

  /* ── Grid Cards ── */
  scrollArea: {
    flex: 1,
  },
  gridScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  card: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    width: '100%',
    height: 132,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  commercialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commercialBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  heartCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cardLocation: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
  },
  cardPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* ── Empty State ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Bottom Sheet Modals ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  optionsList: {
    paddingTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
    letterSpacing: -0.1,
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#0F172A',
  },
  optionTextInactive: {
    fontWeight: '400',
    color: '#475569',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
