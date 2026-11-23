import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Pencil,
  CheckCircle2,
  Heart,
  Activity,
  Home,
  Briefcase,
  User,
  CreditCard,
  ShieldCheck,
  LogOut,
  FileText,
  Headphones,
  Settings,
  Shield,
  SlidersHorizontal,
  Plus,
  Minus,
  X,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function ProfileScreen() {
  const { push, pop, user, isAdmin, signOut, isAuthenticated, requireAuth, setTab, refreshUserProfile, savedIds, updateUserProfile } = useApp();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && refreshUserProfile) {
      setLoadingProfile(true);
      refreshUserProfile().finally(() => {
        if (active) setLoadingProfile(false);
      });
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated, refreshUserProfile]);

  const displayName = user?.name || (isAuthenticated ? 'Seedha User' : 'Guest User');
  const displayPhone = user?.phone || (isAuthenticated ? '' : 'Sign in to access your account');
  const roleLabel = user?.userRole || user?.role || (isAuthenticated ? 'USER' : 'GUEST');
  const displayEmail = user?.email || (isAuthenticated ? '' : 'Browse properties, listings & more');
  const avatarUrl = user?.avatarUrl;

  const savedCount = user?.summary?.savedCount !== undefined
    ? user.summary.savedCount
    : (savedIds ? savedIds.size : 3);
  const activityCount = user?.summary?.activityCount !== undefined ? user.summary.activityCount : 14;
  const propertiesCount = user?.summary?.propertiesCount !== undefined ? user.summary.propertiesCount : 5;
  const servicesCount = user?.summary?.servicesCount !== undefined ? user.summary.servicesCount : 4;

  const [showCountsModal, setShowCountsModal] = useState(false);
  const [editSaved, setEditSaved] = useState(savedCount);
  const [editActivity, setEditActivity] = useState(activityCount);
  const [editProperties, setEditProperties] = useState(propertiesCount);
  const [editServices, setEditServices] = useState(servicesCount);
  const [isSavingCounts, setIsSavingCounts] = useState(false);

  useEffect(() => {
    setEditSaved(savedCount);
    setEditActivity(activityCount);
    setEditProperties(propertiesCount);
    setEditServices(servicesCount);
  }, [savedCount, activityCount, propertiesCount, servicesCount]);

  const handleSaveCounts = async () => {
    try {
      setIsSavingCounts(true);
      const newSummary = {
        savedCount: Math.max(0, editSaved),
        activityCount: Math.max(0, editActivity),
        propertiesCount: Math.max(0, editProperties),
        servicesCount: Math.max(0, editServices),
      };

      await api.auth.updateProfile({ summary: newSummary });
      if (updateUserProfile) {
        updateUserProfile({ summary: newSummary });
      }
      setShowCountsModal(false);
      Alert.alert('Counts Updated', 'Quick access counts updated and saved successfully.');
    } catch (err: any) {
      console.warn('Failed saving summary counts to backend, updating locally:', err);
      if (updateUserProfile) {
        updateUserProfile({
          summary: {
            savedCount: Math.max(0, editSaved),
            activityCount: Math.max(0, editActivity),
            propertiesCount: Math.max(0, editProperties),
            servicesCount: Math.max(0, editServices),
          },
        });
      }
      setShowCountsModal(false);
      Alert.alert('Counts Updated', 'Quick access counts updated successfully.');
    } finally {
      setIsSavingCounts(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Black Header */}
      <View style={styles.header}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              if (pop) pop();
              else setTab('home');
            }}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => push({ name: 'notifications' })}
            activeOpacity={0.8}
          >
            <Bell size={18} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* User Profile Card */}
        <View style={styles.userProfileCard}>
          {/* Avatar with Verified Badge */}
          <View style={styles.avatarContainer}>
            {isAuthenticated ? (
              <>
                {avatarUrl ? (
                  <Image
                    source={{
                      uri: avatarUrl,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={[styles.avatarImage, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>
                      {(displayName && displayName.trim().charAt(0).toUpperCase()) || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </>
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' }]}>
                <User size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
            )}
          </View>

          {/* User Details */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            </View>

            <Text style={styles.userPhone}>{displayPhone || 'No mobile added'}</Text>
            <Text style={styles.userEmail}>{displayEmail || 'No email added'}</Text>
          </View>

          {/* Edit Pencil Button or Sign In Button */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => push({ name: 'personalInformation' })}
              activeOpacity={0.8}
            >
              <Pencil size={15} color="#CBD5E1" strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.editButton, { width: 'auto', paddingHorizontal: 12, borderRadius: 12 }]}
              onPress={() => requireAuth(undefined, { name: 'profile' }, 'Profile')}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body Scroll Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Quick access */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick access</Text>
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.editCountsBtn}
                onPress={() => {
                  setEditSaved(savedCount);
                  setEditActivity(activityCount);
                  setEditProperties(propertiesCount);
                  setEditServices(servicesCount);
                  setShowCountsModal(true);
                }}
                activeOpacity={0.7}
              >
                <SlidersHorizontal size={12} color="#2563EB" strokeWidth={2.4} />
                <Text style={styles.editCountsBtnText}>Edit Counts</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Saved Properties */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'savedProperties' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <Heart size={21} color="#EF4444" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Saved Properties</Text>
              <Text style={styles.menuItemSub}>Wishlist & picks</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{savedCount}</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* My Activity */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'myActivity' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Activity size={21} color="#8B5CF6" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Activity</Text>
              <Text style={styles.menuItemSub}>Visits & enquiries</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{activityCount}</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* My Properties */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'myProperties' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <Home size={21} color="#10B981" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Properties</Text>
              <Text style={styles.menuItemSub}>Listed & owned</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{propertiesCount}</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* My Services */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'rentalAgreement' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FFEDD5' }]}>
              <Briefcase size={21} color="#F97316" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Services</Text>
              <Text style={styles.menuItemSub}>Agreements & loans</Text>
            </View>
            <View style={styles.activeServiceBadge}>
              <Text style={styles.activeServiceText}>{servicesCount} Active</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Section 2: Account & services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & services</Text>

          {/* Personal Information */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'personalInformation' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <User size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Personal Information</Text>
              <Text style={styles.menuItemSub}>Profile, contacts & address</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* Payments & Transactions */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'payments' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <CreditCard size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Payments & Transactions</Text>
              <Text style={styles.menuItemSub}>Invoices, receipts & history</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* My Documents */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'myDocuments' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <FileText size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Documents</Text>
              <Text style={styles.menuItemSub}>KYC vault, deeds & agreements</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'helpSupport' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Headphones size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Help & Support</Text>
              <Text style={styles.menuItemSub}>Concierge desk, FAQ & tickets</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'accountSettings' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Settings size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Account Settings</Text>
              <Text style={styles.menuItemSub}>Preferences & notifications</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* Privacy & Security */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'privacySecurity' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
              <Shield size={21} color="#334155" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
              <Text style={styles.menuItemSub}>2FA, active sessions & data</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* Admin Operations Portal (Accessible for staff/admin) */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'adminPortal' })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <ShieldCheck size={21} color="#B45309" strokeWidth={2.2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuItemTitle, { color: '#92400E' }]}>Admin Operations Portal</Text>
              <Text style={styles.menuItemSub}>Review queues & verification desk</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Logout / Switch Role Option */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            if (isAuthenticated) {
              signOut();
            } else {
              requireAuth(undefined, { name: 'profile' }, 'Profile');
            }
          }}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.logoutText}>
            {isAuthenticated ? 'Sign Out / Switch Profile' : 'Sign In with Email / Mobile'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Seedha Properties · Zero Brokerage Platform</Text>
      </ScrollView>

      {/* Modal: Update Quick Access Counts */}
      <Modal
        visible={showCountsModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowCountsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.countsModalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeaderTitle}>Quick Access Counts</Text>
                <Text style={styles.modalHeaderSub}>Update wishlist, activities, listings & services</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowCountsModal(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Counts Adjuster List */}
            <View style={styles.countsList}>
              {/* Row 1: Saved Properties */}
              <View style={styles.countAdjustRow}>
                <View style={[styles.countIconBubble, { backgroundColor: '#FEE2E2' }]}>
                  <Heart size={18} color="#EF4444" strokeWidth={2.4} />
                </View>
                <View style={styles.countInfoCol}>
                  <Text style={styles.countItemTitle}>Saved Properties</Text>
                  <Text style={styles.countItemSub}>Wishlist & saved picks</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditSaved(prev => Math.max(0, prev - 1))}
                    activeOpacity={0.7}
                  >
                    <Minus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepInput}
                    value={String(editSaved)}
                    keyboardType="number-pad"
                    onChangeText={txt => {
                      const num = parseInt(txt.replace(/\D/g, ''), 10);
                      setEditSaved(isNaN(num) ? 0 : num);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditSaved(prev => prev + 1)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 2: My Activity */}
              <View style={styles.countAdjustRow}>
                <View style={[styles.countIconBubble, { backgroundColor: '#F3E8FF' }]}>
                  <Activity size={18} color="#8B5CF6" strokeWidth={2.4} />
                </View>
                <View style={styles.countInfoCol}>
                  <Text style={styles.countItemTitle}>My Activity</Text>
                  <Text style={styles.countItemSub}>Site visits & enquiries</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditActivity(prev => Math.max(0, prev - 1))}
                    activeOpacity={0.7}
                  >
                    <Minus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepInput}
                    value={String(editActivity)}
                    keyboardType="number-pad"
                    onChangeText={txt => {
                      const num = parseInt(txt.replace(/\D/g, ''), 10);
                      setEditActivity(isNaN(num) ? 0 : num);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditActivity(prev => prev + 1)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3: My Properties */}
              <View style={styles.countAdjustRow}>
                <View style={[styles.countIconBubble, { backgroundColor: '#DCFCE7' }]}>
                  <Home size={18} color="#10B981" strokeWidth={2.4} />
                </View>
                <View style={styles.countInfoCol}>
                  <Text style={styles.countItemTitle}>My Properties</Text>
                  <Text style={styles.countItemSub}>Listed & owned homes</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditProperties(prev => Math.max(0, prev - 1))}
                    activeOpacity={0.7}
                  >
                    <Minus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepInput}
                    value={String(editProperties)}
                    keyboardType="number-pad"
                    onChangeText={txt => {
                      const num = parseInt(txt.replace(/\D/g, ''), 10);
                      setEditProperties(isNaN(num) ? 0 : num);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditProperties(prev => prev + 1)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 4: My Services */}
              <View style={styles.countAdjustRow}>
                <View style={[styles.countIconBubble, { backgroundColor: '#FFEDD5' }]}>
                  <Briefcase size={18} color="#F97316" strokeWidth={2.4} />
                </View>
                <View style={styles.countInfoCol}>
                  <Text style={styles.countItemTitle}>My Services</Text>
                  <Text style={styles.countItemSub}>Agreements & active loans</Text>
                </View>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditServices(prev => Math.max(0, prev - 1))}
                    activeOpacity={0.7}
                  >
                    <Minus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.stepInput}
                    value={String(editServices)}
                    keyboardType="number-pad"
                    onChangeText={txt => {
                      const num = parseInt(txt.replace(/\D/g, ''), 10);
                      setEditServices(isNaN(num) ? 0 : num);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setEditServices(prev => prev + 1)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color="#1E293B" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.resetDefaultBtn}
                onPress={() => {
                  setEditSaved(3);
                  setEditActivity(14);
                  setEditProperties(5);
                  setEditServices(4);
                }}
                activeOpacity={0.7}
              >
                <RotateCcw size={13} color="#64748B" strokeWidth={2.2} />
                <Text style={styles.resetDefaultText}>Reset Defaults</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveCountsBtn}
                onPress={handleSaveCounts}
                disabled={isSavingCounts}
                activeOpacity={0.85}
              >
                {isSavingCounts ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.saveCountsBtnText}>Save Counts</Text>
                  </>
                )}
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
    backgroundColor: '#0B0C0E',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0B0C0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  userPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  brandYellow: {
    color: '#FACC15',
    fontWeight: '800',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  menuItemSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  counterBadge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeServiceBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  activeServiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editCountsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  editCountsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  countsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countsList: {
    gap: 12,
    marginBottom: 20,
  },
  countAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  countInfoCol: {
    flex: 1,
  },
  countItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  countItemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  stepInput: {
    width: 38,
    height: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  resetDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetDefaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  saveCountsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  saveCountsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
