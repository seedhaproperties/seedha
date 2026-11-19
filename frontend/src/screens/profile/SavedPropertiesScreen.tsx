import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  SlidersHorizontal,
  Heart,
  MapPin,
  Bed,
  Square,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface SavedItem {
  id: string;
  title: string;
  price: string;
  numericPrice: number;
  location: string;
  city: 'Vizag' | 'Hyderabad';
  category: 'buy' | 'rent' | 'commercial';
  badgeType: 'Buy' | 'Rent' | 'Commercial';
  badgeColor: string;
  bedrooms: number;
  area: string;
  verified: boolean;
  image: string;
  savedTimestamp: number;
}

const initialSavedProperties: SavedItem[] = [
  {
    id: 'saved-1',
    title: '3 BHK Apartment',
    price: '₹85,00,000',
    numericPrice: 8500000,
    location: 'Madhurawada, Vizag',
    city: 'Vizag',
    category: 'buy',
    badgeType: 'Buy',
    badgeColor: '#10B981',
    bedrooms: 3,
    area: '1450 sq.ft',
    verified: true,
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&h=500&fit=crop&auto=format',
    savedTimestamp: 3,
  },
  {
    id: 'saved-2',
    title: '4 BHK Premium Villa',
    price: '₹1,85,00,000',
    numericPrice: 18500000,
    location: 'Gachibowli, Hyderabad',
    city: 'Hyderabad',
    category: 'buy',
    badgeType: 'Buy',
    badgeColor: '#10B981',
    bedrooms: 4,
    area: '3200 sq.ft',
    verified: true,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&auto=format',
    savedTimestamp: 2,
  },
  {
    id: 'saved-3',
    title: '2 BHK Luxury Apartment',
    price: '₹45,000 / mo',
    numericPrice: 45000,
    location: 'Banjara Hills, Hyderabad',
    city: 'Hyderabad',
    category: 'rent',
    badgeType: 'Rent',
    badgeColor: '#0284C7',
    bedrooms: 2,
    area: '1100 sq.ft',
    verified: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
    savedTimestamp: 1,
  },
];

export default function SavedPropertiesScreen() {
  const { pop, push, setTab } = useApp();
  const insets = useSafeAreaInsets();

  const [properties, setProperties] = useState<SavedItem[]>(initialSavedProperties);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'buy' | 'rent' | 'commercial'>('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Filter States
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high'>('recent');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Temporary filter states inside modal
  const [tempSortBy, setTempSortBy] = useState<'recent' | 'price_low' | 'price_high'>('recent');
  const [tempCity, setTempCity] = useState<string | null>(null);
  const [tempVerifiedOnly, setTempVerifiedOnly] = useState(false);

  const toggleHeart = (id: string) => {
    setProperties((prev) => prev.filter((item) => item.id !== id));
  };

  const openFilterModal = () => {
    setTempSortBy(sortBy);
    setTempCity(selectedCity);
    setTempVerifiedOnly(verifiedOnly);
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSelectedCity(tempCity);
    setVerifiedOnly(tempVerifiedOnly);
    setIsFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempSortBy('recent');
    setTempCity(null);
    setTempVerifiedOnly(false);
  };

  const counts = useMemo(() => {
    return {
      all: properties.length,
      buy: properties.filter((p) => p.category === 'buy').length,
      rent: properties.filter((p) => p.category === 'rent').length,
      commercial: properties.filter((p) => p.category === 'commercial').length,
    };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let list = [...properties];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedCity) {
      list = list.filter((p) => p.city === selectedCity);
    }

    if (verifiedOnly) {
      list = list.filter((p) => p.verified);
    }

    if (sortBy === 'recent') {
      list.sort((a, b) => b.savedTimestamp - a.savedTimestamp);
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.numericPrice - a.numericPrice);
    }

    return list;
  }, [properties, selectedCategory, selectedCity, verifiedOnly, sortBy]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (pop) pop();
              else setTab('profile');
            }}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.pageTitle}>Saved Properties</Text>
            <Text style={styles.subtitle}>{properties.length} saved</Text>
          </View>
        </View>

        {/* Filters Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={openFilterModal}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={14} color="#1E293B" strokeWidth={2.2} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {/* All */}
          <TouchableOpacity
            style={[styles.tabPill, selectedCategory === 'all' && styles.tabPillActive]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, selectedCategory === 'all' && styles.tabPillTextActive]}>
              All
            </Text>
            <View style={[styles.tabBadge, selectedCategory === 'all' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedCategory === 'all' && styles.tabBadgeTextActive]}>
                {counts.all}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Buy */}
          <TouchableOpacity
            style={[styles.tabPill, selectedCategory === 'buy' && styles.tabPillActive]}
            onPress={() => setSelectedCategory('buy')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, selectedCategory === 'buy' && styles.tabPillTextActive]}>
              Buy
            </Text>
            <View style={[styles.tabBadge, selectedCategory === 'buy' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedCategory === 'buy' && styles.tabBadgeTextActive]}>
                {counts.buy}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Rent */}
          <TouchableOpacity
            style={[styles.tabPill, selectedCategory === 'rent' && styles.tabPillActive]}
            onPress={() => setSelectedCategory('rent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, selectedCategory === 'rent' && styles.tabPillTextActive]}>
              Rent
            </Text>
            <View style={[styles.tabBadge, selectedCategory === 'rent' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedCategory === 'rent' && styles.tabBadgeTextActive]}>
                {counts.rent}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Commercial */}
          <TouchableOpacity
            style={[styles.tabPill, selectedCategory === 'commercial' && styles.tabPillActive]}
            onPress={() => setSelectedCategory('commercial')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, selectedCategory === 'commercial' && styles.tabPillTextActive]}>
              Commercial
            </Text>
            <View style={[styles.tabBadge, selectedCategory === 'commercial' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedCategory === 'commercial' && styles.tabBadgeTextActive]}>
                {counts.commercial}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Property Cards List */}
      <ScrollView
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No saved properties match</Text>
            <Text style={styles.emptySubtitle}>Try changing your filter settings or category</Text>
          </View>
        ) : (
          filteredProperties.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.propertyCard}
              onPress={() => push({ name: 'propertyDetail', params: { id: item.id } })}
              activeOpacity={0.9}
            >
              {/* Card Image Banner */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.propertyImage} />

                {/* Left Category Badge */}
                <View style={[styles.typeBadge, { backgroundColor: item.badgeColor }]}>
                  <Text style={styles.typeBadgeText}>{item.badgeType}</Text>
                </View>

                {/* Right Heart Button */}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => toggleHeart(item.id)}
                  activeOpacity={0.85}
                >
                  <Heart size={18} color="#EF4444" fill="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* Title & Price */}
                <View style={styles.titlePriceRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                </View>

                {/* Location */}
                <View style={styles.locationRow}>
                  <MapPin size={13} color="#64748B" strokeWidth={2} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>

                {/* Amenities Pills */}
                <View style={styles.specsRow}>
                  <View style={styles.specPill}>
                    <Bed size={13} color="#64748B" strokeWidth={2} />
                    <Text style={styles.specText}>{item.bedrooms} Beds</Text>
                  </View>

                  <View style={styles.specPill}>
                    <Square size={12} color="#64748B" strokeWidth={2} />
                    <Text style={styles.specText}>{item.area}</Text>
                  </View>

                  {item.verified && (
                    <View style={[styles.specPill, styles.verifiedPill]}>
                      <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalOverlayTouch}
            onPress={() => setIsFilterModalVisible(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter saved</Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                activeOpacity={0.7}
                style={styles.closeButton}
              >
                <X size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Sort by */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort by</Text>
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[styles.filterPill, tempSortBy === 'recent' && styles.filterPillActive]}
                  onPress={() => setTempSortBy('recent')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, tempSortBy === 'recent' && styles.filterPillTextActive]}>
                    Recently saved
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, tempSortBy === 'price_low' && styles.filterPillActive]}
                  onPress={() => setTempSortBy('price_low')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, tempSortBy === 'price_low' && styles.filterPillTextActive]}>
                    Price: Low
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, tempSortBy === 'price_high' && styles.filterPillActive]}
                  onPress={() => setTempSortBy('price_high')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, tempSortBy === 'price_high' && styles.filterPillTextActive]}>
                    Price: High
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* City */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>City</Text>
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[styles.filterPill, tempCity === 'Vizag' && styles.filterPillActive]}
                  onPress={() => setTempCity(tempCity === 'Vizag' ? null : 'Vizag')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, tempCity === 'Vizag' && styles.filterPillTextActive]}>
                    Vizag
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, tempCity === 'Hyderabad' && styles.filterPillActive]}
                  onPress={() => setTempCity(tempCity === 'Hyderabad' ? null : 'Hyderabad')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, tempCity === 'Hyderabad' && styles.filterPillTextActive]}>
                    Hyderabad
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Verified listings only */}
            <View style={styles.switchBox}>
              <Text style={styles.switchLabel}>Verified listings only</Text>
              <Switch
                value={tempVerifiedOnly}
                onValueChange={setTempVerifiedOnly}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
                activeOpacity={0.85}
              >
                <Text style={styles.applyButtonText}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitles: {
    marginLeft: 14,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 6,
  },
  tabsContainer: {
    paddingVertical: 10,
  },
  tabsContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: '#334155',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBadgeTextActive: {
    color: '#CBD5E1',
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  imageContainer: {
    position: 'relative',
    height: 190,
    width: '100%',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBody: {
    padding: 16,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  specText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 5,
    fontWeight: '500',
  },
  verifiedPill: {
    backgroundColor: '#ECFDF5',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 18,
  },
  filterLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '500',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  switchBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
