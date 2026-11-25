import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  House,
  KeyRound,
  Building2,
  Shield,
  Landmark,
  FileSignature,
  UserCheck,
  ChevronRight,
  LogOut,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Users,
  Building,
  FileText,
  Bell,
  Trash2,
  X,
  AlertTriangle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { AdminCategory, AdminItem } from '../../types';
import colors from '../../theme/colors';

type MainSection = 'queues' | 'properties' | 'users' | 'team' | 'reports' | 'notifications';

const queueTabs: { id: AdminCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Incoming', icon: Filter },
  { id: 'flat_building', label: 'Buy / Sell Property', icon: House },
  { id: 'rent', label: 'Rent Details', icon: KeyRound },
  { id: 'commercial', label: 'Commercial Space', icon: Building2 },
  { id: 'pg_hostel', label: 'PG & Hostel', icon: House },
  { id: 'property_management', label: 'Property Mgmt', icon: Shield },
  { id: 'home_loan', label: 'Home Loans', icon: Landmark },
  { id: 'rental_agreement', label: 'Rental Agreements', icon: FileSignature },
  { id: 'owner_background', label: 'Owner Background', icon: UserCheck },
];

export default function AdminDashboardScreen() {
  const { push, logoutAdmin, setTab, adminRequests, updateAdminRequest } = useApp();

  // Navigation & Filter States
  const [activeSection, setActiveSection] = useState<MainSection>('queues');
  const [selectedQueueTab, setSelectedQueueTab] = useState<AdminCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Backend Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [overview, setOverview] = useState<any | null>(null);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [teamList, setTeamList] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Fetch all dashboard data from NestJS Backend APIs
  const fetchDashboardData = useCallback(async (isPullRefresh = false) => {
    if (!isPullRefresh) setLoading(true);
    setErrorMsg(null);

    try {
      const [
        overviewRes,
        requestsRes,
        propertiesRes,
        usersRes,
        teamRes,
        reportsRes,
        notifsRes,
      ] = await Promise.all([
        api.admin.getOverview().catch(() => null),
        api.admin.getAllRequests().catch(() => []),
        api.admin.getListings().catch(() => []),
        api.admin.getUsers().catch(() => []),
        api.admin.getTeam().catch(() => []),
        api.admin.getReports().catch(() => null),
        api.admin.getNotifications().catch(() => []),
      ]);

      setOverview(overviewRes);
      setRequestsList(Array.isArray(requestsRes) ? requestsRes : []);
      setPropertiesList(Array.isArray(propertiesRes) ? propertiesRes : []);
      setUsersList(Array.isArray(usersRes) ? usersRes : []);
      setTeamList(Array.isArray(teamRes) ? teamRes : []);
      setReportsData(reportsRes);
      setNotificationsList(Array.isArray(notifsRes) ? notifsRes : []);
    } catch (err: any) {
      console.error('[AdminDashboardScreen] Error fetching live data:', err);
      setErrorMsg('Could not load data from NestJS backend. Ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  const handleExitAdmin = () => {
    logoutAdmin();
    setTab('home');
  };

  // Quick Action: Delete Property from database
  const handleDeleteProperty = (propertyId: string, title: string) => {
    const doDelete = async () => {
      try {
        await api.admin.deleteProperty(propertyId);
        Alert.alert('Deleted', `Property "${title}" was permanently removed from database.`);
        fetchDashboardData(true);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to delete property.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to permanently delete "${title}" from the database?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to permanently delete "${title}" from the database?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  // Quick Action: Verify and Publish Property
  const handleQuickPublish = async (propertyId: string) => {
    try {
      await api.admin.verifyAndPublishProperty(propertyId);
      Alert.alert('Published', 'Property verified and published to live portal listings!');
      fetchDashboardData(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to publish property.');
    }
  };

  // Helper for Queue Category Metadata
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'flat_building':
        return { label: 'Flat/Building', color: colors.primary, bg: colors.primaryBg, icon: House };
      case 'rent':
        return { label: 'Rent', color: colors.secondary, bg: colors.secondaryBg, icon: KeyRound };
      case 'commercial':
        return { label: 'Commercial', color: colors.accent, bg: colors.accentBg, icon: Building2 };
      case 'property_management':
        return { label: 'Property Mgmt', color: colors.secondary, bg: colors.secondaryBg, icon: Shield };
      case 'home_loan':
        return { label: 'Home Loan', color: colors.primary, bg: colors.tertiaryBg, icon: Landmark };
      case 'rental_agreement':
      case 'rental_agreements':
        return { label: 'Rental Agreement', color: colors.accent, bg: colors.accentBg, icon: FileSignature };
      case 'owner_background':
        return { label: 'Owner BG Check', color: colors.primary, bg: colors.primaryBg, icon: UserCheck };
      default:
        return { label: 'General Listing', color: colors.primary, bg: colors.primaryBg, icon: Building };
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'published' || s === 'sent_to_user' || s === 'sent_digitally' || s === 'user_contacted' || s === 'owner_contacted') {
      return { text: 'COMPLETED', color: colors.secondary, bg: colors.secondaryBg };
    }
    if (s.includes('reject')) {
      return { text: 'REJECTED', color: colors.danger, bg: colors.dangerBg };
    }
    if (s === 'verified' || s === 'location_check_passed') {
      return { text: 'VERIFIED', color: '#16A34A', bg: '#DCFCE7' };
    }
    if (s === 'in_review' || s === 'field_visit' || s === 'verification_in_progress') {
      return { text: 'IN PROGRESS', color: colors.accent, bg: colors.accentBg };
    }
    return { text: 'PENDING CHECK', color: colors.primary, bg: colors.tertiaryBg };
  };

  // Filter requests based on Queue tab, Status filter, and Search Query
  const filteredRequests = requestsList.filter((item) => {
    // 1. Queue module filter
    if (selectedQueueTab !== 'all') {
      const matchCat =
        item.module === selectedQueueTab ||
        (selectedQueueTab === 'flat_building' && item.module === 'buy_sell') ||
        (selectedQueueTab === 'buy_sell' && item.module === 'flat_building') ||
        (selectedQueueTab === 'rental_agreement' && item.module === 'rental_agreements');
      if (!matchCat) return false;
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      const s = (item.status || '').toLowerCase();
      if (statusFilter === 'pending' && s !== 'new' && s !== 'pending_review' && s !== 'submitted') return false;
      if (statusFilter === 'in_review' && s !== 'in_review' && s !== 'field_visit' && s !== 'verification_in_progress') return false;
      if (statusFilter === 'verified' && s !== 'verified' && s !== 'published') return false;
      if (statusFilter === 'completed' && s !== 'published' && s !== 'sent_to_user' && s !== 'sent_digitally') return false;
      if (statusFilter === 'rejected' && !s.includes('reject')) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchName = (item.ownerOrUser?.name || '').toLowerCase().includes(q);
      const matchPhone = (item.ownerOrUser?.phone || '').includes(q);
      const matchLoc = (item.locality || item.city || '').toLowerCase().includes(q);
      const matchId = (item.id || item.code || '').toLowerCase().includes(q);
      if (!matchTitle && !matchName && !matchPhone && !matchLoc && !matchId) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.shieldBadge}>
            <ShieldCheck size={20} color={colors.textWhite} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Seedha Admin Hub</Text>
            <Text style={styles.headerSub}>Live Database Operations & Verification</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => fetchDashboardData(true)}
            style={styles.refreshIconBtn}
            activeOpacity={0.8}
          >
            <RefreshCw size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleExitAdmin} style={styles.exitBtn} activeOpacity={0.8}>
            <LogOut size={15} color={colors.primary} />
            <Text style={styles.exitBtnText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Section Navigation Bar */}
      <View style={styles.mainNavSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainNavScroll}>
          {[
            { id: 'queues', label: 'Review Queues', icon: Filter, count: requestsList.length },
            { id: 'properties', label: 'Properties DB', icon: Building, count: propertiesList.length },
            { id: 'users', label: 'Users', icon: Users, count: usersList.length },
            { id: 'team', label: 'Field Agents', icon: ShieldCheck, count: teamList.length },
            { id: 'reports', label: 'Audit Reports', icon: FileText },
            { id: 'notifications', label: 'Alerts', icon: Bell, count: notificationsList.length },
          ].map((sec) => {
            const isSelected = activeSection === sec.id;
            const Icon = sec.icon;
            return (
              <TouchableOpacity
                key={sec.id}
                onPress={() => setActiveSection(sec.id as MainSection)}
                style={[styles.mainNavChip, isSelected && styles.mainNavChipActive]}
                activeOpacity={0.8}
              >
                <Icon size={14} color={isSelected ? colors.textWhite : colors.primary} />
                <Text style={[styles.mainNavChipText, isSelected && styles.mainNavChipTextActive]}>
                  {sec.label}
                </Text>
                {typeof sec.count === 'number' && (
                  <View style={[styles.mainNavBadge, isSelected && styles.mainNavBadgeActive]}>
                    <Text style={[styles.mainNavBadgeText, isSelected && styles.mainNavBadgeTextActive]}>
                      {sec.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Real Live Metrics Banner */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{overview?.totalIncoming ?? requestsList.length}</Text>
          <Text style={styles.metricLabel}>Total Requests</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: '#16A34A' }]}>
            {overview?.totalPublishedProperties ?? propertiesList.filter((p) => p.status === 'PUBLISHED').length}
          </Text>
          <Text style={styles.metricLabel}>Live Properties</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: colors.primary }]}>
            {overview?.totalUsers ?? usersList.length}
          </Text>
          <Text style={styles.metricLabel}>Users in DB</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricVal, { color: colors.secondary }]}>
            {teamList.length || 4}
          </Text>
          <Text style={styles.metricLabel}>Field Agents</Text>
        </View>
      </View>

      {/* SECTION 1: REVIEW QUEUES */}
      {activeSection === 'queues' && (
        <View style={{ flex: 1 }}>
          {/* 7 Queues Horizontal Tab Bar */}
          <View style={styles.tabsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {queueTabs.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? requestsList.length
                    : requestsList.filter((r) =>
                        tab.id === 'rental_agreement'
                          ? r.module === 'rental_agreements'
                          : tab.id === 'flat_building'
                          ? r.module === 'flat_building' || r.module === 'buy_sell'
                          : r.module === tab.id
                      ).length;
                const isSelected = selectedQueueTab === tab.id;
                const Icon = tab.icon;

                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedQueueTab(tab.id)}
                    style={[styles.tabChip, isSelected && styles.tabChipActive]}
                    activeOpacity={0.8}
                  >
                    <Icon size={13} color={isSelected ? colors.textWhite : colors.primary} />
                    <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                      {tab.label}
                    </Text>
                    <View style={[styles.tabCountBadge, isSelected && styles.tabCountBadgeActive]}>
                      <Text style={[styles.tabCountText, isSelected && styles.tabCountTextActive]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Bar & Status Filter Row */}
          <View style={styles.filterBarContainer}>
            <View style={styles.searchWrap}>
              <Search size={15} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by title, owner name, phone, locality..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={15} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChipsRow}>
              {[
                { id: 'all', label: 'All Status' },
                { id: 'pending', label: 'Pending' },
                { id: 'in_review', label: 'In Review' },
                { id: 'verified', label: 'Verified' },
                { id: 'completed', label: 'Completed' },
                { id: 'rejected', label: 'Rejected' },
              ].map((st) => (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setStatusFilter(st.id)}
                  style={[styles.statusFilterChip, statusFilter === st.id && styles.statusFilterChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusFilterText, statusFilter === st.id && styles.statusFilterTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Submissions List */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.listPadding}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listTitle}>
                  {selectedQueueTab === 'all'
                    ? 'All Received Database Submissions'
                    : `Queue: ${queueTabs.find((t) => t.id === selectedQueueTab)?.label}`}
                </Text>
                <Text style={styles.listCount}>{filteredRequests.length} Live Items</Text>
              </View>

              {loading ? (
                <View style={styles.stateContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.stateText}>Loading live submissions from database...</Text>
                </View>
              ) : errorMsg ? (
                <View style={styles.errorContainer}>
                  <AlertTriangle size={32} color={colors.danger} />
                  <Text style={styles.errorTitle}>Backend Connection Error</Text>
                  <Text style={styles.errorDesc}>{errorMsg}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => fetchDashboardData()}>
                    <Text style={styles.retryBtnText}>Retry Connection</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredRequests.length === 0 ? (
                <View style={styles.stateContainer}>
                  <CheckCircle2 size={40} color={colors.secondary} />
                  <Text style={styles.emptyTitle}>No Submissions Found</Text>
                  <Text style={styles.emptyDesc}>
                    {searchQuery
                      ? 'No items match your search term. Try another keyword.'
                      : 'There are no pending requests in this queue right now.'}
                  </Text>
                </View>
              ) : (
                filteredRequests.map((item) => {
                  const meta = getCategoryMeta(item.module);
                  const statusBadge = getStatusBadge(item.status);
                  const Icon = meta.icon;

                  // Adapt to AdminItem shape for review screen
                  const adminItemForReview: AdminItem = {
                    id: item.id,
                    category: (item.module === 'rental_agreements' ? 'rental_agreement' : item.module) as AdminCategory,
                    title: item.title,
                    subtitle: item.subtitle,
                    submittedBy: item.ownerOrUser?.name || 'Applicant',
                    phone: item.ownerOrUser?.phone || '+91 98765 43210',
                    date: item.relativeTime || 'Recent',
                    location: item.locality || item.city || 'Hyderabad',
                    city: item.city || 'Hyderabad',
                    status: item.status,
                    stage:
                      item.status === 'published' || item.status === 'sent_to_user' || item.status === 'sent_digitally'
                        ? 3
                        : item.status === 'verified'
                        ? 2
                        : item.status === 'field_visit' || item.status === 'in_review'
                        ? 1
                        : 0,
                    notes: item.fieldVisit?.notes || '',
                    details: {
                      price: item.priceDisplay,
                      config: item.configLabel,
                      area: item.areaSqFt ? `${item.areaSqFt} sq.ft` : undefined,
                      ...(item.homeLoan || {}),
                      ...(item.rentalAgreement || {}),
                      ...(item.ownerBackground || {}),
                    },
                  };

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => push({ name: 'adminReview', params: { item: adminItemForReview } })}
                      style={styles.requestCard}
                      activeOpacity={0.88}
                    >
                      <View style={styles.cardTopRow}>
                        <View style={[styles.catBadge, { backgroundColor: meta.bg }]}>
                          <Icon size={12} color={meta.color} />
                          <Text style={[styles.catBadgeText, { color: meta.color }]}>{meta.label}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.requestTitle}>{item.title}</Text>
                      <Text style={styles.requestSubtitle}>{item.subtitle}</Text>

                      <View style={styles.cardDetailsRow}>
                        <Text style={styles.detailItemText}>👤 {item.ownerOrUser?.name || 'Applicant'}</Text>
                        <Text style={styles.detailItemText}>📞 {item.ownerOrUser?.phone || 'No Phone'}</Text>
                        <Text style={styles.detailItemText}>📍 {item.locality || item.city || 'Hyderabad'}</Text>
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.timeRow}>
                          <Clock size={12} color={colors.textMuted} />
                          <Text style={styles.timeText}>{item.relativeTime || item.submittedAt || 'Recent'}</Text>
                        </View>
                        <View style={styles.actionPrompt}>
                          <Text style={styles.actionPromptText}>Review & Process</Text>
                          <ChevronRight size={14} color={colors.primary} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* SECTION 2: PROPERTIES DATABASE */}
      {activeSection === 'properties' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.listPadding}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Live Properties in Database</Text>
              <Text style={styles.listCount}>{propertiesList.length} Total</Text>
            </View>

            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateText}>Loading database properties...</Text>
              </View>
            ) : propertiesList.length === 0 ? (
              <View style={styles.stateContainer}>
                <Building size={40} color={colors.primary} />
                <Text style={styles.emptyTitle}>No Properties Found</Text>
                <Text style={styles.emptyDesc}>No properties exist in the database yet.</Text>
              </View>
            ) : (
              propertiesList.map((p) => (
                <View key={p.id} style={styles.requestCard}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.catBadge, { backgroundColor: '#E0F2FE' }]}>
                      <Building size={12} color="#0284C7" />
                      <Text style={[styles.catBadgeText, { color: '#0284C7' }]}>
                        {p.listingType || 'RESIDENTIAL'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            p.status === 'PUBLISHED'
                              ? '#DCFCE7'
                              : p.status === 'REJECTED'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              p.status === 'PUBLISHED'
                                ? '#16A34A'
                                : p.status === 'REJECTED'
                                ? '#DC2626'
                                : '#D97706',
                          },
                        ]}
                      >
                        {p.status || 'NEW'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestTitle}>{p.title}</Text>
                  <Text style={styles.requestSubtitle}>
                    {p.bedrooms ? `${p.bedrooms} BHK · ` : ''}
                    {p.area ? `${p.area} sq.ft · ` : ''}
                    {p.priceLabel || `₹${(p.price || 0).toLocaleString('en-IN')}`}
                  </Text>

                  <View style={styles.cardDetailsRow}>
                    <Text style={styles.detailItemText}>📍 {p.location || p.city || 'Hyderabad'}</Text>
                    <Text style={styles.detailItemText}>👤 {p.ownerName || 'Verified Owner'}</Text>
                    <Text style={styles.detailItemText}>📞 {p.ownerPhone || 'N/A'}</Text>
                  </View>

                  {p.fullAddress ? (
                    <Text style={{ fontSize: 11, color: '#4B5563', marginBottom: 8 }}>
                      Address: {p.fullAddress}
                    </Text>
                  ) : null}

                  <View style={styles.propActionRow}>
                    {p.status !== 'PUBLISHED' && (
                      <TouchableOpacity
                        style={[styles.smallActionBtn, { backgroundColor: '#16A34A' }]}
                        onPress={() => handleQuickPublish(p.id)}
                        activeOpacity={0.8}
                      >
                        <CheckCircle2 size={13} color="#FFFFFF" />
                        <Text style={styles.smallActionBtnText}>Verify & Publish</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.smallActionBtn, { backgroundColor: '#DC2626' }]}
                      onPress={() => handleDeleteProperty(p.id, p.title)}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={13} color="#FFFFFF" />
                      <Text style={styles.smallActionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* SECTION 3: USERS LIST */}
      {activeSection === 'users' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.listPadding}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Registered Users in Database</Text>
              <Text style={styles.listCount}>{usersList.length} Accounts</Text>
            </View>

            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateText}>Loading users...</Text>
              </View>
            ) : usersList.length === 0 ? (
              <View style={styles.stateContainer}>
                <Users size={40} color={colors.primary} />
                <Text style={styles.emptyTitle}>No Users Found</Text>
                <Text style={styles.emptyDesc}>No user accounts found in the database.</Text>
              </View>
            ) : (
              usersList.map((u) => (
                <View key={u.id} style={styles.requestCard}>
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.requestTitle, { marginBottom: 0 }]}>{u.name || 'User'}</Text>
                    <View style={[styles.catBadge, { backgroundColor: '#F3F4F6' }]}>
                      <Text style={[styles.catBadgeText, { color: '#374151' }]}>{u.role || 'USER'}</Text>
                    </View>
                  </View>
                  <View style={{ gap: 4, marginTop: 8 }}>
                    <Text style={styles.userMetaText}>📞 Phone: {u.phone || 'N/A'}</Text>
                    <Text style={styles.userMetaText}>✉️ Email: {u.email || 'N/A'}</Text>
                    <Text style={styles.userMetaText}>📍 City: {u.city || 'Hyderabad'}</Text>
                    <Text style={styles.userMetaText}>ID: {u.id}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* SECTION 4: FIELD AGENTS & TEAM */}
      {activeSection === 'team' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.listPadding}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Operations & Field Inspection Team</Text>
              <Text style={styles.listCount}>{teamList.length} Active Officers</Text>
            </View>

            {teamList.map((agent) => (
              <View key={agent.id} style={styles.requestCard}>
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.agentInitialsCircle}>
                      <Text style={styles.agentInitialsText}>{agent.initials || 'AG'}</Text>
                    </View>
                    <View>
                      <Text style={styles.requestTitle}>{agent.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.secondary, fontWeight: '600' }}>
                        {agent.role}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#16A34A' }]}>ONLINE</Text>
                  </View>
                </View>

                <View style={{ gap: 4, marginTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 }}>
                  <Text style={styles.userMetaText}>📍 Operating Zone: {agent.zone}</Text>
                  <Text style={styles.userMetaText}>📞 Phone: {agent.phone}</Text>
                  <Text style={styles.userMetaText}>📋 Active Tasks Assigned: {agent.activeTasks}</Text>
                  <Text style={styles.userMetaText}>⚡ Avg Turnaround: {agent.avgTurnaroundHrs} hours</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SECTION 5: AUDIT REPORTS */}
      {activeSection === 'reports' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.listPadding}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Platform Summary & Audit Logs</Text>
              <Text style={styles.listCount}>Real-time Audit</Text>
            </View>

            {/* Platform Health Card */}
            <View style={[styles.requestCard, { backgroundColor: '#F8FAFC' }]}>
              <Text style={[styles.requestTitle, { marginBottom: 8 }]}>Database Health Breakdown</Text>
              <View style={{ gap: 6 }}>
                <Text style={styles.userMetaText}>• Total Properties in DB: {reportsData?.summary?.totalProperties ?? propertiesList.length}</Text>
                <Text style={styles.userMetaText}>• Verified & Live Listings: {reportsData?.summary?.publishedProperties ?? 0}</Text>
                <Text style={styles.userMetaText}>• Rejected Listings: {reportsData?.summary?.rejectedProperties ?? 0}</Text>
                <Text style={styles.userMetaText}>• Registered Users: {reportsData?.summary?.totalRegisteredUsers ?? usersList.length}</Text>
                <Text style={styles.userMetaText}>• Active Services & Check Requests: {reportsData?.summary?.activeRequests ?? 0}</Text>
              </View>
            </View>

            {/* Audit Logs */}
            <Text style={[styles.listTitle, { marginTop: 12, marginBottom: 8 }]}>Recent Audit Events</Text>
            {(reportsData?.auditLogs || []).map((aud: any) => (
              <View key={aud.id} style={[styles.requestCard, { padding: 12 }]}>
                <View style={styles.cardTopRow}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
                    {aud.propertyTitle || 'Property Event'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#374151' }]}>{aud.action}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                  Owner: {aud.owner} · Time: {aud.timestamp}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* SECTION 6: SYSTEM ALERTS */}
      {activeSection === 'notifications' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.listPadding}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Live Administrative Notifications</Text>
              <Text style={styles.listCount}>{notificationsList.length} Notifications</Text>
            </View>

            {notificationsList.length === 0 ? (
              <View style={styles.stateContainer}>
                <CheckCircle2 size={40} color={colors.secondary} />
                <Text style={styles.emptyTitle}>No Alerts</Text>
                <Text style={styles.emptyDesc}>All systems normal. No active warnings or alerts.</Text>
              </View>
            ) : (
              notificationsList.map((notif: any) => (
                <View key={notif.id} style={styles.requestCard}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.requestTitle}>{notif.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            notif.type === 'success'
                              ? '#DCFCE7'
                              : notif.type === 'danger'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              notif.type === 'success'
                                ? '#16A34A'
                                : notif.type === 'danger'
                                ? '#DC2626'
                                : '#D97706',
                          },
                        ]}
                      >
                        {notif.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestSubtitle}>{notif.message}</Text>
                  <Text style={styles.timeText}>🕒 {notif.time}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  exitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  mainNavSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 10,
  },
  mainNavScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  mainNavChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  mainNavChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mainNavChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  mainNavChipTextActive: {
    color: colors.textWhite,
  },
  mainNavBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  mainNavBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  mainNavBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  mainNavBadgeTextActive: {
    color: colors.textWhite,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricVal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  tabsSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tabChipTextActive: {
    color: colors.textWhite,
  },
  tabCountBadge: {
    backgroundColor: colors.tertiaryBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  tabCountTextActive: {
    color: colors.textWhite,
  },
  filterBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  statusChipsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  statusFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusFilterText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  listPadding: {
    padding: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  listCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 3,
  },
  requestSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: 8,
  },
  detailItemText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  propActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userMetaText: {
    fontSize: 12,
    color: '#374151',
  },
  agentInitialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  stateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  errorDesc: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
