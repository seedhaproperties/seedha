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
  LocateFixed,
  BedDouble,
  Utensils,
  MessageSquare,
  Compass,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import type { Property } from '../../types';
import { api } from '../../services/api';
import { userSocket } from '../../services/socket';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const CATEGORY_TABS = ['All', 'Boys PG', 'Girls PG', 'Co-living'] as const;
type CategoryTab = typeof CATEGORY_TABS[number];

const LOCATION_OPTIONS = [
  'All',
  'Madhapur',
  'Gachibowli',
  'Kondapur',
  'Ameerpet',
  'MVP Colony',
  'Hyderabad',
  'Vizag',
];

interface PgListing extends Property {
  pgCategory: 'Boys PG' | 'Girls PG' | 'Co-living';
  sharingLabel: string;
  foodIncluded: boolean;
}

const PG_HOSTEL_LISTINGS: PgListing[] = [
  {
    id: 'pg-0',
    title: 'UrbanNest Co-living PG',
    location: 'Kondapur, Hyderabad',
    city: 'Hyderabad',
    price: 11500,
    priceLabel: '₹11,500/month',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 220,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=500&fit=crop&auto=format',
    ],
    verified: true,
    amenities: ['WiFi', 'Common TV', 'Mess', 'Lift', 'Refrigerator', 'Power Backup', 'CCTV', 'RO Water'],
    description:
      'Modern co-living PG near the IT corridor with furnished rooms, daily cleaning, healthy food and 24×7 security.',
    ownerName: 'UrbanNest Living',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0dc05a1a53fc?w=120&h=120&fit=crop&auto=format',
    ownerType: 'builder',
    furnishing: 'fully-furnished',
    parking: true,
    deposit: 15000,
    maintenance: 0,
    yearBuilt: 2024,
    floor: '3rd',
    totalFloors: 6,
    facing: 'East',
    pgCategory: 'Co-living',
    sharingLabel: 'Single, 2 & 3 Sharing',
    foodIncluded: true,
  },
  {
    id: 'pg-1',
    title: 'Zolo Stays Executive PG',
    location: 'Madhapur, Hyderabad',
    city: 'Hyderabad',
    price: 9500,
    priceLabel: '₹9,500/month',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 220,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=500&fit=crop&auto=format',
    ],
    verified: true,
    amenities: ['WiFi', 'Food Included', 'Power Backup', 'Laundry', 'CCTV', 'Housekeeping'],
    description:
      'Premium fully-furnished Boys PG in Madhapur close to HITEC City IT parks. Includes 3-time homely meals, high-speed WiFi, daily housekeeping, and biometric access.',
    ownerName: 'Srinivas Reddy',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    ownerType: 'owner',
    furnishing: 'fully-furnished',
    parking: true,
    deposit: 10000,
    maintenance: 0,
    yearBuilt: 2023,
    floor: '2nd',
    totalFloors: 5,
    facing: 'East',
    pgCategory: 'Boys PG',
    sharingLabel: '2 & 3 Sharing',
    foodIncluded: true,
  },
  {
    id: 'pg-2',
    title: 'Stanza Living Women Hostel',
    location: 'Gachibowli, Hyderabad',
    city: 'Hyderabad',
    price: 11000,
    priceLabel: '₹11,000/month',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 250,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&auto=format',
    ],
    verified: true,
    amenities: ['WiFi', 'AC Rooms', '24/7 Security', 'Food Included', 'Washing Machine', 'Gym'],
    description:
      'Safe and modern Girls Hostel in Gachibowli with 24/7 warden & CCTV surveillance, nutritious meals, AC rooms, and walking distance to Financial District shuttle stops.',
    ownerName: 'Padmavathi Devi',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
    ownerType: 'owner',
    furnishing: 'fully-furnished',
    parking: true,
    deposit: 12000,
    maintenance: 0,
    yearBuilt: 2024,
    floor: '3rd',
    totalFloors: 6,
    facing: 'North',
    pgCategory: 'Girls PG',
    sharingLabel: 'Single & 2 Sharing',
    foodIncluded: true,
  },
  {
    id: 'pg-3',
    title: 'Colive Studio Co-living',
    location: 'Kondapur, Hyderabad',
    city: 'Hyderabad',
    price: 13500,
    priceLabel: '₹13,500/month',
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 310,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
    ],
    verified: true,
    amenities: ['High Speed WiFi', 'Co-working Lounge', 'AC', 'Power Backup', 'Parking', 'Lift'],
    description:
      'Boutique co-living space in Kondapur designed for working professionals and couples. Features private studio rooms, shared rooftop lounge, and zero brokerage.',
    ownerName: 'Colive Residences',
    ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0dc05a1a53fc?w=120&h=120&fit=crop&auto=format',
    ownerType: 'builder',
    furnishing: 'fully-furnished',
    parking: true,
    deposit: 20000,
    maintenance: 500,
    yearBuilt: 2024,
    floor: '4th',
    totalFloors: 7,
    facing: 'North-East',
    pgCategory: 'Co-living',
    sharingLabel: 'Private & Twin',
    foodIncluded: false,
  },
  {
    id: 'pg-4',
    title: 'Sri Sai Deluxe Boys Hostel',
    location: 'MVP Colony, Vizag',
    city: 'Vizag',
    price: 7500,
    priceLabel: '₹7,500/month',
    listingType: 'rent',
    propertyType: 'house',
    bedrooms: 1,
    bathrooms: 1,
    area: 180,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=400&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=500&fit=crop&auto=format',
    ],
    verified: true,
    amenities: ['Food Included', 'WiFi', 'RO Water', 'Bike Parking', 'CCTV'],
    description:
      'Budget-friendly Boys PG in MVP Colony, Vizag ideal for students and IT freshers. South Indian homely food included 3 times daily.',
    ownerName: 'Venkata Rao',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    ownerType: 'owner',
    furnishing: 'semi-furnished',
    parking: true,
    deposit: 5000,
    maintenance: 0,
    yearBuilt: 2021,
    floor: '1st',
    totalFloors: 3,
    facing: 'East',
    pgCategory: 'Boys PG',
    sharingLabel: '3 & 4 Sharing',
    foodIncluded: true,
  },
];

export default function PgHostelsScreen() {
  const { pop, push, savedIds, toggleSaved } = useApp();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<CategoryTab>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Live Backend State & Geolocation
  const [liveListings, setLiveListings] = useState<PgListing[]>([]);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(9999);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 17.4401,
    longitude: 78.3489,
  });

  // Auto-detect geolocation
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
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Fetch real-time PG/Hostel properties from backend Supabase PostgreSQL
  useEffect(() => {
    let isMounted = true;
    const fetchLivePgs = async () => {
      try {
        setIsFetchingLive(true);
        const res = await api.properties.list({
          type: 'pg',
          userLat: currentCoords.latitude,
          userLng: currentCoords.longitude,
          radiusKm: selectedRadius,
          city: selectedLocation !== 'All' ? selectedLocation : undefined,
        });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (isMounted && list.length > 0) {
          setLiveListings(list as any);
        }
      } catch (err) {
        console.warn('Live PG properties fetch notice:', err);
      } finally {
        if (isMounted) setIsFetchingLive(false);
      }
    };
    fetchLivePgs();

    userSocket.connect();
    const unsub = userSocket.onStatusUpdated((event) => {
      if (event.status === 'PUBLISHED' || event.status === 'REJECTED') {
        fetchLivePgs();
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [currentCoords.latitude, currentCoords.longitude, selectedRadius, selectedLocation]);

  // Merge live backend listings with offline catalog
  const combinedListings = useMemo(() => {
    if (liveListings.length === 0) return PG_HOSTEL_LISTINGS;
    const existingIds = new Set(liveListings.map((p) => p.id));
    const offlineUnique = PG_HOSTEL_LISTINGS.filter((p) => !existingIds.has(p.id));
    return [...liveListings, ...offlineUnique];
  }, [liveListings]);

  const filteredListings = useMemo(() => {
    return combinedListings.filter((item) => {
      if (selectedTab !== 'All' && item.pgCategory !== selectedTab) {
        return false;
      }

      if (selectedLocation !== 'All') {
        const loc = selectedLocation.toLowerCase();
        const matchLoc =
          item.location.toLowerCase().includes(loc) ||
          item.city.toLowerCase().includes(loc);
        if (!matchLoc) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.pgCategory && item.pgCategory.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price_asc') return a.price - b.price;
      if (selectedSort === 'price_desc') return b.price - a.price;
      if (selectedSort === 'newest') return (b.yearBuilt || 2024) - (a.yearBuilt || 2024);
      return 0;
    });
  }, [combinedListings, selectedTab, selectedLocation, searchQuery, selectedSort]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === selectedSort)?.label || 'Relevance';

  const getBadgeBg = (cat: PgListing['pgCategory']) => {
    if (cat === 'Girls PG') return '#DB2777';
    if (cat === 'Co-living') return '#7C3AED';
    return '#2563EB';
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pop} style={styles.backCircleBtn} activeOpacity={0.8}>
          <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>PG & Hostels</Text>
          <Text style={styles.headerSubtitle}>
            {filteredListings.length} properties found
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

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={17} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search PGs, hostels, localities..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Category Tabs ── */}
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

      {/* ── Utility Row ── */}
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

      {/* ── Radius Selection Bar ── */}
      <View style={styles.radiusRow}>
        <Compass size={14} color="#64748B" strokeWidth={2} />
        <Text style={styles.radiusLabel}>Radius:</Text>
        {[30, 60, 100].map((r) => {
          const isSelected = selectedRadius === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRadius(r)}
              style={[styles.radiusPill, isSelected && styles.radiusPillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.radiusPillText, isSelected && styles.radiusPillTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          );
        })}
        {isFetchingLive && <ActivityIndicator size="small" color="#0F172A" style={{ marginLeft: 6 }} />}
      </View>

      {/* ── Grid Listings ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No PGs or hostels found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter selections.
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedTab('All');
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
                  onPress={() => push({ name: 'propertyDetail', params: { property: item, flow: 'pg' } })}
                  activeOpacity={0.92}
                >
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />

                    <View
                      style={[
                        styles.pgBadge,
                        { backgroundColor: getBadgeBg(item.pgCategory) },
                      ]}
                    >
                      <Text style={styles.pgBadgeText}>{item.pgCategory}</Text>
                    </View>

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

                    {item.verified && (
                      <View style={styles.verifiedPill}>
                        <ShieldCheck size={11} color="#059669" strokeWidth={2.5} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>

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

                    <Text style={styles.cardPrice} numberOfLines={1}>
                      {item.priceLabel}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <BedDouble size={11} color="#64748B" />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {item.sharingLabel}
                        </Text>
                      </View>
                      {item.foodIncluded && (
                        <View style={styles.metaItem}>
                          <Utensils size={10} color="#059669" />
                          <Text style={[styles.metaText, { color: '#059669' }]}>Food</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardActionsRow}>
                      {(item as any).distanceLabel ? (
                        <Text style={styles.distanceTag} numberOfLines={1}>
                          {(item as any).distanceLabel}
                        </Text>
                      ) : (
                        <View />
                      )}
                      <TouchableOpacity
                        style={styles.chatOwnerBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          push({ name: 'chat', params: { property: item } });
                        }}
                        activeOpacity={0.8}
                      >
                        <MessageSquare size={11} color="#FFFFFF" strokeWidth={2.2} />
                        <Text style={styles.chatOwnerBtnText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Sort By Bottom Sheet Modal ── */}
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

      {/* ── Location Filter Modal ── */}
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
    height: 126,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  pgBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pgBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
    padding: 11,
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
    gap: 4,
    marginBottom: 6,
  },
  cardLocation: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
  },
  cardPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
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
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  radiusPillActive: {
    backgroundColor: '#0F172A',
  },
  radiusPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  radiusPillTextActive: {
    color: '#FFFFFF',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  distanceTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chatOwnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chatOwnerBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
