import React, { useState, useMemo } from 'react';
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
  Linking,
  ActivityIndicator,
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
  Compass,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { properties } from '../../data/properties';
import type { Property } from '../../types';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const TABS = ['All Properties', 'Apartments', 'Villas'] as const;
type TabType = typeof TABS[number];

// Four sample properties matching the user's explicit specification and screenshot:
// Property 1: 3 BHK Apartment, Madhapur, Vizag (or Madhurawada, Vizag), ₹85,00,000 (id: '1')
// Property 2: 4 BHK Premium Villa, Gachibowli, Hyderabad, ₹1,85,00,000 (id: '3')
// Property 3: 2 BHK Apartment, Madhapur, Hyderabad, ₹65,00,000 (id: '5')
// Property 4: 3 BHK Premium Flat, Jubilee Hills, Hyderabad, ₹2,50,00,000 (id: '8')
const TARGET_BUY_IDS = ['1', '3', '5', '8'];

export default function BuyPropertiesScreen() {
  const { pop, push, savedIds, toggleSaved, activeFilters } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabType>('All Properties');
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // GPS / Google Maps Location modal & feedback states
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'success' | 'denied' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [showGpsModal, setShowGpsModal] = useState(false);

  // Default Buy Properties prioritised to match the 4 cards in the reference image
  const buyProperties = useMemo(() => {
    const targetProps: Property[] = [];
    TARGET_BUY_IDS.forEach((id) => {
      const found = properties.find((p) => p.id === id);
      if (found) targetProps.push(found);
    });

    const otherBuy = properties.filter(
      (p) => p.listingType === 'buy' && !TARGET_BUY_IDS.includes(p.id)
    );

    return [...targetProps, ...otherBuy];
  }, []);

  // Distinct locations for location selection interface
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    buyProperties.forEach((p) => {
      if (p.city) locSet.add(p.city);
      if (p.location) {
        const parts = p.location.split(',');
        const area = parts[0]?.trim();
        if (area) locSet.add(area);
      }
    });
    return ['All', ...Array.from(locSet)];
  }, [buyProperties]);

  // Filtered & Sorted properties
  const filteredProperties = useMemo(() => {
    return buyProperties
      .filter((p) => {
        // Tab filter
        if (selectedTab === 'Apartments') {
          if (p.propertyType !== 'apartment') return false;
        } else if (selectedTab === 'Villas') {
          if (p.propertyType !== 'villa') return false;
        }

        // Location filter from location selection interface
        if (selectedLocation !== 'All') {
          const matchLoc =
            p.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
            p.location?.toLowerCase().includes(selectedLocation.toLowerCase());
          if (!matchLoc) return false;
        }

        // Search query (filters by property title, location, or city)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.title.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Active global filters from Filters screen
        if (activeFilters) {
          if (activeFilters.locations && activeFilters.locations.length > 0) {
            const matchesCity = activeFilters.locations.some(
              (loc) =>
                p.city?.toLowerCase().includes(loc.toLowerCase()) ||
                p.location?.toLowerCase().includes(loc.toLowerCase())
            );
            if (!matchesCity) return false;
          }

          if (activeFilters.bhk && activeFilters.bhk.length > 0) {
            const matchesBhk = activeFilters.bhk.some((b) =>
              b.startsWith(`${p.bedrooms}`)
            );
            if (!matchesBhk) return false;
          }

          if (activeFilters.propertyType && activeFilters.propertyType.length > 0) {
            const matchesType = activeFilters.propertyType.some(
              (t) => t.toLowerCase() === p.propertyType?.toLowerCase()
            );
            if (!matchesType) return false;
          }

          if (activeFilters.furnishing && activeFilters.furnishing.length > 0) {
            const matchesFurnish = activeFilters.furnishing.some(
              (f) =>
                f.toLowerCase().replace('-', ' ') ===
                p.furnishing?.toLowerCase().replace('-', ' ')
            );
            if (!matchesFurnish) return false;
          }

          if (activeFilters.parking) {
            if (activeFilters.parking === 'Available' && !p.parking) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price_asc') return a.price - b.price;
        if (selectedSort === 'price_desc') return b.price - a.price;
        if (selectedSort === 'newest') {
          return (b.yearBuilt || 2024) - (a.yearBuilt || 2024);
        }
        return 0; // relevance / default
      });
  }, [buyProperties, selectedTab, selectedLocation, searchQuery, selectedSort, activeFilters]);

  const handleCardPress = (property: Property) => {
    push({ name: 'propertyDetail', params: { property, flow: 'buy' } });
  };

  // ── Handle Click on "Location" Button: Browser Geolocation & Google Maps ──
  const handleLocationClick = () => {
    setLocationStatus('requesting');
    setErrorMessage('');
    setShowGpsModal(true);

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords({ latitude: lat, longitude: lng });
          setLocationStatus('success');

          // Open Google Maps centered at current GPS coordinates with pin marker
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          Linking.openURL(mapsUrl).catch(() => {});
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('denied');
            setErrorMessage(
              'Location permission was denied. Please allow location access in your browser or device settings to view properties near your current position.'
            );
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationStatus('error');
            setErrorMessage(
              'GPS location information is currently unavailable from your device. Please ensure location services are enabled.'
            );
          } else if (error.code === error.TIMEOUT) {
            setLocationStatus('error');
            setErrorMessage(
              'The request to access your current location timed out. Please try again.'
            );
          } else {
            setLocationStatus('error');
            setErrorMessage(
              error.message || 'Unable to retrieve your current location. Please try again.'
            );
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      // Fallback if Geolocation API is not supported in the current environment
      setLocationStatus('error');
      setErrorMessage(
        'Geolocation is not supported by your browser or device environment.'
      );
    }
  };

  const handleOpenGoogleMapsUrl = (lat: number, lng: number) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(mapsUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Page Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={pop}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Buy Properties</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProperties.length} properties found
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => push({ name: 'filters' })}
          style={styles.filterCircleBtn}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={18} color="#1A1C1A" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── 3. Category Tabs ── */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabPill,
                isActive ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── 4. Relevance Sorting & Location Button Row ── */}
      <View style={styles.controlsRow}>
        {/* Left: Relevance Button */}
        <TouchableOpacity
          style={styles.relevanceBtn}
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.8}
        >
          <ArrowUpDown size={13} color="#64748B" strokeWidth={2.2} />
          <Text style={styles.relevanceText}>
            {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Relevance'}
          </Text>
        </TouchableOpacity>

        {/* Right: Location Option (Requests GPS & opens Google Maps) */}
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={handleLocationClick}
          activeOpacity={0.75}
        >
          <Compass size={16} color="#1E293B" strokeWidth={2.2} />
          <Text style={styles.locationText}>location</Text>
        </TouchableOpacity>
      </View>

      {/* ── 5. Two-Column Property Grid ── */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find what you are looking for.
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedTab('All Properties');
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

                    {/* Top-Left: Green 'For Sale' Pill */}
                    <View style={styles.forSaleBadge}>
                      <Text style={styles.forSaleText}>For Sale</Text>
                    </View>

                    {/* Top-Right: Circular Favourite Heart Button */}
                    <TouchableOpacity
                      style={styles.heartCircle}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleSaved(item.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Heart
                        size={15}
                        color={isFav ? '#EF4444' : '#64748B'}
                        fill={isFav ? '#EF4444' : 'transparent'}
                        strokeWidth={2.2}
                      />
                    </TouchableOpacity>

                    {/* Bottom-Right: Verified Badge (if verified) */}
                    {item.verified && (
                      <View style={styles.verifiedBadge}>
                        <ShieldCheck size={11} color="#059669" strokeWidth={2.4} />
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

                    <Text style={styles.cardPrice}>
                      {item.priceLabel || `₹${item.price.toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Relevance Sort Modal ── */}
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
          <View style={styles.bottomSheetContent} onStartShouldSetResponder={() => true}>
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

      {/* ── Location Modal Interface ── */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.bottomSheetContent} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter by Location</Text>
            <Text style={styles.sheetSubtitle}>Select a city or area to explore properties</Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {locations.map((loc) => {
                const isSelected = selectedLocation === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={styles.optionRowBorder}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── GPS / Current Location Modal (Location Permission & Google Maps) ── */}
      <Modal
        visible={showGpsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGpsModal(false)}
      >
        <TouchableOpacity
          style={styles.gpsBackdrop}
          activeOpacity={1}
          onPress={() => setShowGpsModal(false)}
        >
          <View style={styles.gpsModalCard} onStartShouldSetResponder={() => true}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.gpsCloseBtn}
              onPress={() => setShowGpsModal(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Requesting / Fetching State */}
            {locationStatus === 'requesting' && (
              <View style={styles.gpsContentBlock}>
                <View style={styles.gpsIconCircle}>
                  <ActivityIndicator size="large" color="#0F172A" />
                </View>
                <Text style={styles.gpsTitle}>Detecting Your Location</Text>
                <Text style={styles.gpsDesc}>
                  Please allow location access in your browser or device prompt to view nearby properties on Google Maps.
                </Text>
              </View>
            )}

            {/* Success State */}
            {locationStatus === 'success' && currentCoords && (
              <View style={styles.gpsContentBlock}>
                <View style={[styles.gpsIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <MapPin size={32} color="#16A34A" />
                </View>
                <Text style={styles.gpsTitle}>Location Found!</Text>
                <Text style={styles.gpsDesc}>
                  Opening your current location on Google Maps:
                </Text>
                <Text style={styles.gpsCoordsText}>
                  {currentCoords.latitude.toFixed(5)}° N, {currentCoords.longitude.toFixed(5)}° E
                </Text>

                <TouchableOpacity
                  style={styles.gpsPrimaryBtn}
                  onPress={() =>
                    handleOpenGoogleMapsUrl(currentCoords.latitude, currentCoords.longitude)
                  }
                  activeOpacity={0.85}
                >
                  <ExternalLink size={16} color="#FFFFFF" />
                  <Text style={styles.gpsPrimaryBtnText}>Open in Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gpsSecondaryBtn}
                  onPress={() => setShowGpsModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gpsSecondaryBtnText}>Back to Properties</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Denied State */}
            {locationStatus === 'denied' && (
              <View style={styles.gpsContentBlock}>
                <View style={[styles.gpsIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <AlertCircle size={32} color="#DC2626" />
                </View>
                <Text style={styles.gpsTitle}>Location Permission Denied</Text>
                <Text style={styles.gpsDesc}>
                  {errorMessage ||
                    'Location access was blocked. To see properties near you, please grant location permission in your browser or device settings.'}
                </Text>

                <TouchableOpacity
                  style={styles.gpsPrimaryBtn}
                  onPress={handleLocationClick}
                  activeOpacity={0.85}
                >
                  <Text style={styles.gpsPrimaryBtnText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gpsSecondaryBtn}
                  onPress={() => setShowGpsModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gpsSecondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error State */}
            {locationStatus === 'error' && (
              <View style={styles.gpsContentBlock}>
                <View style={[styles.gpsIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <AlertCircle size={32} color="#D97706" />
                </View>
                <Text style={styles.gpsTitle}>Unable to Retrieve Location</Text>
                <Text style={styles.gpsDesc}>
                  {errorMessage ||
                    'Could not determine your GPS location. Please check your internet connection or location services.'}
                </Text>

                <TouchableOpacity
                  style={styles.gpsPrimaryBtn}
                  onPress={handleLocationClick}
                  activeOpacity={0.85}
                >
                  <Text style={styles.gpsPrimaryBtnText}>Retry</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gpsSecondaryBtn}
                  onPress={() => setShowGpsModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gpsSecondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA',
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
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '400',
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
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineWidth: 0 } as any,
    }),
  },

  /* ── Category Tabs ── */
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: '#0F172A',
  },
  tabPillInactive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabTextInactive: {
    color: '#64748B',
  },

  /* ── Relevance & Location Controls Row ── */
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  relevanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  relevanceText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },

  /* ── Grid Scroll & List ── */
  gridScroll: {
    flex: 1,
  },
  gridScrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  /* ── Card Styles (Matching 2-Column Reference) ── */
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  cardImageContainer: {
    width: '100%',
    height: 116,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  forSaleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  forSaleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heartCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Card Content */
  cardContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  cardLocation: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Modal Bottom Sheet ── */
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
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
  optionRowBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
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

  /* ── GPS / Current Location Modal Styles ── */
  gpsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gpsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  gpsCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  gpsContentBlock: {
    alignItems: 'center',
    paddingTop: 8,
  },
  gpsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gpsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  gpsDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  gpsCoordsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gpsPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  gpsPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gpsSecondaryBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsSecondaryBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
});
