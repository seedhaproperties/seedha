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
  Map,
  List,
  BedDouble,
  Bath,
  Square,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { properties } from '../data/properties';
import type { Property } from '../types';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const CATEGORY_TABS = ['All Homes', 'Independent House', 'Apartments'] as const;
type CategoryTab = typeof CATEGORY_TABS[number];

// Rental properties prioritised to match the screenshot and prompt requirements:
// Property 1: 2 BHK Independent House, Gajuwaka, Vizag (₹15,000/month, 2 Bed, 2 Bath, 1200 sq.ft, Verified)
// Property 2: 3 BHK Flat, Kondapur, Hyderabad (₹22,000/month, 3 Bed, 2 Bath, 1650 sq.ft, Verified)
// Property 3: 2 BHK Apartment, MVP Colony, Vizag (₹12,000/month, 2 Bed, 2 Bath, 1050 sq.ft)
const TARGET_RENTAL_IDS = ['2', '4', '10'];

export default function RentHomesScreen() {
  const { pop, push, savedIds, toggleSaved, activeFilters } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<CategoryTab>('All Homes');
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showSortModal, setShowSortModal] = useState(false);

  // Available Rent Properties
  const rentProperties = useMemo(() => {
    const targetProps: Property[] = [];
    TARGET_RENTAL_IDS.forEach((id) => {
      const found = properties.find((p) => p.id === id);
      if (found) targetProps.push(found);
    });

    const otherRent = properties.filter(
      (p) => p.listingType === 'rent' && !TARGET_RENTAL_IDS.includes(p.id)
    );

    return [...targetProps, ...otherRent];
  }, []);

  // Filtered and sorted properties
  const filteredProperties = useMemo(() => {
    return rentProperties
      .filter((p) => {
        // Category Filter
        if (selectedTab === 'Independent House') {
          if (p.propertyType !== 'house') return false;
        } else if (selectedTab === 'Apartments') {
          if (p.propertyType !== 'apartment') return false;
        }

        // Search Query (Filters by title, location, or city)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            p.title.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Global Filters (if applied)
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

          if (activeFilters.furnishing && activeFilters.furnishing.length > 0) {
            const matchesFurnish = activeFilters.furnishing.some(
              (f) =>
                f.toLowerCase().replace('-', ' ') ===
                p.furnishing?.toLowerCase().replace('-', ' ')
            );
            if (!matchesFurnish) return false;
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
        return 0; // relevance
      });
  }, [rentProperties, selectedTab, searchQuery, selectedSort, activeFilters]);

  const handleCardPress = (property: Property) => {
    push({ name: 'propertyDetail', params: { property, flow: 'rent' } });
  };

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
          <Text style={styles.headerTitle}>Rent Homes</Text>
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
            placeholder="Search homes..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── 3. Category Filter Chips ── */}
      <View style={styles.tabsRow}>
        {CATEGORY_TABS.map((tab) => {
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

      {/* ── 4. Sorting & View Mode Toolbar ── */}
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

        {/* Right: Map & List View Toggle Buttons */}
        <View style={styles.viewModeGroup}>
          <TouchableOpacity
            style={[
              styles.viewIconButton,
              viewMode === 'map' ? styles.viewIconButtonActive : styles.viewIconButtonInactive,
            ]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            <Map
              size={15}
              color={viewMode === 'map' ? '#FFFFFF' : '#64748B'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewIconButton,
              viewMode === 'grid' ? styles.viewIconButtonActive : styles.viewIconButtonInactive,
            ]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.8}
          >
            <List
              size={15}
              color={viewMode === 'grid' ? '#FFFFFF' : '#64748B'}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 5. Property Grid / Map View Presentation ── */}
      {viewMode === 'map' ? (
        <View style={styles.mapPlaceholder}>
          <Map size={36} color="#64748B" strokeWidth={1.8} />
          <Text style={styles.mapPlaceholderTitle}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtitle}>
            Showing {filteredProperties.length} rental properties across Vizag & Hyderabad
          </Text>
          <TouchableOpacity
            style={styles.switchGridBtn}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.8}
          >
            <Text style={styles.switchGridBtnText}>Switch to Grid View</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredProperties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No rental homes found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or switching category filters.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedTab('All Homes');
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

                      {/* Top-Left: Purple 'For Rent' Badge */}
                      <View style={styles.forRentBadge}>
                        <Text style={styles.forRentText}>For Rent</Text>
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
                        {item.priceLabel || `₹${item.price.toLocaleString('en-IN')}/month`}
                      </Text>

                      {/* Specifications Row: Beds, Baths, Area */}
                      <View style={styles.specsRow}>
                        {item.bedrooms > 0 && (
                          <View style={styles.specItem}>
                            <BedDouble size={11} color="#94A3B8" strokeWidth={1.8} />
                            <Text style={styles.specText}>{item.bedrooms} Bed</Text>
                          </View>
                        )}
                        <View style={styles.specItem}>
                          <Bath size={11} color="#94A3B8" strokeWidth={1.8} />
                          <Text style={styles.specText}>{item.bathrooms} Bath</Text>
                        </View>
                        {item.area > 0 && (
                          <View style={styles.specItem}>
                            <Square size={10} color="#94A3B8" strokeWidth={1.8} />
                            <Text style={styles.specText}>{item.area} sq.ft</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── 6. Sorting Bottom Sheet (Matching Screenshot) ── */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.bottomSheetContent} onStartShouldSetResponder={() => true}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Title */}
            <Text style={styles.sheetTitle}>Sort By</Text>

            {/* Options List */}
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

  /* ── Category Filter Tabs ── */
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

  /* ── Controls Row (Relevance + View Mode Icons) ── */
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
  viewModeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  viewIconButtonActive: {
    backgroundColor: '#000000',
  },
  viewIconButtonInactive: {
    backgroundColor: '#FFFFFF',
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

  /* ── Card Styles ── */
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
  forRentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8B5CF6', // Purple For Rent badge matching reference
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  forRentText: {
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
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
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

  /* Map View Placeholder */
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mapPlaceholderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  mapPlaceholderSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  switchGridBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  switchGridBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Sorting Bottom Sheet ── */
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
