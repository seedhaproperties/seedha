import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
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
  Building,
  AlertCircle,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { userSocket } from '../../services/socket';

export interface MyPropertyItem {
  id: string;
  title: string;
  type: 'Buy' | 'Rent' | 'Commercial';
  status: 'Live' | 'Under review' | 'Rejected' | 'Closed';
  rejectionReason?: string;
  location: string;
  price: string;
  image: string;
  views: number;
  leads: number;
  postedText: string;
}

export default function MyPropertiesScreen() {
  const { pop, push, setTab, user, updateUserProfile } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'buy' | 'rent' | 'commercial'>('all');
  const [propertiesList, setPropertiesList] = useState<MyPropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      const res = await api.properties.getMyProperties(user?.id);
      const rawList = res?.properties || (Array.isArray(res) ? res : []);
      
      const mapped: MyPropertyItem[] = rawList.map((p: any) => {
        const type: 'Buy' | 'Rent' | 'Commercial' =
          p.listingType === 'BUY'
            ? 'Buy'
            : p.listingType === 'COMMERCIAL'
            ? 'Commercial'
            : 'Rent';

        const status: 'Live' | 'Under review' | 'Rejected' | 'Closed' =
          p.status === 'REJECTED'
            ? 'Rejected'
            : p.status === 'CLOSED'
            ? 'Closed'
            : (p.status === 'PUBLISHED' || p.status === 'APPROVED' || p.verified === true)
            ? 'Live'
            : 'Under review';

        const image =
          p.images && p.images.length > 0
            ? p.images[0]
            : 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&fit=crop&auto=format';

        const postedText = p.createdAt
          ? `Posted ${new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}`
          : 'Submitted today';

        return {
          id: p.id,
          title: p.title || 'Seedha Property Listing',
          type,
          status,
          rejectionReason: p.rejectionReason,
          location: p.location || p.city || 'Hyderabad',
          price: p.priceLabel || (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Price on Request'),
          image,
          views: p.views || 0,
          leads: p.leads || 0,
          postedText,
        };
      });

      setPropertiesList(mapped);

      // Keep user summary count in sync
      if (updateUserProfile && user?.summary) {
        if (user.summary.propertiesCount !== mapped.length) {
          updateUserProfile({
            summary: {
              ...user.summary,
              propertiesCount: mapped.length,
            },
          });
        }
      }
    } catch (err) {
      console.error('[MyPropertiesScreen] Error loading user properties:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.summary, updateUserProfile]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Real-time status update synchronization via Socket.IO
  useEffect(() => {
    userSocket.connect(user?.id);

    const unsub = userSocket.onStatusUpdated((event) => {
      fetchProperties();
      if (Platform.OS === 'web') {
        console.log(`[Socket.IO] Property "${event.title}": ${event.message}`);
      } else {
        Alert.alert('Listing Update', event.message || `Property "${event.title}" status updated to ${event.status}`);
      }
    });

    return () => {
      unsub();
    };
  }, [user?.id, fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

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
          onPress: async () => {
            try {
              await api.properties.remove(id);
              const updated = propertiesList.filter((p) => p.id !== id);
              setPropertiesList(updated);
              if (updateUserProfile && user?.summary) {
                updateUserProfile({
                  summary: {
                    ...user.summary,
                    propertiesCount: Math.max(0, updated.length),
                  },
                });
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not remove property. Please try again.');
            }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E293B']} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1E293B" />
            <Text style={{ marginTop: 12, fontSize: 13, color: '#64748B' }}>Loading your properties...</Text>
          </View>
        ) : (
          filteredProperties.map((item) => {
            const isLive = item.status === 'Live';
            const isUnderReview = item.status === 'Under review';
            const isRejected = item.status === 'Rejected';
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

                      {isRejected && (
                        <View style={[styles.closedBadge, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                          <Text style={[styles.closedBadgeText, { color: '#DC2626' }]}>Rejected</Text>
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

                {/* Rejection notice box if rejected by admin */}
                {isRejected && (
                  <View style={styles.rejectionNoticeBox}>
                    <AlertCircle size={14} color="#DC2626" />
                    <Text style={styles.rejectionNoticeBoxText}>
                      Rejection Reason: {item.rejectionReason || 'Property did not meet Seedha physical inspection guidelines.'}
                    </Text>
                  </View>
                )}

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
          })
        )}

        {!loading && filteredProperties.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>You haven't posted any properties in this category yet.</Text>
            <TouchableOpacity
              style={[styles.postBtn, { marginTop: 16, alignSelf: 'center', paddingHorizontal: 20 }]}
              onPress={() => push({ name: 'postProperty' })}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.postBtnText}>Post a Property</Text>
            </TouchableOpacity>
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
  rejectionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  rejectionNoticeBoxText: {
    flex: 1,
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    lineHeight: 15,
  },
});
