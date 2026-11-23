import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  X,
  Check,
  Trash2,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DECADES = [2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const getAgeFromDob = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const mDiff = today.getMonth() - m;
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) {
    age--;
  }
  return age >= 0 ? age : null;
};

const formatFriendlyDate = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const dateObj = new Date(y, m, d);
  if (isNaN(dateObj.getTime())) return dateStr;
  return `${d} ${MONTHS[m]?.slice(0, 3)} ${y}`;
};

const formatFullDisplayDate = (year: number, month: number, day: number) => {
  const dateObj = new Date(year, month, day);
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()] || 'Day';
  return `${dayName}, ${day} ${MONTHS[month] || ''} ${year}`;
};

export default function PersonalInformationScreen() {
  const { pop, setTab, user, updateUserProfile, refreshUserProfile } = useApp();
  const insets = useSafeAreaInsets();

  // Basic Details State
  const [fullName, setFullName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [userRole, setUserRole] = useState<'Owner' | 'Tenant' | 'Buyer' | 'Broker'>((user?.userRole as any) || 'Owner');

  // Contact Details State
  const [primaryPhone, setPrimaryPhone] = useState(user?.phone || '');
  const [primaryEmail, setPrimaryEmail] = useState(user?.email || '');
  const [alternatePhone, setAlternatePhone] = useState<string | null>(user?.alternatePhone || null);
  const [alternateEmail, setAlternateEmail] = useState<string | null>(user?.alternateEmail || null);

  // Address State
  const [streetAddress, setStreetAddress] = useState(user?.streetAddress || '');
  const [city, setCity] = useState(user?.city || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [stateName, setStateName] = useState(user?.state || '');

  // Avatar & Async Loading States
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Sync state whenever context user updates or is fetched
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.dob) setDob(user.dob);
      if (user.gender) setGender(user.gender);
      if (user.userRole) setUserRole(user.userRole as any);
      if (user.phone) setPrimaryPhone(user.phone);
      if (user.email) setPrimaryEmail(user.email);
      if (user.alternatePhone !== undefined) setAlternatePhone(user.alternatePhone || null);
      if (user.alternateEmail !== undefined) setAlternateEmail(user.alternateEmail || null);
      if (user.streetAddress) setStreetAddress(user.streetAddress || '');
      if (user.city) setCity(user.city || '');
      if (user.pincode) setPincode(user.pincode || '');
      if (user.state) setStateName(user.state || '');
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  // Modal 1: Add Alternate Mobile Number State
  const [showAddAlternateModal, setShowAddAlternateModal] = useState(false);
  const [altPhoneStep, setAltPhoneStep] = useState<1 | 2 | 3>(1); // 1: Enter phone, 2: OTP, 3: Success
  const [altPhoneInput, setAltPhoneInput] = useState('');
  const [altOtpDigits, setAltOtpDigits] = useState(['', '', '', '', '', '']);

  // Modal 2: Change Mobile Number State
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [changePhoneStep, setChangePhoneStep] = useState<1 | 2 | 3 | 4>(1); // 1: Verify current, 2: New phone, 3: OTP new, 4: Success
  const [changePhoneCurrentOtp, setChangePhoneCurrentOtp] = useState(['', '', '', '', '', '']);
  const [changePhoneNewInput, setChangePhoneNewInput] = useState('');
  const [changePhoneNewOtp, setChangePhoneNewOtp] = useState(['', '', '', '', '', '']);

  // Advanced Calendar Date Picker State
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calViewMode, setCalViewMode] = useState<'days' | 'months' | 'years' | 'presets'>('days');
  const [calYear, setCalYear] = useState(1995);
  const [calMonth, setCalMonth] = useState(4); // May (0-indexed)
  const [calDay, setCalDay] = useState(15);
  const [selectedDecade, setSelectedDecade] = useState(1990);

  useEffect(() => {
    if (dob && dob.includes('-')) {
      const parts = dob.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y)) {
        setCalYear(y);
        setSelectedDecade(Math.floor(y / 10) * 10);
      }
      if (!isNaN(m) && m >= 0 && m < 12) setCalMonth(m);
      if (!isNaN(d) && d >= 1 && d <= 31) setCalDay(d);
    }
  }, [dob]);

  // Handle Edit/Save Header Button
  const [isEditing, setIsEditing] = useState(false);

  const handleDoneAddAlternate = async () => {
    const formatted = `+91 ${altPhoneInput.trim()}`;
    setAlternatePhone(formatted);
    setShowAddAlternateModal(false);
    setAltPhoneStep(1);
    try {
      await api.auth.updateProfile({ alternatePhone: formatted });
      if (updateUserProfile) {
        updateUserProfile({ alternatePhone: formatted });
      }
    } catch (e) {
      console.warn('Failed updating alternate phone in database:', e);
    }
  };

  const handleDoneChangePhone = async () => {
    const formatted = `+91 ${changePhoneNewInput.trim()}`;
    setPrimaryPhone(formatted);
    setShowChangePhoneModal(false);
    setChangePhoneStep(1);
    try {
      await api.auth.updateProfile({ phone: formatted });
      if (updateUserProfile) {
        updateUserProfile({ phone: formatted });
      }
    } catch (e) {
      console.warn('Failed updating primary phone in database:', e);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveErrorMsg(null);

      const payload = {
        name: fullName.trim(),
        phone: primaryPhone.trim(),
        email: primaryEmail.trim(),
        dob: dob.trim(),
        gender: gender.trim(),
        userRole,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        state: stateName.trim(),
        alternatePhone: alternatePhone ? alternatePhone.trim() : null,
        alternateEmail: alternateEmail ? alternateEmail.trim() : null,
        avatarUrl,
      };

      const res = await api.auth.updateProfile(payload);
      if (res?.user && updateUserProfile) {
        updateUserProfile(res.user);
      } else if (updateUserProfile) {
        updateUserProfile(payload);
      }

      setSaveSuccessMsg('Profile updated and saved permanently to database.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
      Alert.alert('Profile Saved', 'Your personal information has been updated and saved successfully.');
    } catch (err: any) {
      console.error('[PersonalInformationScreen] Save failed:', err);
      setSaveErrorMsg(err.message || 'Failed to save changes. Please check connection.');
      Alert.alert('Save Failed', err.message || 'Could not update profile. Please verify your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickPhoto = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        try {
          setIsUploadingPhoto(true);
          const reader = new FileReader();
          reader.onload = async (uploadEvt) => {
            const dataUrl = uploadEvt.target?.result as string;
            if (dataUrl) {
              setAvatarUrl(dataUrl);
              try {
                const res = await api.auth.uploadAvatar({ imageBase64: dataUrl });
                const newUrl = res?.avatarUrl || dataUrl;
                setAvatarUrl(newUrl);
                if (updateUserProfile) {
                  updateUserProfile({ avatarUrl: newUrl });
                }
                Alert.alert('Photo Updated', 'Your profile photo has been updated.');
              } catch (upErr: any) {
                // If base64 payload is large or local simulation, still persist in state and context
                if (updateUserProfile) {
                  updateUserProfile({ avatarUrl: dataUrl });
                }
                Alert.alert('Photo Updated', 'Profile photo updated locally and saved.');
              }
            }
            setIsUploadingPhoto(false);
          };
          reader.readAsDataURL(file);
        } catch (uploadErr: any) {
          setIsUploadingPhoto(false);
          Alert.alert('Upload Error', uploadErr.message || 'Failed to upload photo.');
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Photo', 'Profile photo upload is active.');
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      await api.auth.deleteAvatar();
      setAvatarUrl(null);
      if (updateUserProfile) {
        updateUserProfile({ avatarUrl: undefined });
      }
      setSaveSuccessMsg('Profile photo deleted.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      Alert.alert('Photo Removed', 'Your profile photo has been removed.');
    } catch (err: any) {
      console.error('[PersonalInformationScreen] Delete avatar failed:', err);
      Alert.alert('Error', err.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
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
            <Text style={styles.pageTitle}>Personal Information</Text>
            <Text style={styles.subtitle}>Profile, contacts & address</Text>
          </View>

          <TouchableOpacity
            style={[styles.editBtn, isSaving && { opacity: 0.8 }]}
            onPress={handleSaveProfile}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.editBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Status Banners */}
        {saveSuccessMsg ? (
          <View style={{ backgroundColor: '#DCFCE7', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#86EFAC' }}>
            <Text style={{ color: '#166534', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              ✓ {saveSuccessMsg}
            </Text>
          </View>
        ) : null}

        {saveErrorMsg ? (
          <View style={{ backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#FCA5A5' }}>
            <Text style={{ color: '#991B1B', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              ✕ {saveErrorMsg}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image
                source={{
                  uri: avatarUrl,
                }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={[styles.avatarImg, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700' }}>
                  {(fullName && fullName.trim().charAt(0).toUpperCase()) || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickPhoto} activeOpacity={0.85}>
              {isUploadingPhoto ? (
                <ActivityIndicator size={12} color="#FFFFFF" />
              ) : (
                <Camera size={14} color="#FFFFFF" strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Photo Action Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 }}>
            <TouchableOpacity
              onPress={handlePickPhoto}
              style={{ paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
            {avatarUrl ? (
              <TouchableOpacity
                onPress={handleDeletePhoto}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
                activeOpacity={0.7}
              >
                <Trash2 size={12} color="#EF4444" strokeWidth={2} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.profileName}>{fullName || 'Seedha User'}</Text>

          <View style={styles.verifiedRow}>
            <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
            <Text style={styles.verifiedText}>Verified {userRole || 'User'}</Text>
          </View>
        </View>

        {/* Section 1: Basic details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Basic details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              style={styles.inputBox}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <View style={styles.dobLabelRow}>
                <Text style={styles.fieldLabel}>Date of birth</Text>
                {getAgeFromDob(dob) !== null && (
                  <View style={styles.inlineAgeBadge}>
                    <Text style={styles.inlineAgeBadgeText}>{getAgeFromDob(dob)} yrs</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.modernDobTrigger}
                onPress={() => {
                  if (dob && dob.includes('-')) {
                    const parts = dob.split('-');
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10) - 1;
                    const d = parseInt(parts[2], 10);
                    if (!isNaN(y)) {
                      setCalYear(y);
                      setSelectedDecade(Math.floor(y / 10) * 10);
                    }
                    if (!isNaN(m) && m >= 0 && m < 12) setCalMonth(m);
                    if (!isNaN(d) && d >= 1 && d <= 31) setCalDay(d);
                  }
                  setCalViewMode('days');
                  setShowDatePickerModal(true);
                }}
                activeOpacity={0.8}
              >
                <Calendar size={17} color="#2563EB" strokeWidth={2.2} />
                <Text
                  style={[
                    styles.modernDobValueText,
                    !dob && styles.modernDobPlaceholderText,
                  ]}
                  numberOfLines={1}
                >
                  {dob ? (formatFriendlyDate(dob) || dob) : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <View style={styles.dobLabelRow}>
                <Text style={styles.fieldLabel}>Gender</Text>
              </View>
              <View style={styles.genderChipsRow}>
                {(['Male', 'Female', 'Other'] as const).map((g) => {
                  const isSelected = gender?.toLowerCase() === g.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderChip, isSelected && styles.genderChipActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.genderChipText, isSelected && styles.genderChipTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>I am a</Text>
            <View style={styles.roleChipsRow}>
              {(['Owner', 'Tenant', 'Buyer', 'Broker'] as const).map((r) => {
                const isActive = userRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, isActive && styles.roleChipActive]}
                    onPress={() => setUserRole(r)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roleChipText, isActive && styles.roleChipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 2: Contact details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Contact details</Text>
          <Text style={styles.sectionDesc}>Edit your primary and alternate contact details.</Text>

          {/* Primary Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mobile number</Text>
            <TextInput
              style={styles.inputBox}
              value={primaryPhone}
              onChangeText={setPrimaryPhone}
              placeholder="+91 98490 63269"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          {/* Primary Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={styles.inputBox}
              value={primaryEmail}
              onChangeText={setPrimaryEmail}
              placeholder="user@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Alternate Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Alternate mobile (Optional)</Text>
            <TextInput
              style={styles.inputBox}
              value={alternatePhone || ''}
              onChangeText={setAlternatePhone}
              placeholder="e.g. +91 95678 89900"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          {/* Alternate Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Alternate email (Optional)</Text>
            <TextInput
              style={styles.inputBox}
              value={alternateEmail || ''}
              onChangeText={setAlternateEmail}
              placeholder="e.g. alternate@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Section 3: Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Address</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Street address</Text>
            <TextInput
              style={styles.inputBox}
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Plot / Flat / Street address"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.inputBox}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Hyderabad"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>PIN code</Text>
              <TextInput
                style={styles.inputBox}
                value={pincode}
                onChangeText={setPincode}
                placeholder="e.g. 500033"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>State</Text>
            <TextInput
              style={styles.inputBox}
              value={stateName}
              onChangeText={setStateName}
              placeholder="e.g. Telangana"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Bottom Save Action Button */}
        <TouchableOpacity
          style={[styles.bottomSaveBtn, isSaving && { opacity: 0.8 }]}
          onPress={handleSaveProfile}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Check size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.bottomSaveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL 1: Add Alternate Mobile Number (Image 3)            */}
      {/* ========================================================= */}
      <Modal
        visible={showAddAlternateModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setShowAddAlternateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add alternate mobile number</Text>
              <TouchableOpacity
                onPress={() => setShowAddAlternateModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Stepper Header (Only for Steps 1 & 2) */}
            {altPhoneStep !== 3 && (
              <View style={styles.stepperContainer}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, altPhoneStep >= 1 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNum, altPhoneStep >= 1 && styles.stepNumActive]}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, altPhoneStep >= 1 && styles.stepLabelActive]}>
                    New phone
                  </Text>
                </View>

                <View style={[styles.stepLine, altPhoneStep >= 2 && styles.stepLineActive]} />

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, altPhoneStep >= 2 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNum, altPhoneStep >= 2 && styles.stepNumActive]}>2</Text>
                  </View>
                  <Text style={[styles.stepLabel, altPhoneStep >= 2 && styles.stepLabelActive]}>
                    Confirm
                  </Text>
                </View>
              </View>
            )}

            {/* STEP 1: Enter New Mobile Number */}
            {altPhoneStep === 1 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalInputLabel}>New mobile number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={altPhoneInput}
                  onChangeText={setAltPhoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setAltPhoneStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Send verification code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Confirm OTP */}
            {altPhoneStep === 2 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubMessage}>
                  We sent a 6-digit code to +91 95•••••900.
                </Text>

                {/* 6 OTP Boxes */}
                <View style={styles.otpBoxesRow}>
                  {altOtpDigits.map((digit, idx) => (
                    <View key={idx} style={styles.otpBox}>
                      <Text style={styles.otpBoxText}>{digit}</Text>
                    </View>
                  ))}
                </View>

                {/* Simulated text display */}
                <View style={styles.otpDisplayBox}>
                  <Text style={styles.otpDisplayText}>567780</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setAltPhoneStep(3)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Verify</Text>
                </TouchableOpacity>

                <View style={styles.otpFooterRow}>
                  <TouchableOpacity onPress={() => setAltPhoneStep(1)}>
                    <Text style={styles.wrongNumberText}>Wrong number?</Text>
                  </TouchableOpacity>
                  <Text style={styles.resendTimerText}>Resend in 22s</Text>
                </View>
              </View>
            )}

            {/* STEP 3: Success "Added and verified" */}
            {altPhoneStep === 3 && (
              <View style={styles.successBody}>
                <View style={styles.successIconWrapper}>
                  <CheckCircle2 size={42} color="#10B981" strokeWidth={2.2} />
                </View>

                <Text style={styles.successTitle}>Added and verified</Text>
                <Text style={styles.successSubtitle}>
                  +91 {altPhoneInput.slice(0, 2)}•••••{altPhoneInput.slice(-3)} is now on your account.
                </Text>

                <TouchableOpacity
                  style={styles.successDoneBtn}
                  onPress={handleDoneAddAlternate}
                  activeOpacity={0.85}
                >
                  <Text style={styles.successDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: Change Mobile Number (Image 4)                   */}
      {/* ========================================================= */}
      <Modal
        visible={showChangePhoneModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setShowChangePhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change mobile number</Text>
              <TouchableOpacity
                onPress={() => setShowChangePhoneModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Stepper Header (3 steps) */}
            {changePhoneStep !== 4 && (
              <View style={styles.stepperContainer}>
                {/* Step 1 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, changePhoneStep >= 1 && styles.stepCircleActive]}>
                    {changePhoneStep > 1 ? (
                      <Check size={12} color="#FFFFFF" strokeWidth={2.8} />
                    ) : (
                      <Text style={[styles.stepNum, styles.stepNumActive]}>1</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, changePhoneStep >= 1 && styles.stepLabelActive]}>
                    Verify current
                  </Text>
                </View>

                <View style={[styles.stepLine, changePhoneStep >= 2 && styles.stepLineActive]} />

                {/* Step 2 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, changePhoneStep >= 2 && styles.stepCircleActive]}>
                    {changePhoneStep > 2 ? (
                      <Check size={12} color="#FFFFFF" strokeWidth={2.8} />
                    ) : (
                      <Text style={[styles.stepNum, changePhoneStep >= 2 && styles.stepNumActive]}>2</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, changePhoneStep >= 2 && styles.stepLabelActive]}>
                    New phone
                  </Text>
                </View>

                <View style={[styles.stepLine, changePhoneStep >= 3 && styles.stepLineActive]} />

                {/* Step 3 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, changePhoneStep >= 3 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNum, changePhoneStep >= 3 && styles.stepNumActive]}>3</Text>
                  </View>
                  <Text style={[styles.stepLabel, changePhoneStep >= 3 && styles.stepLabelActive]}>
                    Confirm
                  </Text>
                </View>
              </View>
            )}

            {/* STEP 1: Verify Current Mobile */}
            {changePhoneStep === 1 && (
              <View style={styles.modalBody}>
                {/* Security notice box */}
                <View style={styles.securityBox}>
                  <Shield size={16} color="#64748B" strokeWidth={2} />
                  <Text style={styles.securityText}>
                    For your security, first confirm it is you. We will send a code to your current mobile number.
                  </Text>
                </View>

                <Text style={styles.modalSubMessage}>
                  We sent a 6-digit code to +91 98•••••210
                </Text>

                {/* 6 OTP Boxes */}
                <View style={styles.otpBoxesRow}>
                  {changePhoneCurrentOtp.map((digit, idx) => (
                    <View key={idx} style={styles.otpBox}>
                      <Text style={styles.otpBoxText}>{digit}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.otpDisplayBox}>
                  <Text style={styles.otpDisplayText}>987654</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setChangePhoneStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Verify</Text>
                </TouchableOpacity>

                <View style={styles.otpFooterRow}>
                  <Text style={styles.wrongNumberText}>Wrong number?</Text>
                  <Text style={styles.resendTimerText}>Resend in 26s</Text>
                </View>
              </View>
            )}

            {/* STEP 2: Enter New Phone */}
            {changePhoneStep === 2 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalInputLabel}>New mobile number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={changePhoneNewInput}
                  onChangeText={setChangePhoneNewInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setChangePhoneStep(3)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Send verification code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: Confirm OTP for New Phone */}
            {changePhoneStep === 3 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubMessage}>
                  We sent a 6-digit code to +91 91•••••352
                </Text>

                {/* 6 OTP Boxes */}
                <View style={styles.otpBoxesRow}>
                  {changePhoneNewOtp.map((digit, idx) => (
                    <View key={idx} style={styles.otpBox}>
                      <Text style={styles.otpBoxText}>{digit}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.otpDisplayBox}>
                  <Text style={styles.otpDisplayText}>678900</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setChangePhoneStep(4)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Verify</Text>
                </TouchableOpacity>

                <View style={styles.otpFooterRow}>
                  <TouchableOpacity onPress={() => setChangePhoneStep(2)}>
                    <Text style={styles.wrongNumberText}>Wrong number?</Text>
                  </TouchableOpacity>
                  <Text style={styles.resendTimerText}>Resend in 22s</Text>
                </View>
              </View>
            )}

            {/* STEP 4: Success "Updated and verified" */}
            {changePhoneStep === 4 && (
              <View style={styles.successBody}>
                <View style={styles.successIconWrapper}>
                  <CheckCircle2 size={42} color="#10B981" strokeWidth={2.2} />
                </View>

                <Text style={styles.successTitle}>Updated and verified</Text>
                <Text style={styles.successSubtitle}>
                  +91 {changePhoneNewInput.slice(0, 2)}•••••{changePhoneNewInput.slice(-3)} is now on your account.
                </Text>

                <TouchableOpacity
                  style={styles.successDoneBtn}
                  onPress={handleDoneChangePhone}
                  activeOpacity={0.85}
                >
                  <Text style={styles.successDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ADVANCED MODERN CALENDAR DATE PICKER MODAL                */}
      {/* ========================================================= */}
      <Modal
        visible={showDatePickerModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.modernCalContainer}>
            {/* Dark Top Preview Card */}
            <View style={styles.modernCalHeaderBanner}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} color="#94A3B8" strokeWidth={2.4} />
                  <Text style={styles.modernCalHeaderSub}>DATE OF BIRTH</Text>
                </View>
                {getAgeFromDob(`${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(calDay).padStart(2, '0')}`) !== null && (
                  <View style={styles.calHeaderAgeBadge}>
                    <Sparkles size={11} color="#60A5FA" strokeWidth={2.2} />
                    <Text style={styles.calHeaderAgeText}>
                      {getAgeFromDob(`${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(calDay).padStart(2, '0')}`)} Years Old
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.modernCalHeaderDate}>
                {formatFullDisplayDate(calYear, calMonth, calDay)}
              </Text>

              {/* Segmented Mode Selector Tabs */}
              <View style={styles.calSegmentedRow}>
                <TouchableOpacity
                  style={[styles.calSegmentTab, calViewMode === 'days' && styles.calSegmentTabActive]}
                  onPress={() => setCalViewMode('days')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSegmentText, calViewMode === 'days' && styles.calSegmentTextActive]}>
                    Calendar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calSegmentTab, calViewMode === 'months' && styles.calSegmentTabActive]}
                  onPress={() => setCalViewMode('months')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSegmentText, calViewMode === 'months' && styles.calSegmentTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calSegmentTab, calViewMode === 'years' && styles.calSegmentTabActive]}
                  onPress={() => setCalViewMode('years')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSegmentText, calViewMode === 'years' && styles.calSegmentTextActive]}>
                    Year
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calSegmentTab, calViewMode === 'presets' && styles.calSegmentTabActive]}
                  onPress={() => setCalViewMode('presets')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.calSegmentText, calViewMode === 'presets' && styles.calSegmentTextActive]}>
                    Quick Age
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Content depending on Tab */}
            <View style={styles.modernCalBody}>
              {/* TAB 1: DAYS (Calendar View with Month & Year fast controls) */}
              {calViewMode === 'days' && (
                <View>
                  {/* Month & Year Bar */}
                  <View style={styles.modernMonthNavRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear(prev => prev - 1);
                        } else {
                          setCalMonth(prev => prev - 1);
                        }
                      }}
                      style={styles.modernNavArrow}
                      activeOpacity={0.7}
                    >
                      <ChevronLeft size={18} color="#1E293B" strokeWidth={2.4} />
                    </TouchableOpacity>

                    <View style={styles.monthYearCenterBlock}>
                      <TouchableOpacity
                        onPress={() => setCalViewMode('months')}
                        style={styles.jumpPillBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modernMonthTitleText}>{MONTHS[calMonth]}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setCalViewMode('years')}
                        style={[styles.jumpPillBtn, styles.jumpPillYearBtn]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modernYearBadgeText}>{calYear} ▾</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear(prev => prev + 1);
                        } else {
                          setCalMonth(prev => prev + 1);
                        }
                      }}
                      style={styles.modernNavArrow}
                      activeOpacity={0.7}
                    >
                      <ChevronRight size={18} color="#1E293B" strokeWidth={2.4} />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday headers */}
                  <View style={styles.modernWeekdayRow}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, idx) => (
                      <Text key={idx} style={styles.modernWeekdayText}>{d}</Text>
                    ))}
                  </View>

                  {/* Days grid */}
                  <View style={styles.modernDaysGrid}>
                    {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, idx) => (
                      <View key={`empty-${idx}`} style={styles.modernDayCellEmpty} />
                    ))}

                    {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isSelected = calDay === dayNum;
                      const today = new Date();
                      const isToday =
                        today.getFullYear() === calYear &&
                        today.getMonth() === calMonth &&
                        today.getDate() === dayNum;

                      return (
                        <TouchableOpacity
                          key={`day-${dayNum}`}
                          style={[
                            styles.modernDayCell,
                            isSelected && styles.modernDayCellSelected,
                            isToday && !isSelected && styles.modernDayCellToday,
                          ]}
                          onPress={() => setCalDay(dayNum)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.modernDayCellText,
                              isSelected && styles.modernDayCellTextSelected,
                              isToday && !isSelected && styles.modernDayCellTextToday,
                            ]}
                          >
                            {dayNum}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 2: MONTHS (12 tiles grid) */}
              {calViewMode === 'months' && (
                <View style={styles.tabContentBlock}>
                  <Text style={styles.tabInstruction}>Tap to select month for {calYear}:</Text>
                  <View style={styles.monthsGrid}>
                    {MONTHS.map((m, idx) => {
                      const isSelected = calMonth === idx;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[styles.monthCard, isSelected && styles.monthCardSelected]}
                          onPress={() => {
                            setCalMonth(idx);
                            setCalViewMode('days');
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.monthCardText, isSelected && styles.monthCardTextSelected]}>
                            {m.slice(0, 3)}
                          </Text>
                          <Text style={[styles.monthCardSub, isSelected && styles.monthCardSubSelected]}>
                            {m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 3: YEARS (Fast Decades + 10 Years Grid) */}
              {calViewMode === 'years' && (
                <View style={styles.tabContentBlock}>
                  <Text style={styles.tabInstruction}>Choose decade, then pick birth year:</Text>
                  {/* Decade selector */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.decadeScroll}>
                    {DECADES.map(dec => (
                      <TouchableOpacity
                        key={dec}
                        style={[styles.decadeChip, selectedDecade === dec && styles.decadeChipActive]}
                        onPress={() => setSelectedDecade(dec)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.decadeChipText, selectedDecade === dec && styles.decadeChipTextActive]}>
                          {dec}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Year grid for selected decade */}
                  <View style={styles.decadeYearsGrid}>
                    {Array.from({ length: 10 }, (_, i) => selectedDecade + i).map(yr => {
                      const isSelected = calYear === yr;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={[styles.decadeYearBtn, isSelected && styles.decadeYearBtnSelected]}
                          onPress={() => {
                            setCalYear(yr);
                            setCalViewMode('days');
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.decadeYearText, isSelected && styles.decadeYearTextSelected]}>
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 4: QUICK AGE PRESETS */}
              {calViewMode === 'presets' && (
                <View style={styles.tabContentBlock}>
                  <Text style={styles.tabInstruction}>Select your current age to calculate birth year:</Text>
                  <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.presetsGrid}>
                      {[18, 20, 22, 24, 25, 27, 30, 32, 35, 38, 40, 45, 50, 55, 60, 65].map(age => {
                        const currentYear = new Date().getFullYear();
                        const birthYear = currentYear - age;
                        const isCurrent = calYear === birthYear;

                        return (
                          <TouchableOpacity
                            key={age}
                            style={[styles.presetCard, isCurrent && styles.presetCardActive]}
                            onPress={() => {
                              setCalYear(birthYear);
                              setSelectedDecade(Math.floor(birthYear / 10) * 10);
                              setCalViewMode('days');
                            }}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.presetCardAge, isCurrent && styles.presetCardAgeActive]}>
                              {age} yrs
                            </Text>
                            <Text style={[styles.presetCardYear, isCurrent && styles.presetCardYearActive]}>
                              Born {birthYear}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Bottom Modal Actions */}
            <View style={styles.modernCalFooter}>
              <TouchableOpacity
                style={styles.calResetBtn}
                onPress={() => {
                  setDob('');
                  setShowDatePickerModal(false);
                }}
                activeOpacity={0.7}
              >
                <RotateCcw size={14} color="#64748B" strokeWidth={2.2} />
                <Text style={styles.calResetBtnText}>Clear</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.calSecondaryBtn}
                  onPress={() => setShowDatePickerModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.calSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.calConfirmBtn}
                  onPress={() => {
                    const mm = String(calMonth + 1).padStart(2, '0');
                    const dd = String(calDay).padStart(2, '0');
                    const formattedDob = `${calYear}-${mm}-${dd}`;
                    setDob(formattedDob);
                    setShowDatePickerModal(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.calConfirmBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
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
  editBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E2E8F0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
  },
  fieldGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dobLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 18,
    marginBottom: 6,
  },
  inlineAgeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  inlineAgeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  modernDobTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  modernDobValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  modernDobPlaceholderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    flex: 1,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modernCalContainer: {
    width: '100%',
    maxWidth: 375,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  modernCalHeaderBanner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  modernCalHeaderSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  calHeaderAgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  calHeaderAgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
  },
  modernCalHeaderDate: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 14,
  },
  calSegmentedRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  calSegmentTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  calSegmentTabActive: {
    backgroundColor: '#FFFFFF',
  },
  calSegmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  calSegmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modernCalBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  modernMonthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modernNavArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearCenterBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jumpPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jumpPillYearBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  modernMonthTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modernYearBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  modernWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  modernWeekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  modernDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modernDayCellEmpty: {
    width: '14.28%',
    height: 36,
  },
  modernDayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginVertical: 1,
  },
  modernDayCellSelected: {
    backgroundColor: '#0F172A',
  },
  modernDayCellToday: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  modernDayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  modernDayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modernDayCellTextToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabContentBlock: {
    paddingVertical: 4,
  },
  tabInstruction: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  monthCardSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  monthCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthCardTextSelected: {
    color: '#FFFFFF',
  },
  monthCardSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  monthCardSubSelected: {
    color: '#94A3B8',
  },
  decadeScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  decadeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  decadeChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  decadeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  decadeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  decadeYearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 6,
  },
  decadeYearBtn: {
    width: '18%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    marginBottom: 4,
  },
  decadeYearBtnSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  decadeYearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  decadeYearTextSelected: {
    color: '#FFFFFF',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '23%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  presetCardActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetCardAge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  presetCardAgeActive: {
    color: '#FFFFFF',
  },
  presetCardYear: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  presetCardYearActive: {
    color: '#94A3B8',
  },
  modernCalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  calResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  calResetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calSecondaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  calSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  calConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  genderChipsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 46,
  },
  genderChip: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
  },
  genderChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  genderChipTextActive: {
    color: '#FFFFFF',
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    borderRadius: 14,
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  bottomSaveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  contactValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  contactVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  notAddedText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  changePillBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  changePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  addPillBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  addPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0F172A',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#1E293B',
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#0F172A',
  },
  modalBody: {
    paddingBottom: 10,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalSubMessage: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  otpDisplayBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpDisplayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 2,
  },
  modalPrimaryBtn: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successDoneBtn: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  successDoneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  wrongNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  resendTimerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  successBody: {
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 20,
  },
  successIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});
