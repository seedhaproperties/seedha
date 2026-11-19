import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  Smartphone,
  Laptop,
  LogOut,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function PrivacySecurityScreen() {
  const { pop, setTab, signOut } = useApp();

  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessions, setSessions] = useState([
    {
      id: 's-1',
      device: 'This device · Chrome on Android',
      location: 'Hyderabad, IN · Active now',
      isCurrent: true,
    },
    {
      id: 's-2',
      device: 'MacBook Air · Safari',
      location: 'Hyderabad, IN · 2 days ago',
      isCurrent: false,
    },
  ]);

  const handleTerminateSession = (id: string, device: string) => {
    Alert.alert('Terminate Session', `Log out of ${device}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          setSessions((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all associated listings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            signOut();
            setTab('home');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
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
            <Text style={styles.pageTitle}>Privacy & Security</Text>
            <Text style={styles.subtitle}>2FA, active sessions & data</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={16} color="#1E293B" strokeWidth={2.2} />
            <Text style={styles.sectionHeading}>Security</Text>
          </View>

          {/* Login alerts */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Login alerts</Text>
              <Text style={styles.prefSub}>Notify me about new sign-ins</Text>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Change password */}
          <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
            <View style={styles.lockRow}>
              <Lock size={15} color="#64748B" strokeWidth={2.2} />
              <Text style={styles.prefTitle}>Change password</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Change Password', 'Password reset link sent to your registered email.')}
              activeOpacity={0.8}
            >
              <Text style={styles.updateLink}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active sessions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Active sessions</Text>

          <View style={styles.sessionsList}>
            {sessions.map((s) => (
              <View key={s.id} style={styles.sessionItem}>
                <View style={styles.deviceIconBox}>
                  {s.isCurrent ? (
                    <Smartphone size={17} color="#64748B" strokeWidth={2} />
                  ) : (
                    <Laptop size={17} color="#64748B" strokeWidth={2} />
                  )}
                </View>

                <View style={styles.sessionTextCol}>
                  <Text style={styles.sessionDevice}>{s.device}</Text>
                  <Text style={styles.sessionLoc}>{s.location}</Text>
                </View>

                {!s.isCurrent && (
                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => handleTerminateSession(s.id, s.device)}
                    activeOpacity={0.8}
                  >
                    <LogOut size={15} color="#EF4444" strokeWidth={2.2} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Legal & about */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <FileText size={16} color="#1E293B" strokeWidth={2.2} />
            <Text style={styles.sectionHeading}>Legal & about</Text>
          </View>

          <TouchableOpacity style={styles.legalItem} activeOpacity={0.75}>
            <Text style={styles.legalText}>Terms & Conditions</Text>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} activeOpacity={0.75}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} activeOpacity={0.75}>
            <Text style={styles.legalText}>Refund & Cancellation Policy</Text>
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          <View style={[styles.legalItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.legalText}>App version</Text>
            <Text style={styles.versionText}>v3.4.2</Text>
          </View>
        </View>

        {/* Your data - Delete account */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Your data</Text>
          <TouchableOpacity
            style={styles.deleteBox}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
          >
            <Trash2 size={15} color="#EF4444" strokeWidth={2.2} />
            <Text style={styles.deleteText}>Delete my account</Text>
          </TouchableOpacity>
        </View>
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
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  prefTextCol: {
    flex: 1,
    marginRight: 12,
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  prefSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionsList: {
    marginTop: 10,
    gap: 10,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  deviceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  sessionDevice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sessionLoc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  legalText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  deleteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 12,
    marginBottom: 6,
    gap: 8,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
