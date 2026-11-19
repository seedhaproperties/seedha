import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
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
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { push, pop, user, isAdmin, signOut, isAuthenticated, requireAuth, setTab } = useApp();

  const displayName = user?.name || 'Aarav Varma';
  const displayPhone = user?.phone || '+91 98765 43210';
  const roleLabel = user?.role || 'OWNER';

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
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces&auto=format',
              }}
              style={styles.avatarImage}
            />
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </View>

          {/* User Details */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            </View>

            <Text style={styles.userPhone}>{displayPhone}</Text>

            <Text style={styles.userEmail}>
              aarav.varma@
              <Text style={styles.brandYellow}>seedha</Text>
              .com
            </Text>
          </View>

          {/* Edit Pencil Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => push({ name: 'personalInformation' })}
            activeOpacity={0.8}
          >
            <Pencil size={15} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>Quick access</Text>

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
              <Text style={styles.counterText}>3</Text>
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
              <Text style={styles.counterText}>14</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          {/* My Properties */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => push({ name: 'myProperty' })}
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
              <Text style={styles.counterText}>5</Text>
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
              <Text style={styles.activeServiceText}>4 Active</Text>
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
          onPress={() => signOut()}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.logoutText}>
            {isAuthenticated ? 'Sign Out / Switch Profile' : 'Sign In with Mobile OTP'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Seedha Properties · Zero Brokerage Platform</Text>
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
});
