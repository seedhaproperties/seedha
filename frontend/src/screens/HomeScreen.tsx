import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import {
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Landmark,
  House,
  KeyRound,
  Building2,
  HousePlus,
  ShieldCheck,
  Search,
  ShieldAlert,
  FileText,
  UserCheck,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { properties } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import colors from '../theme/colors';

const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&h=420&fit=crop&auto=format',
    tag: '✨ SEEDHA PREMIER COLLECTION',
    headline: 'Buy, Rent, Invest & Manage All in One Place',
    sub: 'Verified luxury homes, prime city locations & direct owners.',
    cta: 'Explore All Properties',
    targetScreen: 'explore',
  },
  {
    img: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=420&fit=crop&auto=format',
    tag: '🛡️ 100% TITLE VERIFIED',
    headline: 'Find verified properties for your next move.',
    sub: 'Gated communities & luxury villas with zero hidden brokerage.',
    cta: 'View Verified Homes',
    targetScreen: 'propertyListing',
    params: { type: 'buy', title: 'Buy Properties' },
  },
  {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop&auto=format',
    tag: '⚡ DIRECT OWNER REACH',
    headline: 'Reach genuine buyers & verified tenants faster.',
    sub: 'Free direct property listing with 24hr legal support.',
    cta: 'Post Property Free',
    targetScreen: 'postProperty',
  },
  {
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=420&fit=crop&auto=format',
    tag: '🔑 FULL PROPERTY CARE (FLOW D)',
    headline: 'Rent, repairs, tenants and care in one place.',
    sub: 'Dedicated field check & direct admin management.',
    cta: 'Explore Property Care',
    targetScreen: 'propertyManagement',
  },
  {
    img: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=420&fit=crop&auto=format',
    tag: '🏛️ LOWEST HOME LOAN RATES (FLOW E)',
    headline: 'Instant EMI check & top bank loan approvals.',
    sub: 'Competitive rates starting from 8.35% p.a. with zero fee assistance.',
    cta: 'Check Eligibility',
    targetScreen: 'homeLoan',
  },
];

// Reusable micro-animated card wrapper with spring tactile feedback
const AnimatedCard = ({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: isNative, speed: 25 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: isNative }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.92}
        style={styles.fullTouch}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const { push, savedIds, notifications, setTab } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const recommended = properties.slice(0, 4);

  // Auto-slide logic (Every 3.8 seconds)
  const startAutoSlide = () => {
    stopAutoSlide();
    slideTimer.current = setInterval(() => {
      handleNextSlide();
    }, 3800);
  };

  const stopAutoSlide = () => {
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
      slideTimer.current = null;
    }
  };

  const isNative = Platform.OS !== 'web';

  const handleNextSlide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.25,
      duration: 220,
      useNativeDriver: isNative,
    }).start(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: isNative,
      }).start();
    });
  };

  const handlePrevSlide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.25,
      duration: 220,
      useNativeDriver: isNative,
    }).start(() => {
      setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: isNative,
      }).start();
    });
  };

  const handleManualSelectSlide = (index: number) => {
    stopAutoSlide();
    Animated.timing(fadeAnim, {
      toValue: 0.25,
      duration: 180,
      useNativeDriver: isNative,
    }).start(() => {
      setActiveSlide(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: isNative,
      }).start(() => {
        startAutoSlide();
      });
    });
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 40) {
          stopAutoSlide();
          handlePrevSlide();
          startAutoSlide();
        } else if (gestureState.dx < -40) {
          stopAutoSlide();
          handleNextSlide();
          startAutoSlide();
        }
      },
    })
  ).current;

  const currentHero = heroSlides[activeSlide];

  const handleSearchOption = (type: 'buy' | 'rent' | 'commercial') => {
    if (type === 'buy') push({ name: 'propertyListing', params: { type: 'buy', title: 'Buy Properties' } });
    else if (type === 'rent') push({ name: 'propertyListing', params: { type: 'rent', title: 'Rent Homes' } });
    else if (type === 'commercial') push({ name: 'propertyListing', params: { type: 'commercial', title: 'Commercial Spaces' } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.greetingBadge}>
              <Sparkles size={11} color={colors.gold} strokeWidth={2.4} style={{ marginRight: 4 }} />
              <Text style={styles.greetingText}>Seedha Premier Real-Estate</Text>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Namaste, Rahul</Text>
              <Text style={styles.waveEmoji}> ✨</Text>
            </View>
            <Text style={styles.subGreeting}>Direct verified owners · Zero hidden charges</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => push({ name: 'notifications' })}
              style={styles.iconCircle}
              activeOpacity={0.8}
            >
              <Bell size={18} strokeWidth={2.2} color={colors.primary} />
              {notifications > 0 && <View style={styles.notifBadge} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => push({ name: 'profile' })}
              style={styles.avatarButton}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format' }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            onPress={() => push({ name: 'search' })}
            style={styles.searchBar}
            activeOpacity={0.9}
          >
            <Search size={16} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.searchPlaceholder}>Search location, project or landmark...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => push({ name: 'filters' })}
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={16} strokeWidth={2.2} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 1. Animated Hero Carousel ── */}
      <View style={styles.sectionPadding}>
        <View style={styles.bannerCard} {...panResponder.panHandlers}>
          <Animated.Image source={{ uri: currentHero.img }} style={[styles.bannerImage, { opacity: fadeAnim }]} />
          <View style={styles.bannerOverlay} />
          <Animated.View style={[styles.bannerContent, { opacity: fadeAnim }]}>
            <View>
              <View style={styles.bannerTagPill}>
                <Text style={styles.bannerTag}>{currentHero.tag}</Text>
              </View>
              <Text style={styles.bannerHeadline}>{currentHero.headline}</Text>
              <Text style={styles.bannerSub}>{currentHero.sub}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (currentHero.targetScreen === 'explore') setTab('explore');
                else push({ name: currentHero.targetScreen as any, params: currentHero.params });
              }}
              style={styles.bannerCta}
              activeOpacity={0.9}
            >
              <Text style={styles.bannerCtaText}>{currentHero.cta}</Text>
              <View style={styles.bannerCtaIcon}>
                <ChevronRight size={12} color={colors.textWhite} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Carousel Pagination Dots */}
          <View style={styles.paginationDots}>
            {heroSlides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleManualSelectSlide(i)}
                style={[
                  styles.dot,
                  {
                    width: i === activeSlide ? 20 : 6,
                    backgroundColor: i === activeSlide ? colors.goldLight : 'rgba(255,255,255,0.45)',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* ── Luxury Trust Strip ── */}
      <View style={styles.sectionPadding}>
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <Sparkles size={13} color={colors.gold} strokeWidth={2.4} />
            <Text style={styles.trustText}>Direct Owners</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <ShieldCheck size={13} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.trustText}>Title Verified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={13} color={colors.success} strokeWidth={2.4} />
            <Text style={styles.trustText}>₹0 Brokerage</Text>
          </View>
        </View>
      </View>

      {/* ── 2. Search Property Group (Buy | Rent | Commercial) ── */}
      <View style={styles.sectionPadding}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.groupSectionTitle}>Search Property</Text>
          <Text style={styles.groupSectionTag}>DIRECT LISTINGS</Text>
        </View>
        <View style={styles.searchPropertyGrid}>
          {/* Buy */}
          <AnimatedCard onPress={() => handleSearchOption('buy')} style={styles.searchOptionCardWrapper}>
            <View style={styles.searchOptionCard}>
              <View style={[styles.searchOptionIconBox, { backgroundColor: colors.primaryBg }]}>
                <House size={20} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.searchOptionTitle}>Buy</Text>
              <Text style={styles.searchOptionSub}>Gated homes & flats</Text>
            </View>
          </AnimatedCard>

          {/* Rent */}
          <AnimatedCard onPress={() => handleSearchOption('rent')} style={styles.searchOptionCardWrapper}>
            <View style={styles.searchOptionCard}>
              <View style={[styles.searchOptionIconBox, { backgroundColor: colors.secondaryBg }]}>
                <KeyRound size={20} color={colors.secondary} strokeWidth={2.2} />
              </View>
              <Text style={styles.searchOptionTitle}>Rent</Text>
              <Text style={styles.searchOptionSub}>Verified owner homes</Text>
            </View>
          </AnimatedCard>

          {/* Commercial */}
          <AnimatedCard onPress={() => handleSearchOption('commercial')} style={styles.searchOptionCardWrapper}>
            <View style={styles.searchOptionCard}>
              <View style={[styles.searchOptionIconBox, { backgroundColor: colors.accentBg }]}>
                <Building2 size={20} color={colors.accent} strokeWidth={2.2} />
              </View>
              <Text style={styles.searchOptionTitle}>Commercial</Text>
              <Text style={styles.searchOptionSub}>Offices & retail space</Text>
            </View>
          </AnimatedCard>
        </View>
      </View>

      {/* ── 3. More Services Group ── */}
      <View style={styles.sectionPadding}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.groupSectionTitle}>Specialized Services</Text>
          <Text style={styles.groupSectionTag}>END-TO-END FLOWS</Text>
        </View>
        <View style={styles.moreServicesGrid}>
          {/* Property Management (Flow D) */}
          <AnimatedCard onPress={() => push({ name: 'propertyManagement' })} style={styles.moreServiceCardWrapper}>
            <View style={styles.moreServiceCard}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.primaryBg }]}>
                <ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.moreServiceTitle}>Property Care</Text>
                  <View style={styles.miniTagTeal}>
                    <Text style={styles.miniTagText}>Flow D</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>Flat upload & direct admin</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Rental Agreements (Flow F) */}
          <AnimatedCard onPress={() => push({ name: 'rentalAgreement' })} style={styles.moreServiceCardWrapper}>
            <View style={styles.moreServiceCard}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.secondaryBg }]}>
                <FileText size={18} color={colors.secondary} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.moreServiceTitle}>Agreements</Text>
                  <View style={styles.miniTagGold}>
                    <Text style={[styles.miniTagText, { color: colors.goldDark }]}>₹999</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>Govt stamp & e-signature</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Home Loans (Flow E) */}
          <AnimatedCard onPress={() => push({ name: 'homeLoan' })} style={styles.moreServiceCardWrapper}>
            <View style={styles.moreServiceCard}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.goldBg }]}>
                <Landmark size={18} color={colors.goldDark} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.moreServiceTitle}>Home Loans</Text>
                  <View style={styles.miniTagGold}>
                    <Text style={[styles.miniTagText, { color: colors.goldDark }]}>8.35%</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>EMI calc & bank compare</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Verify Owner Background (Flow G & B) */}
          <AnimatedCard onPress={() => push({ name: 'ownerVerification' })} style={styles.moreServiceCardWrapper}>
            <View style={styles.moreServiceCard}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.primaryBg }]}>
                <UserCheck size={18} color={colors.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.moreServiceTitle}>Owner Check</Text>
                  <View style={styles.miniTagGold}>
                    <Text style={[styles.miniTagText, { color: colors.goldDark }]}>₹499</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>Title check & digital report</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Post Property */}
          <AnimatedCard onPress={() => setTab('post')} style={styles.moreServiceCardWrapper}>
            <View style={styles.moreServiceCard}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.accentBg }]}>
                <HousePlus size={18} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.moreServiceTitle}>Post Property</Text>
                  <View style={styles.miniTagCoral}>
                    <Text style={[styles.miniTagText, { color: colors.accent }]}>Free</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>Reach buyers & tenants</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Admin Operations Desk (Section 2) */}
          <AnimatedCard onPress={() => push({ name: 'adminPortal' })} style={styles.moreServiceCardWrapper}>
            <View style={[styles.moreServiceCard, { borderColor: colors.primary, borderWidth: 1.2 }]}>
              <View style={[styles.moreServiceIconBox, { backgroundColor: colors.primary }]}>
                <ShieldAlert size={18} color={colors.textWhite} strokeWidth={2.2} />
              </View>
              <View style={styles.moreServiceTextCol}>
                <View style={styles.serviceTitleRow}>
                  <Text style={[styles.moreServiceTitle, { color: colors.primary }]}>Admin Ops</Text>
                  <View style={styles.miniTagTeal}>
                    <Text style={styles.miniTagText}>Section 2</Text>
                  </View>
                </View>
                <Text style={styles.moreServiceSub}>7 review & verify queues</Text>
              </View>
            </View>
          </AnimatedCard>
        </View>
      </View>

      {/* ── Recommended Properties ── */}
      <View style={styles.sectionPadding}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Curated Residences</Text>
            <Text style={styles.sectionSubTitle}>Hand-picked properties with verified documentation</Text>
          </View>
          <TouchableOpacity onPress={() => setTab('explore')} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>View All</Text>
            <ChevronRight size={14} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.propertiesGrid}>
          {recommended.map(property => (
            <View key={property.id} style={styles.propertyCol}>
              <PropertyCard property={property} compact />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  fullTouch: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greetingText: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userName: {
    fontFamily: colors.fontFamily,
    fontSize: 23,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  waveEmoji: {
    fontSize: 20,
  },
  subGreeting: {
    fontFamily: colors.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionPadding: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  bannerCard: {
    height: 172,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayMedium,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  bannerTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 4,
  },
  bannerTag: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: 0.6,
  },
  bannerHeadline: {
    fontFamily: colors.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textWhite,
    lineHeight: 23,
  },
  bannerSub: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerCtaText: {
    fontFamily: colors.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 6,
  },
  bannerCtaIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.borderLight,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupSectionTitle: {
    fontFamily: colors.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  groupSectionTag: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
    letterSpacing: 0.6,
  },
  searchPropertyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  searchOptionCardWrapper: {
    flex: 1,
  },
  searchOptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  searchOptionTitle: {
    fontFamily: colors.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  searchOptionSub: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  moreServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moreServiceCardWrapper: {
    width: '48.5%',
  },
  moreServiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  moreServiceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  moreServiceTextCol: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreServiceTitle: {
    fontFamily: colors.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  miniTagTeal: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniTagGold: {
    backgroundColor: colors.goldBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniTagCoral: {
    backgroundColor: colors.accentBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniTagText: {
    fontFamily: colors.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
  },
  moreServiceSub: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  propertyCol: {
    width: '48.5%',
  },
});
