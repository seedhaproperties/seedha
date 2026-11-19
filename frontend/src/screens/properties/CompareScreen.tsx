import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  BarChart2,
  Check,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { properties } from '../../data/properties';
import type { Property } from '../../types';

type DetailRow = {
  label: string;
  keyA: (p: Property) => string;
  isDiff: (p1: Property, p2: Property) => boolean;
};

const DETAIL_ROWS: DetailRow[] = [
  {
    label: 'Price',
    keyA: (p) => p.priceLabel,
    isDiff: (p1, p2) => p1.price !== p2.price,
  },
  {
    label: 'Area',
    keyA: (p) => `${p.area} sq.ft`,
    isDiff: (p1, p2) => p1.area !== p2.area,
  },
  {
    label: 'BHK',
    keyA: (p) => (p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'N/A'),
    isDiff: (p1, p2) => p1.bedrooms !== p2.bedrooms,
  },
  {
    label: 'Bathrooms',
    keyA: (p) => `${p.bathrooms}`,
    isDiff: (p1, p2) => p1.bathrooms !== p2.bathrooms,
  },
  {
    label: 'Balconies',
    keyA: (p) => (p.id === '1' ? '2' : p.id === '2' ? '1' : '2'),
    isDiff: (p1, p2) => (p1.id === '1' ? '2' : '1') !== (p2.id === '1' ? '2' : '1'),
  },
  {
    label: 'Furnishing',
    keyA: (p) =>
      p.furnishing
        ? p.furnishing
            .split('-')
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(' ')
        : 'Semi Furnished',
    isDiff: (p1, p2) => p1.furnishing !== p2.furnishing,
  },
  {
    label: 'Parking',
    keyA: (p) => (p.parking ? 'Available' : 'Not Available'),
    isDiff: (p1, p2) => p1.parking !== p2.parking,
  },
  {
    label: 'Floor',
    keyA: (p) => p.floor ?? (p.propertyType === 'villa' || p.propertyType === 'house' ? 'Ground' : '—'),
    isDiff: (p1, p2) => (p1.floor ?? 'Ground') !== (p2.floor ?? 'Ground'),
  },
  {
    label: 'Property Age',
    keyA: (p) => (p.yearBuilt ? `${new Date().getFullYear() - p.yearBuilt} years` : '4 years'),
    isDiff: (p1, p2) => (p1.yearBuilt ?? 2020) !== (p2.yearBuilt ?? 2022),
  },
  {
    label: 'Possession',
    keyA: (p) => p.possessionDate ?? 'Ready to Move',
    isDiff: (p1, p2) => (p1.possessionDate ?? 'Ready') !== (p2.possessionDate ?? 'Ready'),
  },
  {
    label: 'Facing',
    keyA: (p) => p.facing ?? 'East',
    isDiff: (p1, p2) => (p1.facing ?? 'East') !== (p2.facing ?? 'North'),
  },
  {
    label: 'Property Type',
    keyA: (p) =>
      p.propertyType
        ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1)
        : 'Apartment',
    isDiff: (p1, p2) => p1.propertyType !== p2.propertyType,
  },
];

const AMENITY_ITEMS = [
  'Gym',
  'Swimming Pool',
  'Parking',
  'Security',
  'Lift',
  'Power Backup',
  'Clubhouse',
  'WiFi',
];

export default function CompareScreen() {
  const { currentScreen, pop, push } = useApp();
  const insets = useSafeAreaInsets();
  const propParam = currentScreen.params?.property as Property | undefined;
  const flowParam = currentScreen.params?.flow as string | undefined;

  // Identify whether Compare was opened from the Flatmates flow
  const isFlatmatesCompare =
    flowParam === 'flatmates' ||
    (propParam && (
      (propParam as any).roomType !== undefined ||
      (propParam.id && propParam.id.startsWith('fm-')) ||
      (propParam.description && propParam.description.toLowerCase().includes('flatmate'))
    ));

  // Property A is retained automatically from params or defaults to first property
  const [propertyA, setPropertyA] = useState<Property>(propParam ?? properties[0]);

  // Property B starts as null so that the user first sees the Selection screen (Image 2)
  const [propertyB, setPropertyB] = useState<Property | null>(null);

  const [showPickerModal, setShowPickerModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState<'A' | 'B'>('B');

  // List of pickable properties excluding propertyA (and propertyB when comparing)
  const availableProperties = properties.filter((p) => p.id !== propertyA.id);

  // Check if a property has a specific amenity
  const checkAmenity = (p: Property | null, amenityName: string) => {
    if (!p) return false;
    const nameLower = amenityName.toLowerCase();
    return p.amenities.some((a) => a.toLowerCase().includes(nameLower));
  };

  // Category Badge matching Image 2 (For Rent purple, For Sale green, Commercial amber)
  const getCategoryBadgeInfo = (p: Property) => {
    if (isFlatmatesCompare || p.listingType === 'rent') {
      return { label: 'For Rent', bgColor: '#8B5CF6', textColor: '#FFFFFF' };
    }
    if (p.listingType === 'commercial') {
      return { label: 'Commercial', bgColor: '#F59E0B', textColor: '#FFFFFF' };
    }
    return { label: 'For Sale', bgColor: '#16A34A', textColor: '#FFFFFF' };
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Top Header Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (propertyB) {
              // If currently viewing comparison results, going back returns to property selection screen
              setPropertyB(null);
            } else {
              pop();
            }
          }}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Compare Properties</Text>
          <Text style={styles.headerSubtitle}>
            {propertyB ? 'Side-by-side comparison' : 'Select a property to compare'}
          </Text>
        </View>

        {/* If in results view, show top-right switch icon */}
        {propertyB && (
          <TouchableOpacity
            onPress={() => {
              setTargetSlot('B');
              setShowPickerModal(true);
            }}
            style={styles.topRightIconBtn}
            activeOpacity={0.8}
          >
            <ArrowUpDown size={18} color="#1E293B" strokeWidth={2.2} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. Top Slots Row ── */}
        <View style={styles.topSlotsRow}>
          {/* Slot 1: Property A */}
          <View style={styles.slotCol}>
            <TouchableOpacity
              onPress={() => push({ name: 'propertyDetail', params: { property: propertyA } })}
              style={styles.propertyThumbCard}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: propertyA.image }}
                style={styles.thumbImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />

              {/* 'A' badge & verified badge */}
              <View style={styles.badgeLetter}>
                <Text style={styles.badgeLetterText}>A</Text>
              </View>

              {propertyA.verified && (
                <View style={styles.badgeVerified}>
                  <ShieldCheck size={14} color="#FFFFFF" />
                </View>
              )}

              {/* Overlaid Title & Location */}
              <View style={styles.propertyThumbMeta}>
                <Text style={styles.propertyThumbTitle} numberOfLines={1}>
                  {propertyA.title}
                </Text>
                <Text style={styles.propertyThumbLocation} numberOfLines={1}>
                  {propertyA.location}
                </Text>
              </View>
            </TouchableOpacity>

            {propertyB && (
              <TouchableOpacity
                onPress={() => {
                  setTargetSlot('A');
                  setShowPickerModal(true);
                }}
                style={styles.changeTextBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.changeTextBtnLabel}>Change</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Slot 2: Property B or "Tap to add property" Card */}
          <View style={styles.slotCol}>
            {propertyB ? (
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => push({ name: 'propertyDetail', params: { property: propertyB } })}
                  style={styles.propertyThumbCard}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: propertyB.image }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />

                  {/* 'B' badge & verified badge */}
                  <View style={styles.badgeLetter}>
                    <Text style={styles.badgeLetterText}>B</Text>
                  </View>

                  {propertyB.verified && (
                    <View style={styles.badgeVerified}>
                      <ShieldCheck size={14} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Overlaid Title & Location */}
                  <View style={styles.propertyThumbMeta}>
                    <Text style={styles.propertyThumbTitle} numberOfLines={1}>
                      {propertyB.title}
                    </Text>
                    <Text style={styles.propertyThumbLocation} numberOfLines={1}>
                      {propertyB.location}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setTargetSlot('B');
                    setShowPickerModal(true);
                  }}
                  style={styles.changeTextBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeTextBtnLabel}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Tap to add property empty dashed card (Matches Image 2) */
              <TouchableOpacity
                style={styles.tapToAddCard}
                onPress={() => {
                  setTargetSlot('B');
                  setShowPickerModal(true);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.chartIconCircle}>
                  <BarChart2 size={22} color="#1E293B" strokeWidth={2} />
                </View>
                <Text style={styles.tapToAddText}>Tap to add property</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 3. Content: Selection Screen List vs Side-by-Side Comparison Results ── */}
        {!propertyB ? (
          /* ── STEP 1: Property Selection Screen (Matches Image 2) ── */
          <View style={styles.pickSection}>
            <Text style={styles.pickHeading}>Select a property to compare with</Text>

            <View style={styles.propertyListCol}>
              {availableProperties.map((p) => {
                const badge = getCategoryBadgeInfo(p);
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPropertyB(p)}
                    style={styles.propertyItemCard}
                    activeOpacity={0.8}
                  >
                    {/* Left Thumbnail */}
                    <Image
                      source={{ uri: p.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    {/* Middle Info */}
                    <View style={styles.itemInfo}>
                      <View style={styles.itemBadgeRow}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: badge.bgColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              { color: badge.textColor },
                            ]}
                          >
                            {badge.label}
                          </Text>
                        </View>
                        {p.verified && (
                          <ShieldCheck size={14} color="#64748B" />
                        )}
                      </View>

                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {p.title}
                      </Text>

                      <Text style={styles.itemLocation} numberOfLines={1}>
                        {p.location}
                      </Text>

                      <Text style={styles.itemPrice} numberOfLines={1}>
                        {p.priceLabel}
                      </Text>
                    </View>

                    {/* Right Chevron Arrow */}
                    <ChevronRight size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* ── STEP 2: Comparison Results Screen (Matches Image 1) ── */
          <View>
            {/* Comparison Table */}
            <View style={styles.tableCard}>
              {DETAIL_ROWS.map((row) => {
                const valA = row.keyA(propertyA);
                const valB = row.keyA(propertyB);
                const hasDiff = row.isDiff(propertyA, propertyB);

                return (
                  <View
                    key={row.label}
                    style={[
                      styles.tableRow,
                      hasDiff && styles.diffHighlightRow,
                    ]}
                  >
                    <Text style={styles.tableLabelCell}>{row.label}</Text>
                    <Text
                      style={[
                        styles.tableValueCell,
                        styles.tableValueCellA,
                      ]}
                      numberOfLines={1}
                    >
                      {valA}
                    </Text>
                    <View style={styles.rightValueCellContainer}>
                      <Text
                        style={[
                          styles.tableValueCell,
                          styles.tableValueCellB,
                        ]}
                        numberOfLines={1}
                      >
                        {valB}
                      </Text>
                      {hasDiff && (
                        <View style={styles.diffDotIndicator}>
                          <Text style={styles.diffDiamondSymbol}>◆</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Amenities Section */}
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>

              <View style={styles.amenitiesCard}>
                <View style={styles.amenitiesHeaderRow}>
                  <View style={styles.amenityNameCol} />
                  <View style={styles.amenityColHeader}>
                    <Text style={styles.amenityColHeaderText}>A</Text>
                  </View>
                  <View style={styles.amenityColHeader}>
                    <Text style={styles.amenityColHeaderText}>B</Text>
                  </View>
                </View>

                {AMENITY_ITEMS.map((amenity, idx) => {
                  const hasA = checkAmenity(propertyA, amenity);
                  const hasB = checkAmenity(propertyB, amenity);

                  return (
                    <View
                      key={amenity}
                      style={[
                        styles.amenityItemRow,
                        idx > 0 && styles.amenityItemBorder,
                      ]}
                    >
                      <Text style={styles.amenityNameText}>{amenity}</Text>

                      <View style={styles.amenityIconCol}>
                        {hasA ? (
                          <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.2} />
                        ) : (
                          <XCircle size={18} color="#CBD5E1" strokeWidth={1.8} />
                        )}
                      </View>

                      <View style={styles.amenityIconCol}>
                        {hasB ? (
                          <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.2} />
                        ) : (
                          <XCircle size={18} color="#CBD5E1" strokeWidth={1.8} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Comparison Insight / Legend Card */}
            <View style={styles.legendCard}>
              <Text style={styles.legendTitle}>Comparison legend</Text>
              <View style={styles.legendRow}>
                <Text style={styles.legendDiamond}>◆</Text>
                <Text style={styles.legendText}>
                  Highlighted rows indicate different values
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── 4. Fixed Bottom Action Buttons (Only in Step 2 Results View) ── */}
      {propertyB && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            onPress={() => push({ name: 'propertyDetail', params: { property: propertyA } })}
            style={styles.viewABtn}
            activeOpacity={0.85}
          >
            <Text style={styles.viewABtnText}>View A</Text>
            <ChevronRight size={16} color="#1E293B" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => push({ name: 'propertyDetail', params: { property: propertyB } })}
            style={styles.viewBBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.viewBBtnText}>View B</Text>
            <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── 5. Change Property Modal Picker (For swapping A or B in results view) ── */}
      <Modal
        visible={showPickerModal}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPickerModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Select Property {targetSlot}
              </Text>
              <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {properties
                .filter((p) => p.id !== (targetSlot === 'A' ? propertyB?.id : propertyA.id))
                .map((p) => {
                  const isSelected =
                    targetSlot === 'A' ? propertyA.id === p.id : propertyB?.id === p.id;
                  const badge = getCategoryBadgeInfo(p);

                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => {
                        if (targetSlot === 'A') {
                          setPropertyA(p);
                        } else {
                          setPropertyB(p);
                        }
                        setShowPickerModal(false);
                      }}
                      style={[
                        styles.modalPropertyCard,
                        isSelected && styles.modalPropertyCardSelected,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: p.image }}
                        style={styles.modalItemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.modalItemInfo}>
                        <View style={styles.categoryBadgeRow}>
                          <View
                            style={[
                              styles.categoryBadge,
                              { backgroundColor: badge.bgColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryBadgeText,
                                { color: badge.textColor },
                              ]}
                            >
                              {badge.label}
                            </Text>
                          </View>
                          {p.verified && (
                            <ShieldCheck size={13} color="#64748B" />
                          )}
                        </View>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={styles.itemLocation} numberOfLines={1}>
                          {p.location}
                        </Text>
                        <Text style={styles.itemPrice} numberOfLines={1}>
                          {p.priceLabel}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Check size={18} color="#16A34A" strokeWidth={2.5} />
                      ) : (
                        <ChevronRight size={16} color="#CBD5E1" />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F1F5F9',
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
  headerTextCol: {
    marginLeft: 14,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  topRightIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  /* ── Scroll Area ── */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  /* ── Top Side-By-Side Property Cards ── */
  topSlotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  slotCol: {
    flex: 1,
  },
  propertyThumbCard: {
    width: '100%',
    height: 135,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  badgeLetter: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeVerified: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  propertyThumbMeta: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  propertyThumbTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  propertyThumbLocation: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  changeTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    alignSelf: 'center',
  },
  changeTextBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },

  /* ── Empty Add Card (Image 2) ── */
  tapToAddCard: {
    width: '100%',
    height: 135,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chartIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAE7E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tapToAddText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },

  /* ── Pick Section (Step 1) ── */
  pickSection: {
    marginTop: 2,
  },
  pickHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  propertyListCol: {
    gap: 12,
  },
  propertyItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },

  /* ── Comparison Table (Step 2) ── */
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  diffHighlightRow: {
    backgroundColor: '#FFFBEB',
  },
  tableLabelCell: {
    flex: 1.1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tableValueCell: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  tableValueCellA: {
    flex: 1.2,
  },
  rightValueCellContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableValueCellB: {
    flex: 1,
  },
  diffDotIndicator: {
    marginLeft: 4,
  },
  diffDiamondSymbol: {
    fontSize: 10,
    color: '#D97706',
  },

  /* ── Amenities Section ── */
  amenitiesSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  amenitiesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  amenitiesHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  amenityNameCol: {
    flex: 2,
  },
  amenityColHeader: {
    flex: 1,
    alignItems: 'center',
  },
  amenityColHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  amenityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  amenityItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F8FAFC',
  },
  amenityNameText: {
    flex: 2,
    fontSize: 12.5,
    color: '#1E293B',
    fontWeight: '500',
  },
  amenityIconCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Comparison Legend ── */
  legendCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDiamond: {
    fontSize: 9,
    color: '#D97706',
  },
  legendText: {
    fontSize: 11.5,
    color: '#64748B',
  },

  /* ── Fixed Bottom Actions ── */
  footerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#F1F5F9',
    gap: 12,
  },
  viewABtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewABtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewBBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewBBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Modal Picker ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalPropertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalPropertyCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  modalItemImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
  },
  modalItemInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
});
