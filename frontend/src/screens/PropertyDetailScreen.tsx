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
} from 'react-native';
import {
  ChevronLeft,
  Heart,
  Share2,
  ShieldCheck,
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
} from 'lucide-react-native';
import { Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { properties } from '../data/properties';
import type { Property } from '../types';

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

export default function PropertyDetailScreen() {
  const { currentScreen, push, pop, toggleSaved, savedIds, requireAuth } = useApp();
  const propertyParam = currentScreen?.params?.property as Property | undefined;
  const propertyId = (currentScreen?.params?.id || currentScreen?.params?.propertyId) as string | undefined;
  const property = propertyParam || properties.find((p) => p.id === propertyId) || properties[0];

  if (!property) {
    return null;
  }

  const [activeImg, setActiveImg] = useState(0);
  const isSaved = savedIds ? savedIds.has(property.id) : false;

  // Accordion states: ALL COLLAPSED BY DEFAULT
  const [basicsOpen, setBasicsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // Owner Details Modal state
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [copiedType, setCopiedType] = useState<'phone' | 'email' | null>(null);

  // Owner contact details
  const ownerName = property.ownerName || 'Rajesh Kumar';
  const firstName = ownerName.split(' ')[0] || 'Rajesh';
  const ownerPhone = '+91 98534 24560';
  const ownerEmail = 'rajesh.kumar@gmail.com';

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
    } catch {}
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
    } catch {}
  };

  const handleContactOwner = () => {
    requireAuth(
      () => {
        push({ name: 'chat', params: { property } });
      },
      undefined,
      'Contact Owner'
    );
  };

  const handleBookVisit = () => {
    requireAuth(
      undefined,
      { name: 'bookVisit', params: { property } },
      'Schedule a Visit'
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Top Image Gallery ── */}
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

          {/* Counter Badge (Bottom Right: "1/4") */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>
              {activeImg + 1}/{images.length}
            </Text>
          </View>
        </View>

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
                {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}`}
              </Text>
              <Text style={styles.emiText}>
                EMI ~ ₹{emiMonthly.toLocaleString('en-IN')}/mo
              </Text>
            </View>
          </View>

          {/* ── Quick Overview Stats Bar ── */}
          <View style={styles.overviewBar}>
            <View style={styles.overviewItem}>
              <BedDouble size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>{property.bedrooms || 3} Beds</Text>
            </View>
            <View style={styles.overviewItem}>
              <Bath size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>{property.bathrooms || 2} Baths</Text>
            </View>
            <View style={styles.overviewItem}>
              <Square size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>{property.area || 1450} sq.ft</Text>
            </View>
            <View style={styles.overviewItem}>
              <Building2 size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.overviewText}>{property.floor || '8th'} Floor</Text>
            </View>
          </View>

          {/* ── 3. Property Details (Grid / 2 Columns) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Property Details</Text>
            <View style={styles.specGrid}>
              <View style={styles.specCol}>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Type</Text>
                  <Text style={styles.specVal}>
                    {property.propertyType
                      ? property.propertyType.charAt(0).toUpperCase() +
                        property.propertyType.slice(1)
                      : 'Apartment'}
                  </Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Parking</Text>
                  <Text style={styles.specVal}>
                    {property.parking ? 'Available' : 'Not Available'}
                  </Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Facing</Text>
                  <Text style={styles.specVal}>{property.facing || 'East'}</Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Total Floors</Text>
                  <Text style={styles.specVal}>{property.totalFloors || 12}</Text>
                </View>
              </View>

              <View style={styles.specCol}>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Furnishing</Text>
                  <Text style={styles.specVal}>
                    {property.furnishing
                      ? property.furnishing
                          .split('-')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ')
                      : 'Semi-Furnished'}
                  </Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Current Property condition</Text>
                  <Text style={styles.specVal}>
                    {property.possessionDate || 'Ready to Move'}
                  </Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Built Year</Text>
                  <Text style={styles.specVal}>{property.yearBuilt || 2020}</Text>
                </View>
                <View style={styles.specCell}>
                  <Text style={styles.specKey}>Balconies</Text>
                  <Text style={styles.specVal}>2</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── 4. About Property ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>About Property</Text>
            <Text style={styles.aboutDescription}>
              {property.description ||
                'A beautifully designed 3 BHK apartment in the heart of Madhurawada with stunning sea views. The apartment features premium fittings, spacious rooms, and a modern kitchen. Located in a gated community with 24/7 security.'}
            </Text>
          </View>

          {/* ── 5. Complete Listing Details (Accordions) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Complete Listing Details</Text>

            {/* Accordion 1: Property Basics (Collapsed by default) */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setBasicsOpen(!basicsOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionHeaderTitle}>Property Basics</Text>
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
                        ? property.propertyType.charAt(0).toUpperCase() +
                          property.propertyType.slice(1)
                        : 'Villa'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>BHK</Text>
                    <Text style={styles.tableValue}>{property.bedrooms || 3} BHK</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Bathrooms</Text>
                    <Text style={styles.tableValue}>{property.bathrooms || 2}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Balconies</Text>
                    <Text style={styles.tableValue}>2</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Furnishing</Text>
                    <Text style={styles.tableValue}>
                      {property.furnishing
                        ? property.furnishing
                            .split('-')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')
                        : 'Semi-Furnished'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Parking</Text>
                    <Text style={styles.tableValue}>
                      {property.parking ? '1 Slot' : 'None'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Property age</Text>
                    <Text style={styles.tableValue}>4 years</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Floor number</Text>
                    <Text style={styles.tableValue}>{property.floor || '8th'}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Total floors</Text>
                    <Text style={styles.tableValue}>{property.totalFloors || 12}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Facing direction</Text>
                    <Text style={styles.tableValue}>{property.facing || 'East'}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Current condition</Text>
                    <Text style={styles.tableValue}>
                      {property.possessionDate || 'Ready to Move'}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Super built-up area</Text>
                    <Text style={styles.tableValue}>1,750 sq.ft</Text>
                  </View>
                  <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.tableKey}>Carpet area</Text>
                    <Text style={styles.tableValue}>{property.area || 1450} sq.ft</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Accordion 2: Location & Visit Schedule (Collapsed by default) */}
            <View style={[styles.accordionContainer, { marginTop: 10 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setLocationOpen(!locationOpen)}
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
                    <Text style={styles.tableValue}>{property.city || 'Vizag'}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Locality</Text>
                    <Text style={styles.tableValue}>Madhurawada</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Street / Area</Text>
                    <Text style={styles.tableValue}>IT SEZ Road</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Landmark</Text>
                    <Text style={styles.tableValue}>Near Apollo Clinic</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Average price/sq.ft</Text>
                    <Text style={styles.tableValue}>₹5,862 /sq.ft</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Property possession</Text>
                    <Text style={styles.tableValue}>Owner property</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Visit Availability</Text>
                    <Text style={styles.tableValue}>Everyday</Text>
                  </View>
                  <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.tableKey}>Visit time</Text>
                    <Text style={styles.tableValue}>10:00 AM - 6:00 PM</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Accordion 3: Price & Availability (Collapsed by default) */}
            <View style={[styles.accordionContainer, { marginTop: 10 }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setPriceOpen(!priceOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionHeaderTitle}>Price & Availability</Text>
                {priceOpen ? (
                  <ChevronDown size={18} color="#64748B" />
                ) : (
                  <ChevronRight size={18} color="#64748B" />
                )}
              </TouchableOpacity>

              {priceOpen && (
                <View style={styles.accordionBody}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Expected price</Text>
                    <Text style={styles.tableValue}>
                      {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}`}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableKey}>Price negotiable</Text>
                    <Text style={styles.tableValue}>Yes</Text>
                  </View>
                  <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.tableKey}>Available From</Text>
                    <Text style={styles.tableValue}>Ready to Move</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ── 6. Amenities ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Amenities</Text>
            <View style={styles.amenitiesWrap}>
              {(property.amenities && property.amenities.length > 0
                ? property.amenities
                : ['Lift', 'Security', 'Parking', 'Power Backup', 'Gym', 'Swimming Pool', 'Club House', 'CCTV']
              ).map((amenity) => {
                const getIcon = AMENITY_ICONS[amenity] || ((c: string) => <ShieldCheck size={13} color={c} />);
                return (
                  <View key={amenity} style={styles.amenityChip}>
                    {getIcon('#475569')}
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── 6b. Owner Declaration Section ── */}
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
                  {property.ownerName?.replace(/\s*\(.*\)/, '') || 'Rajesh Kumar'}
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
                  Purchased - {property.yearBuilt || 2024}
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
                <Text style={styles.declarationValue}>No</Text>
              </View>

              <View style={[styles.declarationRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.declarationLabel}>Court case</Text>
                <Text style={styles.declarationValue}>None</Text>
              </View>
            </View>
          </View>

          {/* ── 7. Compact Owner Details Card (Matching Reference 2) ── */}
          <View style={styles.ownerCard}>
            <Text style={styles.ownerCardTitle}>Owner Details</Text>
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
                  <Text style={styles.verifiedOwnerBadgeText}>Verified owner</Text>
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
      <View style={styles.bottomBarContainer}>
        {/* Sub Row: Compare & Chat */}
        <View style={styles.bottomSubRow}>
          <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => push({ name: 'compare', params: { property } })}
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
      {/* ── 10. Owner Details Bottom Sheet Modal ── */}
      <Modal
        visible={ownerModalVisible}
        transparent
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
