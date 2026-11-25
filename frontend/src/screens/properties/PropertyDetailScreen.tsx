import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  ChevronLeft,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle,
  Droplets,
  Trees,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Building2,
  ChevronDown,
  ChevronRight,
  Shield,
  Car,
  Dumbbell,
  Waves,
  Video,
  Zap,
  MessageCircle,
  Calendar,
  Layers,
  Star,
  X,
  Phone,
  Mail,
  Copy,
  Check,
  Wifi,
} from 'lucide-react-native';
import { Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { properties } from '../../data/properties';
import type { Property } from '../../types';

// Amenity Icons map
const AMENITY_ICONS: Record<string, (color: string) => React.ReactNode> = {
  Lift: (c) => <Building2 size={13} color={c} />,
  Security: (c) => <Shield size={13} color={c} />,
  Parking: (c) => <Car size={13} color={c} />,
  'Power Backup': (c) => <Zap size={13} color={c} />,
  Gym: (c) => <Dumbbell size={13} color={c} />,
  'Swimming Pool': (c) => <Waves size={13} color={c} />,
  'Club House': (c) => <Building2 size={13} color={c} />,
  CCTV: (c) => <Video size={13} color={c} />,
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PropertyDetailScreen() {
  const { currentScreen, push, pop, toggleSaved, savedIds, requireAuth } = useApp();
  const insets = useSafeAreaInsets();
  const propertyParam = currentScreen?.params?.property as Property | undefined;
  const propertyId = (currentScreen?.params?.id || currentScreen?.params?.propertyId) as string | undefined;
  const property = propertyParam || properties.find((p) => p.id === propertyId) || properties[0];

  // Detect the exact flow (pg, commercial, buy, rent, flatmates)
  const explicitFlow = currentScreen?.params?.flow as string | undefined;

  // PG / Hostel flow detection
  const isPg =
    explicitFlow === 'pg' ||
    Boolean((property as any)?.pgCategory) ||
    Boolean(property?.id && property.id.startsWith('pg-'));

  // Commercial flow detection
  const isCommercial =
    !isPg &&
    (explicitFlow === 'commercial' ||
      property?.listingType === 'commercial' ||
      ['office', 'shop', 'warehouse', 'coworking'].includes(property?.propertyType || ''));

  // Strict flow isolation:
  // Flatmates is true ONLY when opened from Flatmates flow or explicit roomType/fm- id
  const isFlatmate =
    !isPg &&
    !isCommercial &&
    (explicitFlow === 'flatmates' ||
      (property as any)?.roomType !== undefined ||
      Boolean(property?.id && property.id.startsWith('fm-')));

  // Rent is true when opened from Rent flow or rental listing type (and NOT pg, flatmates or commercial)
  const isRent =
    !isPg &&
    !isCommercial &&
    !isFlatmate &&
    (explicitFlow === 'rent' ||
      property?.listingType === 'rent' ||
      Boolean(property?.priceLabel && property.priceLabel.toLowerCase().includes('/month')) ||
      Boolean(property?.priceLabel && property.priceLabel.toLowerCase().includes('/mo')) ||
      (property?.price ?? 0) <= 100000);

  // Buy is true when not pg, commercial, rent, or flatmates
  const isBuy = !isPg && !isCommercial && !isRent && !isFlatmate;

  const [activeImg, setActiveImg] = useState(0);
  const isSaved = savedIds && property?.id ? savedIds.has(property.id) : false;

  // PG Room pricing tab state (Single | Double | Triple | Four)
  const [selectedSharing, setSelectedSharing] = useState<'Single' | 'Double' | 'Triple' | 'Four'>('Single');
  const PG_ROOM_PLANS: Record<
    'Single' | 'Double' | 'Triple' | 'Four',
    { title: string; subtitle: string; rent: string; deposit: string }
  > = {
    Single: {
      title: 'Single Sharing',
      subtitle: 'Single: 1 bed, attached bath, AC',
      rent: '₹18,000',
      deposit: '₹25,000',
    },
    Double: {
      title: 'Double Sharing',
      subtitle: 'Double: 2 beds, attached bath, AC',
      rent: '₹13,500',
      deposit: '₹18,000',
    },
    Triple: {
      title: 'Triple Sharing',
      subtitle: 'Triple: 3 beds, shared bath, AC',
      rent: '₹11,500',
      deposit: '₹15,000',
    },
    Four: {
      title: 'Four Sharing',
      subtitle: 'Four: 4 beds, shared bath, Non-AC',
      rent: '₹8,500',
      deposit: '₹10,000',
    },
  };
  const currentPgPlan = PG_ROOM_PLANS[selectedSharing];

  // Accordion states: Property Basics expanded by default on Rent & Commercial; PG sections expanded by default
  const [basicsOpen, setBasicsOpen] = useState(isRent || isCommercial || isPg);
  const [commercialConfigOpen, setCommercialConfigOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // PG-specific accordion states (expanded by default matching Images 1-4, collapsible on tap)
  const [pgRoomsOpen, setPgRoomsOpen] = useState(true);
  const [pgFoodOpen, setPgFoodOpen] = useState(true);
  const [pgServicesOpen, setPgServicesOpen] = useState(true);
  const [pgRulesOpen, setPgRulesOpen] = useState(true);
  const [pgPricingOpen, setPgPricingOpen] = useState(true);
  const [pgLocationOpen, setPgLocationOpen] = useState(true);

  // Helper to toggle accordions smoothly with LayoutAnimation
  const toggleAccordion = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setter((prev) => !prev);
  };

  // Selected flatmate modal state
  const [selectedFlatmate, setSelectedFlatmate] = useState<{
    name: string;
    firstName: string;
    age: number;
    role: string;
    gender: string;
    profession: string;
    phone: string;
    email: string;
    tags: string[];
    initial: string;
    about?: string;
  } | null>(null);

  // Description Read More / Read Less toggle
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Owner Details Modal state
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [copiedType, setCopiedType] = useState<'phone' | 'email' | null>(null);

  if (!property) {
    return null;
  }

  // Owner contact details
  const ownerName = property.ownerName || (isRent ? 'Venkata Rao' : 'Rajesh Kumar');
  const firstName = ownerName.split(' ')[0] || 'Venkata';
  const ownerPhone = '+91 98534 24560';
  const ownerEmail = isRent ? 'venkata.rao@gmail.com' : 'rajesh.kumar@gmail.com';

  // EMI & Calculations
  const emiMonthly = Math.round((property.price || 0) * 0.00624);

  // Images list fallback
  const images =
    property.images && property.images.length > 0
      ? property.images
      : [property.image];

  const handleCopy = (text: string, type: 'phone' | 'email') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch { }
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${property.title} in ${property.location} for ${property.priceLabel} on Seedha Properties!`,
      });
    } catch { }
  };

  const handleContactOwner = () => {
    requireAuth(
      () => {
        if (isFlatmate) {
          push({
            name: 'chat',
            params: {
              property,
              flow: 'flatmates',
              flatmate: {
                name: 'Rohit',
                firstName: 'Rohit',
                age: 27,
                role: 'Software engineer · Male',
                gender: 'Male',
                profession: 'Software engineer',
                phone: '+91 99175 57138',
                email: 'rohit@gmail.com',
                tags: ['Non-smoker', 'Vegetarian', 'Early riser'],
                initial: 'R',
              },
            },
          });
        } else {
          push({ name: 'chat', params: { property, flow: isRent ? 'rent' : 'buy' } });
        }
      },
      undefined,
      'Contact Owner'
    );
  };

  const handleBookVisit = () => {
    if (isRent || isCommercial || isPg) {
      requireAuth(
        undefined,
        {
          name: 'ownerVerification',
          params: {
            property,
            fromBookVisit: true,
            flow: isPg ? 'pg' : isCommercial ? 'commercial' : 'rent',
          },
        },
        'Schedule a Visit'
      );
      return;
    }
    requireAuth(
      undefined,
      { name: 'bookVisit', params: { property } },
      'Schedule a Visit'
    );
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Fixed Top Image Gallery (stays sticky while scrolling below) ── */}
      <View style={styles.galleryContainer}>
        <Image
          source={{ uri: images[activeImg] || property.image }}
          style={styles.mainGalleryImage}
          resizeMode="cover"
        />

        {/* Floating Top Nav (Back, Heart, Share) */}
        <View style={styles.topFloatingHeader}>
          <TouchableOpacity
            onPress={pop}
            style={styles.floatingCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#1A1C1A" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.floatingRightActions}>
            <TouchableOpacity
              onPress={() => toggleSaved(property.id)}
              style={styles.floatingCircleBtn}
              activeOpacity={0.8}
            >
              <Heart
                size={17}
                color={isSaved ? '#EF4444' : '#1A1C1A'}
                fill={isSaved ? '#EF4444' : 'transparent'}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.floatingCircleBtn}
              activeOpacity={0.8}
            >
              <Share2 size={17} color="#1A1C1A" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnails Row (Bottom Left) */}
        <View style={styles.thumbnailsContainer}>
          {images.slice(0, 4).map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveImg(i)}
              style={[
                styles.thumbnailWrapper,
                i === activeImg && styles.thumbnailActive,
              ]}
              activeOpacity={0.8}
            >
              <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Counter Badge (Bottom Right: "1 / 3") */}
        <View style={styles.counterBadge}>
          <Text style={styles.counterBadgeText}>
            {activeImg + 1} / {images.length}
          </Text>
        </View>
      </View>

      {/* ── Scrollable Body (scrolls cleanly beneath fixed top gallery & above fixed bottom bar) ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Main Content Body ── */}
        <View style={styles.contentBody}>
          {/* ── 2. Title, Verified, Location & Price ── */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              {property.verified && (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color="#059669" strokeWidth={2.4} />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.locationRow}>
              <MapPin size={13} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}${!isBuy ? '/month' : ''}`}
              </Text>
              {isBuy && (
                <Text style={styles.emiText}>
                  EMI ~ ₹{emiMonthly.toLocaleString('en-IN')}/mo
                </Text>
              )}
            </View>
          </View>

          {/* ── 2b. Interactive Room Pricing Selector (PG / Hostels ONLY — Matching Image 1) ── */}
          {isPg && (
            <View style={styles.pgRoomPricingBlock}>
              <Text style={styles.pgRoomPricingHeading}>Room pricing</Text>

              <View style={styles.pgSharingTabsRow}>
                {(['Single', 'Double', 'Triple', 'Four'] as const).map((tab) => {
                  const isActive = selectedSharing === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.pgSharingTabPill,
                        isActive && styles.pgSharingTabPillActive,
                      ]}
                      onPress={() => setSelectedSharing(tab)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.pgSharingTabText,
                          isActive && styles.pgSharingTabTextActive,
                        ]}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.pgPlanCard}>
                <View style={styles.pgPlanTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pgPlanTitle}>{currentPgPlan.title}</Text>
                    <Text style={styles.pgPlanSub}>{currentPgPlan.subtitle}</Text>
                  </View>
                  <Text style={styles.pgPlanRightPrice}>
                    {selectedSharing} {currentPgPlan.rent}
                  </Text>
                </View>

                <View style={styles.pgPlanMiniCardsRow}>
                  <View style={styles.pgPlanMiniCard}>
                    <Text style={styles.pgPlanMiniLabel}>Monthly rent</Text>
                    <Text style={styles.pgPlanMiniValue}>{currentPgPlan.rent}</Text>
                  </View>
                  <View style={styles.pgPlanMiniCard}>
                    <Text style={styles.pgPlanMiniLabel}>Deposit</Text>
                    <Text style={styles.pgPlanMiniValue}>{currentPgPlan.deposit}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Quick Overview Stats Bar ── */}
          <View style={styles.overviewBar}>
            {!isCommercial && (
              <View style={styles.overviewItem}>
                <BedDouble size={18} color="#1E293B" strokeWidth={2} />
                <Text style={styles.overviewText}>
                  {isPg ? (property.bedrooms || 1) : isBuy ? (property.bedrooms || 3) : (property.bedrooms || 2)} Beds
                </Text>
              </View>
            )}
            <View style={styles.overviewItem}>
              <Bath size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>
                {property.bathrooms || (isPg ? 1 : isCommercial ? 3 : 2)} Baths
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Square size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>
                {isPg ? (property.area || 220) : isCommercial ? (property.area || 2400) : isBuy ? (property.area || 1450) : (property.area || 1200)} sq.ft
              </Text>
            </View>
            {!isPg && (
              <View style={styles.overviewItem}>
                <Building2 size={18} color="#1E293B" strokeWidth={2} />
                <Text style={styles.overviewText}>
                  {isCommercial ? (property.floor || '12th') : isBuy ? (property.floor || '8th') : (property.floor || 'Ground')} Floor
                </Text>
              </View>
            )}
          </View>

          {/* ── 3. Property Details (Grid / 2 Columns) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Property Details</Text>
            {isPg ? (
              <View style={styles.specGrid}>
                <View style={styles.specCol}>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Accommodation type</Text>
                    <Text style={styles.specVal}>
                      {(property as any).pgCategory === 'Boys PG'
                        ? 'Boys Pg'
                        : (property as any).pgCategory === 'Girls PG'
                          ? 'Girls Pg'
                          : 'Co-living Pg'}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Total Floors</Text>
                    <Text style={styles.specVal}>{property.totalFloors || 6}</Text>
                  </View>
                </View>
                <View style={styles.specCol}>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Parking</Text>
                    <Text style={styles.specVal}>
                      {property.parking !== undefined ? (property.parking ? 'Available' : 'None') : 'Available'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.specGrid}>
                <View style={styles.specCol}>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Type</Text>
                    <Text style={styles.specVal}>
                      {isBuy
                        ? (property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'Apartment')
                        : (property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'House')}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Parking</Text>
                    <Text style={styles.specVal}>
                      {property.parking !== undefined ? (property.parking ? 'Available' : 'None') : 'Available'}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Facing</Text>
                    <Text style={styles.specVal}>
                      {isCommercial ? (property.facing || 'North') : isBuy ? (property.facing || 'East') : (property.facing || 'North-East')}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Total Floors</Text>
                    <Text style={styles.specVal}>
                      {isCommercial ? (property.totalFloors || 20) : isBuy ? (property.totalFloors || 12) : (property.totalFloors || 2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.specCol}>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Furnishing</Text>
                    <Text style={styles.specVal}>
                      {property.furnishing
                        ? property.furnishing.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                        : 'Semi Furnished'}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Current Property Condition</Text>
                    <Text style={styles.specVal}>
                      {isCommercial ? 'Under Construction' : isBuy ? 'Ready to Move' : 'Tenant In notice period'}
                    </Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Built Year</Text>
                    <Text style={styles.specVal}>{isBuy ? (property.yearBuilt || 2020) : (property.yearBuilt || 2024)}</Text>
                  </View>
                  <View style={styles.specCell}>
                    <Text style={styles.specKey}>Balconies</Text>
                    <Text style={styles.specVal}>{isCommercial ? '1' : '2'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── 3b. Highlighted Light-Purple Price Details Card (For Rent & Flatmates) ── */}
          {(isRent || isFlatmate) && (
            <View style={styles.rentPriceHighlightCard}>
              <Text style={styles.rentPriceCardHeading}>Rental Details</Text>
              <View style={styles.rentPriceCardRow}>
                <View style={styles.rentPriceCardItem}>
                  <Text style={styles.rentPriceLabel}>Security Deposit</Text>
                  <Text style={styles.rentPriceValue}>
                    {property.deposit
                      ? `₹${property.deposit.toLocaleString('en-IN')}`
                      : '₹45,000'}
                  </Text>
                </View>
                <View style={styles.rentPriceCardDivider} />
                <View style={styles.rentPriceCardItem}>
                  <Text style={styles.rentPriceLabel}>Maintenance</Text>
                  <Text style={styles.rentPriceValue}>
                    {property.maintenance
                      ? `₹${property.maintenance.toLocaleString('en-IN')}/mo`
                      : '₹1,500/mo'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── 4. About Property ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>About Property</Text>
            <Text
              style={styles.aboutDescription}
              numberOfLines={isBuy || isRent || isCommercial || isPg ? undefined : isDescExpanded ? undefined : 3}
            >
              {isPg
                ? (property.description ||
                  'Modern co-living PG near the IT corridor with furnished rooms, daily cleaning, healthy food and 24×7 security.')
                : isCommercial
                  ? (property.description ||
                    'Grade A office space in HITEC City with modern amenities. Suitable for IT/ITES companies. Excellent connectivity to airport and metro.')
                  : isBuy
                    ? (property.description ||
                      'A beautifully designed 3 BHK apartment in the heart of Madhurawada with stunning sea views. This apartment features premium fittings, spacious rooms, and a modern kitchen. Located in a gated community with 24/7 security.')
                    : isRent
                      ? (property.description ||
                        'Spacious 2 BHK independent house in a peaceful residential area of Gajuwaka. Perfect for families. Close to schools, hospitals and markets.')
                      : (property.description || 'Spacious accommodation with modern amenities.')}
            </Text>
            {!isBuy && !isRent && !isCommercial && !isPg && (
              <TouchableOpacity
                onPress={() => setIsDescExpanded(!isDescExpanded)}
                style={styles.readMoreBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>
                  {isDescExpanded ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── 5. Complete Listing Details (Accordions) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Complete Listing Details</Text>

            {isPg ? (
              <>
                {/* PG Accordion 1: PG / Hostel Basics */}
                <View style={styles.accordionContainer}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setBasicsOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>PG / Hostel Basics</Text>
                    {basicsOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {basicsOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Accommodation type</Text>
                        <Text style={styles.tableValue}>
                          {(property as any).pgCategory === 'Boys PG'
                            ? 'Boys PG'
                            : (property as any).pgCategory === 'Girls PG'
                              ? 'Girls PG'
                              : 'Co-living PG'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Name</Text>
                        <Text style={styles.tableValue}>{property.title || 'UrbanNest Co-living PG'}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Occupancy types</Text>
                        <Text style={[styles.tableValue, { flex: 1, textAlign: 'right', marginLeft: 12 }]}>
                          Single Sharing, Double Sharing, Triple Sharing
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>AC / Non-AC</Text>
                        <Text style={styles.tableValue}>Both</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Available for</Text>
                        <Text style={styles.tableValue}>
                          {(property as any).pgCategory === 'Boys PG'
                            ? 'Boys'
                            : (property as any).pgCategory === 'Girls PG'
                              ? 'Girls'
                              : 'Anyone'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Preferred guests</Text>
                        <Text style={styles.tableValue}>Working Professional</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Available from</Text>
                        <Text style={styles.tableValue}>Available now</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 2: Rooms */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgRoomsOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Rooms</Text>
                    {pgRoomsOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgRoomsOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Room amenities</Text>
                        <Text style={[styles.tableValue, { flex: 1, textAlign: 'right', marginLeft: 12 }]}>
                          Cupboard, TV, Bedding, Geyser, AC, Study Table, Fan
                        </Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Furnishing</Text>
                        <Text style={styles.tableValue}>Fully Furnished</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 3: Food & Dining */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgFoodOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Food & Dining</Text>
                    {pgFoodOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgFoodOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Food available</Text>
                        <Text style={styles.tableValue}>Yes</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Food type</Text>
                        <Text style={styles.tableValue}>Both</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Meals</Text>
                        <Text style={styles.tableValue}>Breakfast, Lunch, Dinner</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Weekly menu</Text>
                        <Text style={[styles.tableValue, { flex: 1, textAlign: 'right', marginLeft: 12 }]}>
                          South Indian, North Indian and one special dinner every weekend
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Dining area</Text>
                        <Text style={styles.tableValue}>Available</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Kitchen</Text>
                        <Text style={styles.tableValue}>Available</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Outside food</Text>
                        <Text style={styles.tableValue}>Allowed</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 4: Services & Facilities */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgServicesOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Services & Facilities</Text>
                    {pgServicesOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgServicesOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Laundry</Text>
                        <Text style={styles.tableValue}>Available</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Room cleaning</Text>
                        <Text style={styles.tableValue}>Daily</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Warden</Text>
                        <Text style={styles.tableValue}>24×7</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Parking</Text>
                        <Text style={styles.tableValue}>Bike parking</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 5: Rules & Schedule */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgRulesOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Rules & Schedule</Text>
                    {pgRulesOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgRulesOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Rules</Text>
                        <Text style={[styles.tableValue, { flex: 1, textAlign: 'right', marginLeft: 12 }]}>
                          No smoking, No drinking, No visitors after hours
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Gate closing time</Text>
                        <Text style={styles.tableValue}>11:00 PM</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Property position</Text>
                        <Text style={styles.tableValue}>Corner property</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Visit availability</Text>
                        <Text style={styles.tableValue}>Everyday</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Visit time</Text>
                        <Text style={styles.tableValue}>9:00 AM – 7:00 PM</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 6: Pricing */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgPricingOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Pricing</Text>
                    {pgPricingOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgPricingOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Maintenance</Text>
                        <Text style={styles.tableValue}>Included in rent</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Rent negotiable</Text>
                        <Text style={styles.tableValue}>Yes</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Security deposit</Text>
                        <Text style={styles.tableValue}>
                          {property.deposit ? `₹${property.deposit.toLocaleString('en-IN')}` : '₹15,000'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* PG Accordion 7: Exact Location */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPgLocationOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Exact Location</Text>
                    {pgLocationOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                  {pgLocationOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>City</Text>
                        <Text style={styles.tableValue}>{property.city || 'Hyderabad'}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Street / Area</Text>
                        <Text style={styles.tableValue}>Botanical Garden Road</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Landmark</Text>
                        <Text style={styles.tableValue}>Opposite Botanical Garden</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Google Maps pin</Text>
                        <Text style={styles.tableValue}>17.4698, 78.3652</Text>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Accordion 1: Property Basics / Commercial Property Basics */}
                <View style={styles.accordionContainer}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setBasicsOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>
                      {isCommercial ? 'Commercial Property Basics' : 'Property Basics'}
                    </Text>
                    {basicsOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>

                  {basicsOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Property type</Text>
                        <Text style={styles.tableValue}>
                          {property.propertyType
                            ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
                            : isCommercial
                              ? 'Office'
                              : isRent
                                ? 'House'
                                : 'Apartment'}
                        </Text>
                      </View>
                      {!isCommercial && (
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>BHK</Text>
                          <Text style={styles.tableValue}>{isBuy ? (property.bedrooms || 3) : (property.bedrooms || 2)} BHK</Text>
                        </View>
                      )}
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Bathrooms</Text>
                        <Text style={styles.tableValue}>{property.bathrooms || (isCommercial ? 3 : 2)}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Balconies</Text>
                        <Text style={styles.tableValue}>{isCommercial ? '1' : isRent ? '3' : '2'}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Furnishing</Text>
                        <Text style={styles.tableValue}>
                          {property.furnishing
                            ? property.furnishing.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            : 'Semi Furnished'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Parking</Text>
                        <Text style={styles.tableValue}>
                          {isBuy ? '1 Car' : property.parking ? 'Car & Bike' : 'None'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Property age</Text>
                        <Text style={styles.tableValue}>{isCommercial ? '8 years' : '4 years'}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Floor number</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? (property.floor || '12th') : isBuy ? (property.floor || '8th') : (property.floor || 'Ground')}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Total floors</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? (property.totalFloors || 20) : isBuy ? (property.totalFloors || 12) : (property.totalFloors || 2)}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Facing direction</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? (property.facing || 'North') : isBuy ? (property.facing || 'East') : (property.facing || 'North')}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Current condition</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial
                            ? 'Under Construction'
                            : isBuy
                              ? 'Ready to move'
                              : isRent
                                ? 'Ready to Move'
                                : property.possessionDate || 'Ready to Move'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Super built-up area</Text>
                        <Text style={styles.tableValue}>
                          {isBuy
                            ? '1750 sq.ft'
                            : `${Math.round((property.area || (isCommercial ? 2400 : 1200)) * 1.18)} sq.ft.`}
                        </Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Carpet area</Text>
                        <Text style={styles.tableValue}>
                          {isBuy
                            ? property.area
                              ? property.area + ' sq.ft'
                              : '1450 sq.ft'
                            : `${property.area || (isCommercial ? 2400 : 1200)} sq.ft.`}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Accordion 1B: Commercial Configuration (Commercial ONLY — Matching Images 2 & 3) */}
                {isCommercial && (
                  <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() => toggleAccordion(setCommercialConfigOpen)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.accordionHeaderTitle}>Commercial Configuration</Text>
                      {commercialConfigOpen ? (
                        <ChevronDown size={18} color="#64748B" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </TouchableOpacity>

                    {commercialConfigOpen && (
                      <View style={styles.accordionBody}>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Property subtype</Text>
                          <Text style={styles.tableValue}>
                            {property.propertyType === 'shop'
                              ? 'Retail Showroom'
                              : property.propertyType === 'coworking'
                                ? 'Managed Co-working'
                                : 'IT Office Space'}
                          </Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Washrooms</Text>
                          <Text style={styles.tableValue}>Shared</Text>
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                          <Text style={styles.tableKey}>Pantry / Cafeteria</Text>
                          <Text style={styles.tableValue}>Cafeteria</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Accordion 2: Location & Visit Schedule */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setLocationOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>Location & Visit Schedule</Text>
                    {locationOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>

                  {locationOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>City</Text>
                        <Text style={styles.tableValue}>{property.city || (isCommercial ? 'Hyderabad' : 'Vizag')}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Locality</Text>
                        <Text style={styles.tableValue}>
                          {property.location?.split(',')[0] || (isCommercial ? 'HITEC City' : 'Gajuwaka')}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Street / Area</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? '18, Main Road' : 'Main Residential Enclave'}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Landmark</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? 'Opposite City Mall' : 'Near Apollo Clinic & Market'}
                        </Text>
                      </View>
                      {isCommercial && (
                        <>
                          <View style={styles.tableRow}>
                            <Text style={styles.tableKey}>Google Maps pin</Text>
                            <Text style={styles.tableValue}>17.459999999999997, 78.36</Text>
                          </View>
                          <View style={styles.tableRow}>
                            <Text style={styles.tableKey}>Property position</Text>
                            <Text style={styles.tableValue}>Main road & corner property</Text>
                          </View>
                        </>
                      )}
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Visit availability</Text>
                        <Text style={styles.tableValue}>{isCommercial ? 'Weekends' : 'Everyday'}</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Visit time</Text>
                        <Text style={styles.tableValue}>
                          {isCommercial ? '11:00 AM – 5:00 PM' : '10:00 AM - 6:00 PM'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Accordion 3: Price / Rent & Availability */}
                <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(setPriceOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.accordionHeaderTitle}>
                      {isBuy || isCommercial ? 'Price & Availability' : 'Rent & Availability'}
                    </Text>
                    {priceOpen ? (
                      <ChevronDown size={18} color="#64748B" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>

                  {priceOpen && (
                    <View style={styles.accordionBody}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>
                          {isBuy || isCommercial ? 'Expected price' : 'Monthly rent'}
                        </Text>
                        <Text style={styles.tableValue}>
                          {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}${!isBuy ? '/month' : ''}`}
                        </Text>
                      </View>
                      {(isRent || isFlatmate) && (
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Security deposit</Text>
                          <Text style={styles.tableValue}>
                            {property.deposit ? `₹${property.deposit.toLocaleString('en-IN')}` : '₹45,000'}
                          </Text>
                        </View>
                      )}
                      {(isRent || isFlatmate) && (
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Maintenance</Text>
                          <Text style={styles.tableValue}>
                            {property.maintenance ? `₹${property.maintenance.toLocaleString('en-IN')}/mo` : '₹1,500/mo'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.tableRow}>
                        <Text style={styles.tableKey}>Price negotiable</Text>
                        <Text style={styles.tableValue}>{isCommercial ? 'No' : 'Yes'}</Text>
                      </View>
                      <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.tableKey}>Available from</Text>
                        <Text style={styles.tableValue}>{isCommercial ? 'Available now' : 'Immediately'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Accordion 4: Tenant Preferences (Rent ONLY — Matching Image 4) */}
                {isRent && (
                  <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() => toggleAccordion(setTermsOpen)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.accordionHeaderTitle}>Tenant Preferences</Text>
                      {termsOpen ? (
                        <ChevronDown size={18} color="#64748B" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </TouchableOpacity>

                    {termsOpen && (
                      <View style={styles.accordionBody}>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Preferred tenants</Text>
                          <Text style={styles.tableValue}>Family / Working Professionals</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Bachelors allowed</Text>
                          <Text style={styles.tableValue}>Yes</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Pets allowed</Text>
                          <Text style={styles.tableValue}>No</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Smoking allowed</Text>
                          <Text style={styles.tableValue}>No</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Food preference</Text>
                          <Text style={styles.tableValue}>Any</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Lock-in period</Text>
                          <Text style={styles.tableValue}>6 months</Text>
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                          <Text style={styles.tableKey}>Notice period</Text>
                          <Text style={styles.tableValue}>1 month</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Accordion 4: Flatmate Preferences (Flatmates ONLY) */}
                {isFlatmate && (
                  <View style={[styles.accordionContainer, { marginTop: 10 }]}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() => toggleAccordion(setTermsOpen)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.accordionHeaderTitle}>Flatmate Preferences</Text>
                      {termsOpen ? (
                        <ChevronDown size={18} color="#64748B" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </TouchableOpacity>

                    {termsOpen && (
                      <View style={styles.accordionBody}>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Gender preference</Text>
                          <Text style={styles.tableValue}>Any</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Preferred Age</Text>
                          <Text style={styles.tableValue}>25</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Occupation</Text>
                          <Text style={styles.tableValue}>Any</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Pets allowed</Text>
                          <Text style={styles.tableValue}>No</Text>
                        </View>
                        <View style={styles.tableRow}>
                          <Text style={styles.tableKey}>Smoking allowed</Text>
                          <Text style={styles.tableValue}>No</Text>
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                          <Text style={styles.tableKey}>Food preference</Text>
                          <Text style={styles.tableValue}>Vegetarian</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── 6. Amenities ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Amenities</Text>
            <View style={styles.amenitiesWrap}>
              {(isPg
                ? ['WiFi', 'Common TV', 'Mess', 'Lift', 'Refrigerator', 'Power Backup', 'CCTV', 'RO Water']
                : isCommercial
                  ? (property.amenities && property.amenities.length > 0
                    ? property.amenities
                    : ['Power Backup', '2 Car Parking', 'AC', 'Server Room', 'Conference Room', 'Reception', 'Cafeteria'])
                  : isBuy
                    ? ['Lift', 'Security', 'Parking', 'Power Backup', 'Gym', 'Swimming Pool', 'Club House', 'CCTV']
                    : ['Parking', 'Water Supply', 'Power Backup', 'Garden', 'Security']
              ).map((amenity) => {
                let iconElement = <CheckCircle size={13} color="#475569" />;
                if (isPg) {
                  if (amenity === 'WiFi') iconElement = <Wifi size={13} color="#475569" />;
                  else if (amenity === 'Lift') iconElement = <Building2 size={13} color="#475569" />;
                  else iconElement = <CheckCircle size={13} color="#475569" />;
                } else if (!isCommercial) {
                  if (amenity === 'Parking') iconElement = <Car size={13} color="#475569" />;
                  else if (amenity === 'Water Supply') iconElement = <CheckCircle size={13} color="#475569" />;
                  else if (amenity === 'Power Backup') iconElement = <CheckCircle size={13} color="#475569" />;
                  else if (amenity === 'Garden') iconElement = <CheckCircle size={13} color="#475569" />;
                  else if (amenity === 'Security') iconElement = <Shield size={13} color="#475569" />;
                  else if (AMENITY_ICONS[amenity]) iconElement = AMENITY_ICONS[amenity]('#475569') as any;
                }
                return (
                  <View key={amenity} style={styles.amenityChip}>
                    {iconElement}
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Your Future Flatmates Section (Flatmates ONLY) ── */}
          {isFlatmate && (
            <View style={styles.flatmatesCardContainer}>
              <View style={styles.flatmatesHeaderRow}>
                <Text style={styles.flatmatesHeaderTitle}>Your future flatmates</Text>
                <TouchableOpacity onPress={() => push({ name: 'flatmates' })}>
                  <Text style={styles.flatmatesViewMore}>2 living here</Text>
                </TouchableOpacity>
              </View>

              {/* Flatmate 1 */}
              <View style={styles.flatmateRowCard}>
                <View style={styles.flatmateAvatarCircle}>
                  <Text style={styles.flatmateAvatarInitial}>R</Text>
                </View>
                <View style={styles.flatmateContentCol}>
                  <View style={styles.flatmateNameRow}>
                    <Text style={styles.flatmateName}>Rohit, 27</Text>
                    <TouchableOpacity
                      style={styles.flatmateViewBtn}
                      activeOpacity={0.8}
                      onPress={() =>
                        setSelectedFlatmate({
                          name: 'Rohit, 27',
                          firstName: 'Rohit',
                          age: 27,
                          role: 'Software engineer · Male',
                          gender: 'Male',
                          profession: 'Software engineer',
                          phone: '+91 99175 57138',
                          email: 'rohit@gmail.com',
                          tags: ['Non-smoker', 'Vegetarian', 'Early riser'],
                          initial: 'R',
                          about: 'Software engineer working in tech. Quiet, clean, and organized. Enjoys running and reading on weekends.',
                        })
                      }
                    >
                      <Text style={styles.flatmateViewBtnText}>View details</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.flatmateOccupation}>Software engineer · Male</Text>
                  <View style={styles.flatmateTagsRow}>
                    <View style={styles.flatmateTag}><Text style={styles.flatmateTagText}>Non-smoker</Text></View>
                    <View style={styles.flatmateTag}><Text style={styles.flatmateTagText}>Vegetarian</Text></View>
                    <View style={styles.flatmateTag}><Text style={styles.flatmateTagText}>Early riser</Text></View>
                  </View>
                </View>
              </View>

              {/* Flatmate 2 */}
              <View style={[styles.flatmateRowCard, { marginTop: 12 }]}>
                <View style={[styles.flatmateAvatarCircle, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.flatmateAvatarInitial}>S</Text>
                </View>
                <View style={styles.flatmateContentCol}>
                  <View style={styles.flatmateNameRow}>
                    <Text style={styles.flatmateName}>Sameer, 26</Text>
                    <TouchableOpacity
                      style={styles.flatmateViewBtn}
                      activeOpacity={0.8}
                      onPress={() =>
                        setSelectedFlatmate({
                          name: 'Sameer, 26',
                          firstName: 'Sameer',
                          age: 26,
                          role: 'Product designer · Male',
                          gender: 'Male',
                          profession: 'Product designer',
                          phone: '+91 98452 31980',
                          email: 'sameer@gmail.com',
                          tags: ['Non-smoker', 'Non-vegetarian'],
                          initial: 'S',
                          about: 'UI/UX product designer at a fintech startup. Friendly, loves music and minimalist living spaces.',
                        })
                      }
                    >
                      <Text style={styles.flatmateViewBtnText}>View details</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.flatmateOccupation}>Product designer · Male</Text>
                  <View style={styles.flatmateTagsRow}>
                    <View style={styles.flatmateTag}><Text style={styles.flatmateTagText}>Non-smoker</Text></View>
                    <View style={styles.flatmateTag}><Text style={styles.flatmateTagText}>Non-vegetarian</Text></View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Owner Declaration & Owner / Builder Details (Buy & Commercial Flows) ── */}
          {(isBuy || isCommercial) && (
            <>
              {/* Owner Declaration Section */}
              <View style={styles.declarationCard}>
                <View style={styles.declarationHeaderRow}>
                  <Text style={styles.declarationTitle}>Owner Declaration</Text>
                  <View style={styles.declarationBadge}>
                    <Text style={styles.declarationBadgeText}>Declared by owner</Text>
                  </View>
                </View>
                <Text style={styles.declarationSubtitle}>
                  Information provided by the person who posted this property.
                </Text>

                <View style={styles.declarationBody}>
                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Owner name</Text>
                    <Text style={styles.declarationValue}>
                      {property.ownerName?.replace(/\s*\(.*\)/, '') || (isCommercial ? 'Prestige Developers' : 'Rajesh Kumar')}
                    </Text>
                  </View>

                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Posted as</Text>
                    <Text style={styles.declarationValue}>
                      {property.ownerType
                        ? property.ownerType.charAt(0).toUpperCase() + property.ownerType.slice(1)
                        : 'Owner'}
                    </Text>
                  </View>

                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Ownership</Text>
                    <Text style={styles.declarationValue}>
                      {property.ownerType === 'builder'
                        ? `Builder allotment · ${property.yearBuilt || 2022}`
                        : `Purchased · ${property.yearBuilt || 2024}`}
                    </Text>
                  </View>

                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Loan on property</Text>
                    <Text style={styles.declarationValue}>No loan</Text>
                  </View>

                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Property tax paid</Text>
                    <Text style={styles.declarationValue}>Yes</Text>
                  </View>

                  <View style={styles.declarationRow}>
                    <Text style={styles.declarationLabel}>Pending dues</Text>
                    <Text style={styles.declarationValue}>{isCommercial ? 'None' : 'No'}</Text>
                  </View>

                  <View style={[styles.declarationRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.declarationLabel}>Court case</Text>
                    <Text style={styles.declarationValue}>None</Text>
                  </View>
                </View>
              </View>

              {/* Owner / Builder Details Section */}
              <View style={styles.ownerCard}>
                <Text style={styles.ownerCardTitle}>
                  {property.ownerType === 'builder' ? 'Builder Details' : 'Owner Details'}
                </Text>
                <View style={styles.ownerRow}>
                  <Image
                    source={{
                      uri:
                        property.ownerAvatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
                    }}
                    style={styles.ownerAvatar}
                  />
                  <View style={styles.ownerTextStack}>
                    <Text style={styles.ownerNameText}>{property.ownerName || 'Rajesh Kumar'}</Text>
                    <View style={styles.ratingAndBadgeRow}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={11} color="#F59E0B" fill="#F59E0B" />
                        ))}
                      </View>
                      <Text style={styles.verifiedOwnerBadgeText}>
                        {property.ownerType === 'builder' ? 'Verified builder' : 'Verified owner'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => setOwnerModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* ── 7. Owner / Builder Details & Verification Banner (Rent & PG Flows) ── */}
          {(isRent || isPg) && (
            <>
              {/* Owner / Builder Details Card with Black Call Button */}
              <View style={styles.ownerCard}>
                <Text style={styles.ownerCardTitle}>
                  {property.ownerType === 'builder' ? 'Builder Details' : 'Owner Details'}
                </Text>
                <View style={styles.ownerRow}>
                  <Image
                    source={{
                      uri:
                        property.ownerAvatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
                    }}
                    style={styles.ownerAvatar}
                  />
                  <View style={styles.ownerTextStack}>
                    <Text style={styles.ownerNameText}>{ownerName}</Text>
                    <View style={styles.ratingAndBadgeRow}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={11} color="#F59E0B" fill="#F59E0B" />
                        ))}
                      </View>
                      <Text style={styles.verifiedOwnerBadgeText}>
                        {property.ownerType === 'builder' ? 'Verified builder' : 'Verified owner'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.rentCallIconBtn}
                    onPress={() => setOwnerModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Phone size={18} color="#FFFFFF" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dark Verified Owner & Property Details Banner */}
              <TouchableOpacity
                style={styles.verifiedBannerCard}
                onPress={() =>
                  push({
                    name: 'ownerVerification',
                    params: { property, flow: isPg ? 'pg' : 'rent' },
                  })
                }
                activeOpacity={0.88}
              >
                <View style={styles.verifiedBannerIconBox}>
                  <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View style={styles.verifiedBannerTextCol}>
                  <Text style={styles.verifiedBannerTitle}>
                    Verified owner & property{'\n'}details
                  </Text>
                  <Text style={styles.verifiedBannerSubtitle}>
                    Get the owner, property and rental details verified. Report in 24 hours.
                  </Text>
                </View>
                <ChevronRight size={18} color="#CBD5E1" strokeWidth={2.2} />
              </TouchableOpacity>
            </>
          )}

          {/* ── 8. Nearby Places Section (Matching Reference 2) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Nearby Places</Text>
            <View style={styles.nearbyPlacesGrid}>
              <View style={styles.nearbyPlaceCard}>
                <View style={styles.nearbyPinCircle}>
                  <MapPin size={12} color="#1E293B" />
                </View>
                <Text style={styles.nearbyPlaceText}>School — 0.5 km</Text>
              </View>
              <View style={styles.nearbyPlaceCard}>
                <View style={styles.nearbyPinCircle}>
                  <MapPin size={12} color="#1E293B" />
                </View>
                <Text style={styles.nearbyPlaceText}>Hospital — 1.2 km</Text>
              </View>
              <View style={styles.nearbyPlaceCard}>
                <View style={styles.nearbyPinCircle}>
                  <MapPin size={12} color="#1E293B" />
                </View>
                <Text style={styles.nearbyPlaceText}>Metro — 2.0 km</Text>
              </View>
              <View style={styles.nearbyPlaceCard}>
                <View style={styles.nearbyPinCircle}>
                  <MapPin size={12} color="#1E293B" />
                </View>
                <Text style={styles.nearbyPlaceText}>Airport — 8.5 km</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── 9. Fixed Bottom Action Buttons ── */}
      <View
        style={[
          styles.bottomBarContainer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 14) },
        ]}
      >
        {/* Sub Row: Compare & Chat */}
        <View style={styles.bottomSubRow}>
          <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => push({ name: 'compare', params: { property, flow: isFlatmate ? 'flatmates' : isRent ? 'rent' : 'buy' } })}
            activeOpacity={0.8}
          >
            <Layers size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.compareBtnText}>Compare</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={handleContactOwner}
            activeOpacity={0.8}
          >
            <MessageCircle size={15} color="#1A1C1A" strokeWidth={2} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Primary CTA: Book a Visit */}
        <TouchableOpacity
          style={styles.bookVisitBtn}
          onPress={handleBookVisit}
          activeOpacity={0.9}
        >
          <Calendar size={17} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.bookVisitBtnText}>Book a Visit</Text>
        </TouchableOpacity>
      </View>
      {/* ── Flatmate Profile Details Modal (Flatmates Only) ── */}
      <Modal
        visible={Boolean(isFlatmate && selectedFlatmate)}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setSelectedFlatmate(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedFlatmate(null)}
        >
          <View style={styles.flatmatePopupContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Flatmate details</Text>
              <TouchableOpacity
                onPress={() => setSelectedFlatmate(null)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={18} color="#475569" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {selectedFlatmate && (
              <>
                {/* Profile Header */}
                <View style={styles.modalProfileRow}>
                  <View style={styles.flatmateAvatarBox}>
                    <Text style={styles.flatmateAvatarBoxInitial}>{selectedFlatmate.initial}</Text>
                  </View>
                  <View style={styles.modalProfileText}>
                    <Text style={styles.modalOwnerName}>{selectedFlatmate.name}</Text>
                    <Text style={styles.modalOwnerRole}>{selectedFlatmate.role}</Text>
                  </View>
                </View>

                {/* Contact Box (Phone & Email) */}
                <View style={styles.flatmateContactBox}>
                  {/* Phone Row */}
                  <View style={styles.contactItemRow}>
                    <View style={styles.contactIconCircle}>
                      <Phone size={14} color="#1E293B" strokeWidth={2.2} />
                    </View>
                    <View style={styles.contactTextColumn}>
                      <Text style={styles.contactFieldLabel}>Phone</Text>
                      <Text style={styles.contactFieldValue}>{selectedFlatmate.phone}</Text>
                    </View>
                  </View>

                  {/* Email Row */}
                  <View style={[styles.contactItemRow, { marginTop: 12 }]}>
                    <View style={styles.contactIconCircle}>
                      <Mail size={14} color="#1E293B" strokeWidth={2.2} />
                    </View>
                    <View style={styles.contactTextColumn}>
                      <Text style={styles.contactFieldLabel}>Email</Text>
                      <Text style={styles.contactFieldValue}>{selectedFlatmate.email}</Text>
                    </View>
                  </View>
                </View>

                {/* Profession Section */}
                <View style={{ marginTop: 18 }}>
                  <Text style={styles.flatmateFieldHeader}>Profession</Text>
                  <Text style={styles.flatmateFieldValue}>{selectedFlatmate.profession}</Text>
                </View>

                {/* Habits Section */}
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.flatmateFieldHeader}>Habits</Text>
                  <View style={styles.flatmateTagsRow}>
                    {selectedFlatmate.tags.map((t) => (
                      <View key={t} style={styles.flatmateHabitChip}>
                        <Text style={styles.flatmateHabitChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Chat with Flatmate Button */}
                <TouchableOpacity
                  style={styles.chatWithFlatmateBtn}
                  onPress={() => {
                    const mate = selectedFlatmate;
                    setSelectedFlatmate(null);
                    requireAuth(
                      () => {
                        push({
                          name: 'chat',
                          params: {
                            property,
                            flow: 'flatmates',
                            flatmate: mate,
                          },
                        });
                      },
                      undefined,
                      `Chat with ${mate.firstName}`
                    );
                  }}
                  activeOpacity={0.9}
                >
                  <MessageCircle size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.chatWithFlatmateBtnText}>
                    Chat with {selectedFlatmate.firstName}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 10. Owner Details Bottom Sheet Modal ── */}
      <Modal
        visible={ownerModalVisible}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="slide"
        onRequestClose={() => setOwnerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOwnerModalVisible(false)}
        >
          <View
            style={styles.ownerModalContent}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Owner details</Text>
              <TouchableOpacity
                onPress={() => setOwnerModalVisible(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={18} color="#475569" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Owner Profile Row */}
            <View style={styles.modalProfileRow}>
              <Image
                source={{
                  uri:
                    property.ownerAvatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&h=140&fit=crop&auto=format',
                }}
                style={styles.modalAvatar}
              />
              <View style={styles.modalProfileText}>
                <Text style={styles.modalOwnerName}>{ownerName}</Text>
                <Text style={styles.modalOwnerRole}>Owner</Text>
              </View>
            </View>

            {/* Contact Box (Phone & Email) */}
            <View style={styles.contactDetailsBox}>
              {/* Phone Row */}
              <View style={styles.contactItemRow}>
                <View style={styles.contactIconCircle}>
                  <Phone size={14} color="#1E293B" strokeWidth={2.2} />
                </View>
                <View style={styles.contactTextColumn}>
                  <Text style={styles.contactFieldLabel}>Phone</Text>
                  <Text style={styles.contactFieldValue}>{ownerPhone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(ownerPhone, 'phone')}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                >
                  {copiedType === 'phone' ? (
                    <Check size={16} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Copy size={16} color="#64748B" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Email Row */}
              <View style={[styles.contactItemRow, { marginTop: 14 }]}>
                <View style={styles.contactIconCircle}>
                  <Mail size={14} color="#1E293B" strokeWidth={2.2} />
                </View>
                <View style={styles.contactTextColumn}>
                  <Text style={styles.contactFieldLabel}>Email</Text>
                  <Text style={styles.contactFieldValue}>{ownerEmail}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(ownerEmail, 'email')}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                >
                  {copiedType === 'email' ? (
                    <Check size={16} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Copy size={16} color="#64748B" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat with Rajesh CTA Button */}
            <TouchableOpacity
              style={styles.chatWithOwnerBtn}
              onPress={() => {
                setOwnerModalVisible(false);
                handleContactOwner();
              }}
              activeOpacity={0.9}
            >
              <MessageCircle size={17} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.chatWithOwnerBtnText}>
                Chat with {firstName}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ── 1. Top Image Gallery ── */
  galleryContainer: {
    width: '100%',
    height: 270,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  mainGalleryImage: {
    width: '100%',
    height: '100%',
  },
  topFloatingHeader: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  thumbnailWrapper: {
    width: 42,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#E2E8F0',
  },
  thumbnailActive: {
    borderColor: '#FFFFFF',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    zIndex: 10,
  },
  counterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* ── Main Content Body ── */
  contentBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* ── 2. Title Section ── */
  titleSection: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    marginLeft: 10,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  emiText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* ── Stats Bar ── */
  overviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  overviewItem: {
    alignItems: 'center',
    gap: 4,
  },
  overviewText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },

  /* ── Section Block ── */
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.1,
  },

  /* ── Specifications Grid ── */
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specCol: {
    width: '48%',
    gap: 12,
  },
  specCell: {
    gap: 2,
  },
  specKey: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* ── About Property ── */
  aboutDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  /* ── Accordions (Listing Details) ── */
  accordionContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  tableKey: {
    fontSize: 12.5,
    color: '#64748B',
  },
  tableValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* ── Amenities ── */
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },

  /* ── Owner Declaration Card ── */
  declarationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 20,
  },
  declarationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  declarationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  declarationBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  declarationBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  declarationSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 16,
  },
  declarationBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DBEAFE',
    paddingTop: 4,
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DBEAFE',
  },
  declarationLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  declarationValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  /* ── Owner Details Card (Compact) ── */
  ownerCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ownerCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CBD5E1',
  },
  ownerTextStack: {
    flex: 1,
    marginLeft: 12,
  },
  ownerNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  ratingAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedOwnerBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  viewDetailsBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rentCallIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D22',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  verifiedBannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBannerTextCol: {
    flex: 1,
  },
  verifiedBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  verifiedBannerSubtitle: {
    fontSize: 11.5,
    color: '#A1A1AA',
    marginTop: 5,
    lineHeight: 16,
  },
  /* ── PG Room Pricing Selector Styles (Matching Image 1) ── */
  pgRoomPricingBlock: {
    marginBottom: 18,
  },
  pgRoomPricingHeading: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  pgSharingTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pgSharingTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#EEF1F6',
  },
  pgSharingTabPillActive: {
    backgroundColor: '#0A0A0A',
  },
  pgSharingTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  pgSharingTabTextActive: {
    color: '#FFFFFF',
  },
  pgPlanCard: {
    backgroundColor: '#F3F5F9',
    borderRadius: 18,
    padding: 16,
  },
  pgPlanTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  pgPlanTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pgPlanSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  pgPlanRightPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pgPlanMiniCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pgPlanMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pgPlanMiniLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pgPlanMiniValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* ── Nearby Places Grid ── */
  nearbyPlacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  nearbyPlaceCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  nearbyPinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nearbyPlaceText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },

  /* ── Fixed Bottom Bar ── */
  flatmatesCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  flatmatesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  flatmatesHeaderTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  flatmatesViewMore: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  flatmateRowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  flatmateAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  flatmateAvatarInitial: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
  },
  flatmateContentCol: {
    flex: 1,
  },
  flatmateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flatmateName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  flatmateViewBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flatmateViewBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#334155',
  },
  flatmateOccupation: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  flatmateTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  flatmateTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flatmateTagText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#475569',
  },
  rentPriceHighlightCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  rentPriceCardHeading: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 12,
  },
  rentPriceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 32,
  },
  rentPriceCardItem: {
    // column item
  },
  rentPriceCardDivider: {
    width: 0,
    height: 0,
  },
  rentPriceLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 4,
  },
  rentPriceValue: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#1E293B',
  },
  readMoreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#6366F1',
  },
  bottomBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  bottomSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compareBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  compareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chatBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookVisitBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#000000',
    gap: 8,
  },
  bookVisitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Owner Details Bottom Sheet Modal ── */
  flatmatePopupContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  flatmateAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flatmateAvatarBoxInitial: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
  },
  flatmateContactBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },
  flatmateFieldHeader: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#1E293B',
    marginBottom: 4,
  },
  flatmateFieldValue: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  flatmateHabitChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  flatmateHabitChipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#334155',
  },
  chatWithFlatmateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 22,
  },
  chatWithFlatmateBtnText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  ownerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  modalProfileText: {
    marginLeft: 14,
  },
  modalOwnerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  modalOwnerRole: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  contactDetailsBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactTextColumn: {
    flex: 1,
    marginLeft: 12,
  },
  contactFieldLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  contactFieldValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  copyBtn: {
    padding: 6,
  },
  chatWithOwnerBtn: {
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatWithOwnerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
