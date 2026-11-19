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

const ROOM_TABS = ['Any room', 'Private room', 'Shared room'] as const;
type RoomTabType = typeof ROOM_TABS[number];

export interface FlatmateProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  priceLabel: string;
  roomType: 'Private room' | 'Shared room';
  image: string;
  verified: boolean;
  baseProperty?: Property;
}

// 3 sample properties matching the user's explicit specification and screenshot:
// Property 1: Private room in 3 BHK, Gajuwaka, Vizag, ₹15,000/month, Type: Private room, Verified
// Property 2: 3 BHK Flat, Kondapur, Hyderabad, ₹22,000/month, Type: Private room, Verified
// Property 3: 2 BHK Apartment, MVP Colony, Vizag, ₹12,000/month, Type: Shared room, Not verified
const SAMPLE_FLATMATE_PROPERTIES: FlatmateProperty[] = [
  {
    id: 'fm-prop-1',
    title: 'Private room in 3 BHK',
    location: 'Gajuwaka, Vizag',
    city: 'Vizag',
    price: 15000,
    priceLabel: '₹15,000/month',
    roomType: 'Private room',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop&auto=format',
    verified: true,
  },
  {
    id: 'fm-prop-2',
    title: '3 BHK Flat',
    location: 'Kondapur, Hyderabad',
    city: 'Hyderabad',
    price: 22000,
    priceLabel: '₹22,000/month',
    roomType: 'Private room',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&auto=format',
    verified: true,
  },
  {
    id: 'fm-prop-3',
    title: '2 BHK Apartment',
    location: 'MVP Colony, Vizag',
    city: 'Vizag',
    price: 12000,
    priceLabel: '₹12,000/month',
    roomType: 'Shared room',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop&auto=format',
    verified: false,
  },
];

export default function FlatmatesScreen() {
  const { pop, push, savedIds, toggleSaved, flatmatesFilters } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<RoomTabType>('Any room');
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

  // Locations for location selection interface
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    SAMPLE_FLATMATE_PROPERTIES.forEach((p) => {
      if (p.city) locSet.add(p.city);
      if (p.location) {
        const parts = p.location.split(',');
        const area = parts[0]?.trim();
        if (area) locSet.add(area);
      }
    });
    return ['All', ...Array.from(locSet)];
  }, []);

  // Filtered and Sorted properties
  const filteredListings = useMemo(() => {
    return SAMPLE_FLATMATE_PROPERTIES.filter((item) => {
      // Room Type Tab filter
      if (selectedTab === 'Private room' && item.roomType !== 'Private room') {
        return false;
      }
      if (selectedTab === 'Shared room' && item.roomType !== 'Shared room') {
        return false;
      }

      // Location filter
      if (selectedLocation !== 'All') {
        const matchLoc =
          item.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          item.location.toLowerCase().includes(selectedLocation.toLowerCase());
        if (!matchLoc) return false;
      }

      // Search query (filters by title, location, or city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.roomType.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Flatmates-specific Filters from FiltersScreen
      if (flatmatesFilters) {
        // Budget Filter
        if (flatmatesFilters.budgetMax && item.price > flatmatesFilters.budgetMax) {
          return false;
        }

        // Location Multi-Select Filter
        if (flatmatesFilters.locations && flatmatesFilters.locations.length > 0) {
          const matchCity = flatmatesFilters.locations.some(
            (loc) =>
              item.city.toLowerCase().includes(loc.toLowerCase()) ||
              item.location.toLowerCase().includes(loc.toLowerCase())
          );
          if (!matchCity) return false;
        }

        // BHK Filter
        if (flatmatesFilters.bhk && flatmatesFilters.bhk.length > 0) {
          const matchBhk = flatmatesFilters.bhk.some((b) =>
            item.title.toLowerCase().includes(b.toLowerCase())
          );
          if (!matchBhk) return false;
        }

        // Property Type Filter
        if (flatmatesFilters.propertyType && flatmatesFilters.propertyType.length > 0) {
          const matchType = flatmatesFilters.propertyType.some((t) =>
            item.title.toLowerCase().includes(t.toLowerCase())
          );
          if (!matchType) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price_asc') return a.price - b.price;
      if (selectedSort === 'price_desc') return b.price - a.price;
      return 0; // relevance / default
    });
  }, [selectedTab, selectedLocation, searchQuery, selectedSort, flatmatesFilters]);

  const handleCardPress = (item: FlatmateProperty) => {
    // Find matching rental or property in the same location
    const matchingProperty =
      properties.find((p) => p.listingType === 'rent' && p.location.toLowerCase().includes(item.city.toLowerCase())) ||
      properties.find((p) => p.location.toLowerCase().includes(item.city.toLowerCase())) ||
      properties.find((p) => p.id === '2') ||
      properties[0];

    const detailProp: Property = {
      ...matchingProperty,
      id: item.id,
      title: item.title,
      location: item.location,
      city: item.city,
      price: item.price,
      priceLabel: item.priceLabel,
      image: item.image,
      images: [item.image, ...(matchingProperty.images ? matchingProperty.images.slice(1) : [])],
      verified: item.verified,
      listingType: 'rent',
      propertyType: item.title.toLowerCase().includes('house') ? 'house' : 'apartment',
      bedrooms: item.title.includes('3 BHK') ? 3 : item.title.includes('2 BHK') ? 2 : 2,
      bathrooms: 2,
      area: 1200,
      floor: 'Ground',
      totalFloors: 2,
      facing: 'North-East',
      yearBuilt: 2024,
      furnishing: 'semi-furnished',
      parking: true,
      deposit: item.price * 3,
      maintenance: 1500,
      amenities: ['Parking', 'Water Supply', 'Power Backup', 'Garden', 'Security'],
      description: 'Spacious 2 BHK independent house in a peaceful residential area of Gajuwaka. Perfect for families. Close to schools, hospitals and markets.',
    };

    push({ name: 'propertyDetail', params: { property: detailProp, flow: 'flatmates' } });
  };

  // ── Handle Click on "Location" Option: Browser Geolocation & Google Maps ──
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

          // Open Google Maps centered at current coordinates
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          Linking.openURL(mapsUrl).catch(() => {});
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('denied');
            setErrorMessage(
              'Location permission was denied. Please allow location access in your browser or device settings to view flatmates near your current position.'
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
      setLocationStatus('error');
      setErrorMessage('Geolocation is not supported by your browser or device environment.');
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
        <TouchableOpacity onPress={pop} style={styles.backCircleBtn} activeOpacity={0.8}>
          <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Flatmates</Text>
          <Text style={styles.headerSubtitle}>
            Find a room and the people you will live with
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => push({ name: 'filters', params: { scope: 'flatmates' } })}
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
            placeholder="Search spaces..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── 3. Room Type Filter Chips ── */}
      <View style={styles.tabsRow}>
        {ROOM_TABS.map((tab) => {
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

      {/* ── 5. Flatmate Property Cards Grid ── */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No flatmates found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your room type filter or search terms.
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedTab('Any room');
                setSelectedLocation('All');
              }}
            >
              <Text style={styles.clearBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredListings.map((item) => {
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

                    {/* Top-Left: Pink Room Type Badge */}
                    <View style={styles.roomTypeBadge}>
                      <Text style={styles.roomTypeText}>{item.roomType}</Text>
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

                    <Text style={styles.cardPrice}>{item.priceLabel}</Text>
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
          <View style={styles.bottomSheetContent} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter by Location</Text>
            <Text style={styles.sheetSubtitle}>Select a city or area to explore flatmates</Text>
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
        statusBarTranslucent
        navigationBarTranslucent
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

            {/* Requesting State */}
            {locationStatus === 'requesting' && (
              <View style={styles.gpsContentBlock}>
                <View style={styles.gpsIconCircle}>
                  <ActivityIndicator size="large" color="#0F172A" />
                </View>
                <Text style={styles.gpsTitle}>Detecting Your Location</Text>
                <Text style={styles.gpsDesc}>
                  Please allow location access in your browser or device prompt to view nearby flatmates on Google Maps.
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
                <Text style={styles.gpsDesc}>Opening your current location on Google Maps:</Text>
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
                  <Text style={styles.gpsSecondaryBtnText}>Back to Flatmates</Text>
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
                    'Location access was blocked. To see flatmates near you, please grant location permission in your browser or device settings.'}
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

  /* ── Room Type Tabs ── */
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
  roomTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E11D48', // Vibrant pink badge matching reference
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  roomTypeText: {
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
