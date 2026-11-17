import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

const LOCATIONS = [
  'Hyderabad',
  'Vizag',
  'Bangalore',
  'Chennai',
  'Mumbai',
  'Delhi NCR',
];

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'PG', 'Hostel'];

const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

const PARKING_OPTIONS = ['Available', 'Not Required'];

const GENDER_OPTIONS = ['All', 'Male', 'Female', 'Anyone'] as const;
type GenderOption = typeof GENDER_OPTIONS[number];

const MIN_BUDGET = 5000;
const MAX_BUDGET = 100000;

export default function FiltersScreen() {
  const { currentScreen, pop, activeFilters, setFilters, flatmatesFilters, setFlatmatesFilters } = useApp();

  // Check if opened from Flatmates page
  const isFlatmatesScope = (currentScreen.params as any)?.scope === 'flatmates';

  // Flatmates-specific Gender Preference state
  const [gender, setGender] = useState<GenderOption>(
    flatmatesFilters?.gender ?? 'All'
  );

  // Budget State (₹5,000 to ₹100,000+)
  const [budget, setBudget] = useState<number>(
    isFlatmatesScope
      ? (flatmatesFilters?.budgetMax ?? MAX_BUDGET)
      : (activeFilters?.budgetMax ?? MAX_BUDGET)
  );

  // Locations selection (multiple allowed)
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    isFlatmatesScope
      ? (flatmatesFilters?.locations || [])
      : (activeFilters?.locations || [])
  );

  // BHK Configuration
  const [bhk, setBhk] = useState<string[]>(
    isFlatmatesScope
      ? (flatmatesFilters?.bhk || [])
      : (activeFilters?.bhk || [])
  );

  // Property Type
  const [propertyType, setPropertyType] = useState<string[]>(
    isFlatmatesScope
      ? (flatmatesFilters?.propertyType || [])
      : (activeFilters?.propertyType || [])
  );

  // Furnishing
  const [furnishing, setFurnishing] = useState<string[]>(
    isFlatmatesScope
      ? (flatmatesFilters?.furnishing || [])
      : (activeFilters?.furnishing || [])
  );

  // Parking (single-select toggle)
  const [parking, setParking] = useState<string | null>(
    isFlatmatesScope
      ? (flatmatesFilters?.parking ?? null)
      : (activeFilters?.parking ?? null)
  );

  // Toggle helper for multi-select arrays
  const toggleSelection = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  // Slider layout & drag handling
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<any>(null);
  const trackLayoutRef = useRef<{ pageX: number; width: number }>({ pageX: 0, width: 0 });

  const latestBudget = useRef(budget);
  latestBudget.current = budget;

  const currentRatio = Math.max(0, Math.min(1, (budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)));

  const handlePositionChange = useCallback((clientX: number) => {
    const { pageX, width } = trackLayoutRef.current;
    const w = width > 0 ? width : trackWidth;
    if (w <= 0) return;

    const offsetX = clientX - pageX;
    const ratio = Math.max(0, Math.min(1, offsetX / w));
    // Step by 5000
    const rawVal = MIN_BUDGET + ratio * (MAX_BUDGET - MIN_BUDGET);
    const step = 5000;
    const stepped = Math.round((rawVal - MIN_BUDGET) / step) * step + MIN_BUDGET;
    const clamped = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, stepped));
    setBudget(clamped);
  }, [trackWidth]);

  const measureTrack = useCallback(() => {
    if (trackRef.current && (trackRef.current as any).measure) {
      (trackRef.current as any).measure(
        (_x: number, _y: number, width: number, _height: number, pageX: number) => {
          if (width > 0) {
            trackLayoutRef.current = { pageX, width };
            setTrackWidth(width);
          }
        }
      );
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handlePositionChange(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        handlePositionChange(evt.nativeEvent.pageX);
      },
    })
  ).current;

  // Format budget text for header display: e.g. "Up to ₹100K+" or "Up to ₹45K"
  const getBudgetText = () => {
    if (budget >= MAX_BUDGET) return '₹100K+';
    const inK = Math.round(budget / 1000);
    return `₹${inK}K`;
  };

  const handleApply = () => {
    if (isFlatmatesScope) {
      setFlatmatesFilters({
        gender,
        budgetMax: budget,
        locations: selectedLocations,
        bhk,
        propertyType,
        furnishing,
        parking,
      });
    } else {
      setFilters({
        bhk,
        propertyType,
        furnishing,
        parking,
        verifiedOnly: activeFilters?.verifiedOnly ?? false,
        budgetMax: budget,
        locations: selectedLocations,
      });
    }
    pop();
  };

  const handleCancel = () => {
    pop();
  };

  return (
    <View style={styles.container}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pop} style={styles.backCircleBtn} activeOpacity={0.8}>
          <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
      </View>

      {/* ── Scrollable Filter Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gender Preference Section (Visible for Flatmates) ── */}
        {isFlatmatesScope && (
          <View style={styles.genderSection}>
            <View style={styles.chipsContainer}>
              {GENDER_OPTIONS.map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, isSelected && styles.genderChipActive]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.genderChipText,
                        isSelected && styles.genderChipTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 1. Monthly Budget Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Monthly Budget</Text>
            <View style={styles.budgetDisplay}>
              <Text style={styles.upToLabel}>Up to </Text>
              <Text style={styles.budgetValue}>{getBudgetText()}</Text>
            </View>
          </View>

          {/* Slider Container Card */}
          <View style={styles.sliderCard}>
            <View
              ref={trackRef}
              style={styles.sliderTrackWrapper}
              onLayout={(e) => {
                const { width } = e.nativeEvent.layout;
                setTrackWidth(width);
                measureTrack();
              }}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderTrack}>
                {/* Inactive Track */}
                <View style={styles.trackBackground} />
                {/* Active Track */}
                <View
                  style={[
                    styles.trackActive,
                    { width: `${Math.round(currentRatio * 100)}%` },
                  ]}
                />
              </View>

              {/* Slider Thumb */}
              <View
                style={[
                  styles.sliderThumb,
                  {
                    left: `${Math.max(0, Math.min(96, currentRatio * 100))}%`,
                  },
                ]}
              />
            </View>

            {/* Min and Max Labels */}
            <View style={styles.sliderMinMaxRow}>
              <Text style={styles.minMaxText}>₹5K</Text>
              <Text style={styles.minMaxText}>₹100K+</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Location Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.chipsContainer}>
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocations.includes(loc);
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSelection(selectedLocations, setSelectedLocations, loc)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperText}>Select one or more cities.</Text>
        </View>

        {/* ── 3. BHK Configuration Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BHK</Text>
          <View style={styles.chipsContainer}>
            {BHK_OPTIONS.map((item) => {
              const isSelected = bhk.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSelection(bhk, setBhk, item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 4. Property Type Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.chipsContainer}>
            {PROPERTY_TYPES.map((item) => {
              const isSelected = propertyType.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSelection(propertyType, setPropertyType, item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 5. Furnishing Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Furnishing</Text>
          <View style={styles.chipsContainer}>
            {FURNISHING_OPTIONS.map((item) => {
              const isSelected = furnishing.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleSelection(furnishing, setFurnishing, item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 6. Parking Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parking</Text>
          <View style={styles.chipsContainer}>
            {PARKING_OPTIONS.map((item) => {
              const isSelected = parking === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setParking(parking === item ? null : item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Actions ── */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewResultsBtn}
          onPress={handleApply}
          activeOpacity={0.9}
        >
          <Text style={styles.viewResultsBtnText}>View Results</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 14,
    letterSpacing: -0.2,
  },

  /* ── Scroll Area ── */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  /* ── Sections ── */
  section: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  budgetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upToLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* ── Slider Card ── */
  sliderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sliderTrackWrapper: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  trackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E2E8F0',
  },
  trackActive: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  sliderMinMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  minMaxText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },

  /* ── Gender Chips (Flatmates) ── */
  genderSection: {
    marginBottom: 20,
  },
  genderChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  genderChipActive: {
    backgroundColor: '#0F172A',
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  genderChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* ── Chips ── */
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '400',
  },

  /* ── Fixed Footer ── */
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  viewResultsBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewResultsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
