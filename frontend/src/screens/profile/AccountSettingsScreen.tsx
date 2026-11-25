import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Bell,
  MapPin,
  MessageCircle,
  Check,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function AccountSettingsScreen() {
  const { pop, setTab, user, updateUserProfile } = useApp();

  const [whatsappUpdates, setWhatsappUpdates] = useState(user?.settings?.whatsappUpdates ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.settings?.pushNotifications ?? true);
  const [emailUpdates, setEmailUpdates] = useState(user?.settings?.emailUpdates ?? true);
  const [smsAlerts, setSmsAlerts] = useState(user?.settings?.smsAlerts ?? false);
  const [offersPromotions, setOffersPromotions] = useState(user?.settings?.offersPromotions ?? true);
  const [visitReminders, setVisitReminders] = useState(user?.settings?.visitReminders ?? true);
  const [useLocation, setUseLocation] = useState(user?.settings?.useLocation ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.settings) {
      if (user.settings.whatsappUpdates !== undefined) setWhatsappUpdates(user.settings.whatsappUpdates);
      if (user.settings.pushNotifications !== undefined) setPushNotifications(user.settings.pushNotifications);
      if (user.settings.emailUpdates !== undefined) setEmailUpdates(user.settings.emailUpdates);
      if (user.settings.smsAlerts !== undefined) setSmsAlerts(user.settings.smsAlerts);
      if (user.settings.offersPromotions !== undefined) setOffersPromotions(user.settings.offersPromotions);
      if (user.settings.visitReminders !== undefined) setVisitReminders(user.settings.visitReminders);
      if (user.settings.useLocation !== undefined) setUseLocation(user.settings.useLocation);
    }
  }, [user?.settings]);

  const handleToggle = async (key: string, value: boolean) => {
    // 1. Optimistic UI update
    if (key === 'whatsappUpdates') setWhatsappUpdates(value);
    else if (key === 'pushNotifications') setPushNotifications(value);
    else if (key === 'emailUpdates') setEmailUpdates(value);
    else if (key === 'smsAlerts') setSmsAlerts(value);
    else if (key === 'offersPromotions') setOffersPromotions(value);
    else if (key === 'visitReminders') setVisitReminders(value);
    else if (key === 'useLocation') setUseLocation(value);

    const updatedSettings = {
      whatsappUpdates: key === 'whatsappUpdates' ? value : whatsappUpdates,
      pushNotifications: key === 'pushNotifications' ? value : pushNotifications,
      emailUpdates: key === 'emailUpdates' ? value : emailUpdates,
      smsAlerts: key === 'smsAlerts' ? value : smsAlerts,
      offersPromotions: key === 'offersPromotions' ? value : offersPromotions,
      visitReminders: key === 'visitReminders' ? value : visitReminders,
      useLocation: key === 'useLocation' ? value : useLocation,
    };

    if (updateUserProfile) {
      updateUserProfile({ settings: updatedSettings });
    }

    try {
      await api.auth.updateProfile({ settings: updatedSettings });
      setSaveStatusMsg('Preferences saved permanently to database');
      setTimeout(() => setSaveStatusMsg(null), 3500);
    } catch (err: any) {
      console.warn('Backend update notice:', err);
      setSaveStatusMsg('Settings updated');
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const settingsPayload = {
        whatsappUpdates,
        pushNotifications,
        emailUpdates,
        smsAlerts,
        offersPromotions,
        visitReminders,
        useLocation,
      };

      await api.auth.updateProfile({ settings: settingsPayload });
      if (updateUserProfile) {
        updateUserProfile({ settings: settingsPayload });
      }
      setSaveStatusMsg('All preferences saved to database');
      setTimeout(() => setSaveStatusMsg(null), 4000);
      Alert.alert('Settings Saved', 'Your account settings have been saved to the database.');
    } catch (err: any) {
      console.error('Failed saving account settings:', err);
      Alert.alert('Saved Locally', 'Settings updated locally in your session.');
    } finally {
      setIsSaving(false);
    }
  };

  const phone = user?.phone || '779909855';
  const city = user?.city || 'Hyderabad';

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
            <Text style={styles.pageTitle}>Account Settings</Text>
            <Text style={styles.subtitle}>Preferences & notifications</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.8 }]}
            onPress={handleSaveAll}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Real-time Save Status Banner */}
        {saveStatusMsg && (
          <View style={styles.saveStatusBanner}>
            <Check size={13} color="#166534" strokeWidth={2.4} />
            <Text style={styles.saveStatusText}>{saveStatusMsg}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* WhatsApp Instant Updates Card */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappTopRow}>
            <View style={styles.whatsappIconBox}>
              <MessageCircle size={18} color="#16A34A" strokeWidth={2.2} />
            </View>
            <Text style={styles.whatsappTitle}>WhatsApp Instant Updates</Text>
            <Switch
              value={whatsappUpdates}
              onValueChange={(val) => handleToggle('whatsappUpdates', val)}
              trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.whatsappSub}>
            Get visit reminders, payment receipts and enquiry replies on WhatsApp.
          </Text>
          <Text style={styles.whatsappFooter}>Updates will be sent to {phone}</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Notifications</Text>

          {/* Push notifications */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Push notifications</Text>
              <Text style={styles.prefSub}>Alerts on this device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(val) => handleToggle('pushNotifications', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Email updates */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Email updates</Text>
              <Text style={styles.prefSub}>Receipts and summaries</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={(val) => handleToggle('emailUpdates', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* SMS alerts */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>SMS alerts</Text>
              <Text style={styles.prefSub}>Important account messages</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={(val) => handleToggle('smsAlerts', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Offers & promotions */}
          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Offers & promotions</Text>
              <Text style={styles.prefSub}>Deals on services</Text>
            </View>
            <Switch
              value={offersPromotions}
              onValueChange={(val) => handleToggle('offersPromotions', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Visit reminders */}
          <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Visit reminders</Text>
              <Text style={styles.prefSub}>Before every scheduled visit</Text>
            </View>
            <Switch
              value={visitReminders}
              onValueChange={(val) => handleToggle('visitReminders', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>App</Text>

          <View style={styles.prefRow}>
            <View style={styles.prefTextCol}>
              <Text style={styles.prefTitle}>Use my location</Text>
              <Text style={styles.prefSub}>Show nearby properties</Text>
            </View>
            <Switch
              value={useLocation}
              onValueChange={(val) => handleToggle('useLocation', val)}
              trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.locationFooterRow}>
            <MapPin size={13} color="#64748B" strokeWidth={2} />
            <Text style={styles.locationFooterText}>Default City: {city}</Text>
          </View>
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
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  saveStatusBanner: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  saveStatusText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
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
  whatsappCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  whatsappTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whatsappIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  whatsappTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  whatsappSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 8,
  },
  whatsappFooter: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
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
  locationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  locationFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
