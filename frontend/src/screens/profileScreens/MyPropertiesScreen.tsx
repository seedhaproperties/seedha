import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Plus,
  Eye,
  MessageSquare,
  Pencil,
  Rocket,
  Trash2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export interface MyPropertyItem {
  id: string;
  title: string;
  type: 'Buy' | 'Rent' | 'Commercial';
  status: 'Live' | 'Under review' | 'Closed';
  location: string;
  price: string;
  image: string;
  views: number;
  leads: number;
  postedText: string;
}

const INITIAL_PROPERTIES: MyPropertyItem[] = [
  {
    id: 'myprop-1',
    title: '3 BHK Apartment',
    type: 'Buy',
    status: 'Live',
    location: 'Madhurawada, Vizag',
    price: '₹85,00,000',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&fit=crop&auto=format',
    views: 234,
    leads: 12,
    postedText: 'Posted 2 days ago',
  },
  {
    id: 'myprop-2',
    title: '4 BHK Premium Villa',
    type: 'Buy',
    status: 'Under review',
    location: 'Gachibowli, Hyderabad',
    price: '₹1,85,00,000',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&auto=format',
    views: 0,
    leads: 0,
    postedText: 'Submitted today',
  },
  {
    id: 'myprop-3',
    title: '2 BHK Independent House',
    type: 'Rent',
    status: 'Live',
    location: 'Gajuwaka, Vizag',
    price: '₹15,000/month',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format',
    views: 148,
    leads: 9,
    postedText: 'Posted 1 week ago',
  },
  {
    id: 'myprop-4',
    title: 'Premium Office Space',
    type: 'Commercial',
    status: 'Closed',
    location: 'HITEC City, Hyderabad',
    price: '₹45,000/month',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format',
    views: 88,
    leads: 4,
    postedText: 'Posted 2 weeks ago',
  },
  {
    id: 'myprop-5',
    title: 'Luxury 3 BHK Penthouse',
    type: 'Buy',
    status: 'Live',
    location: 'Madhurawada, Vizag',
    price: '₹1,25,00,000',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&auto=format',
    views: 312,
    leads: 18,
    postedText: 'Posted 3 weeks ago',
  },
];

export default function MyPropertiesScreen() {
  const { pop, push, setTab } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'buy' | 'rent' | 'commercial'>('all');
  const [propertiesList, setPropertiesList] = useState<MyPropertyItem[]>(INITIAL_PROPERTIES);

  const buyCount = propertiesList.filter((p) => p.type === 'Buy').length;
  const rentCount = propertiesList.filter((p) => p.type === 'Rent').length;
  const commercialCount = propertiesList.filter((p) => p.type === 'Commercial').length;
  const allCount = propertiesList.length;

  const filteredProperties = propertiesList.filter((p) => {
    if (activeFilter === 'buy') return p.type === 'Buy';
    if (activeFilter === 'rent') return p.type === 'Rent';
    if (activeFilter === 'commercial') return p.type === 'Commercial';
    return true;
  });

  const handleRemove = (id: string, title: string) => {
    Alert.alert(
      'Remove Property',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPropertiesList((prev) => prev.filter((p) => p.id !== id));
          },
        },
      ]
    );
  };

  const handleBoost = (title: string) => {
    Alert.alert('Boost Listing', `"${title}" has been boosted to top search results for 7 days!`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
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
            <Text style={styles.pageTitle}>My Properties</Text>
            <Text style={styles.subtitle}>Everything you have posted</Text>
          </View>

          {/* Top Right: + Post Button */}
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => push({ name: 'postProperty' })}
            activeOpacity={0.85}
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {/* All */}
          <Pressable
            key="filter-all"
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>
              All
            </Text>
            <View style={[styles.filterBadge, activeFilter === 'all' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, activeFilter === 'all' && styles.filterBadgeTextActive]}>
                {allCount}
              </Text>
            </View>
          </Pressable>

          {/* Buy */}
          <Pressable
            key="filter-buy"
            style={[styles.filterPill, activeFilter === 'buy' && styles.filterPillActive]}
            onPress={() => setActiveFilter('buy')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'buy' && styles.filterPillTextActive]}>
              Buy
            </Text>
            <View style={[styles.filterBadge, activeFilter === 'buy' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, activeFilter === 'buy' && styles.filterBadgeTextActive]}>
                {buyCount}
              </Text>
            </View>
          </Pressable>

          {/* Rent */}
          <Pressable
            key="filter-rent"
            style={[styles.filterPill, activeFilter === 'rent' && styles.filterPillActive]}
            onPress={() => setActiveFilter('rent')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'rent' && styles.filterPillTextActive]}>
              Rent
            </Text>
            <View style={[styles.filterBadge, activeFilter === 'rent' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, activeFilter === 'rent' && styles.filterBadgeTextActive]}>
                {rentCount}
              </Text>
            </View>
          </Pressable>

          {/* Commercial */}
          <Pressable
            key="filter-commercial"
            style={[styles.filterPill, activeFilter === 'commercial' && styles.filterPillActive]}
            onPress={() => setActiveFilter('commercial')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'commercial' && styles.filterPillTextActive]}>
              Commercial
            </Text>
            <View style={[styles.filterBadge, activeFilter === 'commercial' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, activeFilter === 'commercial' && styles.filterBadgeTextActive]}>
                {commercialCount}
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>

      {/* Property Cards List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {filteredProperties.map((item) => {
          const isLive = item.status === 'Live';
          const isUnderReview = item.status === 'Under review';
          const isClosed = item.status === 'Closed';

          return (
            <View key={item.id} style={styles.card}>
              {/* Card Header Row: Image & Details */}
              <View style={styles.cardTopRow}>
                <Image source={{ uri: item.image }} style={styles.thumbImage} />

                <View style={styles.cardDetails}>
                  {/* Badges Row */}
                  <View style={styles.badgesRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>

                    {isLive && (
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>Live</Text>
                      </View>
                    )}

                    {isUnderReview && (
                      <View style={styles.reviewBadge}>
                        <Text style={styles.reviewBadgeText}>Under review</Text>
                      </View>
                    )}

                    {isClosed && (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>Closed</Text>
                      </View>
                    )}
                  </View>

                  {/* Title */}
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  {/* Location */}
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.location}
                  </Text>

                  {/* Price */}
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </View>

              {/* Metrics & Timestamp Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Eye size={13} color="#64748B" strokeWidth={2} />
                  <Text style={styles.metricText}>{item.views} views</Text>
                </View>

                <View style={styles.metricItem}>
                  <MessageSquare size={13} color="#64748B" strokeWidth={2} />
                  <Text style={styles.metricText}>{item.leads} leads</Text>
                </View>

                <Text style={styles.postedTimestamp}>{item.postedText}</Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => push({ name: 'postProperty' })}
                  activeOpacity={0.8}
                >
                  <Pencil size={13} color="#1E293B" strokeWidth={2.2} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleBoost(item.title)}
                  activeOpacity={0.8}
                >
                  <Rocket size={13} color="#1E293B" strokeWidth={2.2} />
                  <Text style={styles.actionBtnText}>Boost</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnDanger}
                  onPress={() => handleRemove(item.id, item.title)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={13} color="#EF4444" strokeWidth={2.2} />
                  <Text style={styles.actionBtnDangerText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredProperties.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>You haven't posted any properties in this category yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitles: {
    marginLeft: 14,
    flex: 1,
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
    marginTop: 2,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: '#334155',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterBadgeTextActive: {
    color: '#CBD5E1',
  },
  scrollList: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  liveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  reviewBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  closedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  postedTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
  },
  actionBtnDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
