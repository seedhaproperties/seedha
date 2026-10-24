import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Heart, MapPin, BedDouble, Bath, Square, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import type { Property } from '../types';
import colors from '../theme/colors';

interface Props {
  property: Property;
  compact?: boolean;
  horizontal?: boolean;
}

const getBadge = (type: Property['listingType']) => {
  if (type === 'buy') return { label: 'For Sale', bg: colors.primary };
  if (type === 'rent') return { label: 'For Rent', bg: colors.secondary };
  return { label: 'Commercial', bg: colors.accent };
};

export default function PropertyCard({ property, compact = false, horizontal = false }: Props) {
  const { push, toggleSaved, savedIds } = useApp();
  const saved = savedIds.has(property.id);
  const badge = getBadge(property.listingType);

  // Micro-animations: Card scale & Heart pop
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const isNative = Platform.OS !== 'web';

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: isNative,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: isNative,
    }).start();
  };

  const handleHeartPress = () => {
    // Spring pop animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: isNative,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: isNative,
      }),
    ]).start();

    toggleSaved(property.id);
  };

  if (horizontal) {
    return (
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <TouchableOpacity
          onPress={() => push({ name: 'propertyDetail', params: { property } })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.horizontalCard}
          activeOpacity={0.92}
        >
          <View style={styles.horizontalImageContainer}>
            <Image source={{ uri: property.image }} style={styles.horizontalImage} />
            <View style={[styles.badge, { backgroundColor: badge.bg, top: 8, left: 8 }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          </View>
          <View style={styles.horizontalContent}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.horizontalTitle} numberOfLines={1}>
                  {property.title}
                </Text>
                {property.verified && (
                  <View style={styles.goldMiniBadge}>
                    <ShieldCheck size={12} color={colors.gold} strokeWidth={2.4} />
                  </View>
                )}
              </View>
              <View style={styles.locationRow}>
                <MapPin size={11} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {property.location}
                </Text>
              </View>
              <Text style={styles.priceText}>{property.priceLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              {property.bedrooms > 0 && (
                <View style={styles.metaItem}>
                  <BedDouble size={11} strokeWidth={1.5} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{property.bedrooms} Bed</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Bath size={11} strokeWidth={1.5} color={colors.textSecondary} />
                <Text style={styles.metaText}>{property.bathrooms} Bath</Text>
              </View>
              <View style={styles.metaItem}>
                <Square size={11} strokeWidth={1.5} color={colors.textSecondary} />
                <Text style={styles.metaText}>{property.area} sq.ft</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const imgHeight = compact ? 130 : 180;

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        onPress={() => push({ name: 'propertyDetail', params: { property } })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.verticalCard}
        activeOpacity={0.92}
      >
        <View style={[styles.imageContainer, { height: imgHeight }]}>
          <Image source={{ uri: property.image }} style={styles.verticalImage} />
          
          {/* Listing Type Badge */}
          <View style={[styles.badge, { backgroundColor: badge.bg, top: 10, left: 10 }]}>
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>

          {/* Animated Heart Button */}
          <Animated.View style={[styles.heartButtonWrapper, { transform: [{ scale: heartScale }] }]}>
            <TouchableOpacity
              onPress={handleHeartPress}
              style={styles.heartButton}
              activeOpacity={0.8}
            >
              <Heart
                size={16}
                fill={saved ? colors.accent : 'transparent'}
                color={saved ? colors.accent : colors.textMuted}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Luxury Gold Verified Tag */}
          {property.verified && (
            <View style={styles.verifiedBadge}>
              <Sparkles size={10} color={colors.gold} strokeWidth={2.4} style={{ marginRight: 3 }} />
              <ShieldCheck size={11} color={colors.gold} strokeWidth={2.2} />
              <Text style={styles.verifiedText}>Verified Title</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.verticalTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={11} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.locationText} numberOfLines={1}>
              {property.location}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.verticalPrice}>{property.priceLabel}</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>Direct Owner</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            {property.bedrooms > 0 && (
              <View style={styles.metaItem}>
                <BedDouble size={11} strokeWidth={1.8} color={colors.textSecondary} />
                <Text style={styles.metaText}>{property.bedrooms} Bed</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Bath size={11} strokeWidth={1.8} color={colors.textSecondary} />
              <Text style={styles.metaText}>{property.bathrooms} Bath</Text>
            </View>
            <View style={styles.metaItem}>
              <Square size={11} strokeWidth={1.8} color={colors.textSecondary} />
              <Text style={styles.metaText}>{property.area} sq.ft</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizontalTitle: {
    fontFamily: colors.fontFamily,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  goldMiniBadge: {
    backgroundColor: colors.goldBg,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontFamily: colors.fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  priceText: {
    fontFamily: colors.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaText: {
    fontFamily: colors.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  verticalCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  verticalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButtonWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderGold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  verifiedText: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
    marginLeft: 3,
  },
  cardContent: {
    padding: 14,
  },
  verticalTitle: {
    fontFamily: colors.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  verticalPrice: {
    fontFamily: colors.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  verifiedPill: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPillText: {
    fontFamily: colors.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 6,
  },
});
