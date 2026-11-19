import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Camera,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  X,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

export default function PersonalInformationScreen() {
  const { pop, setTab, user } = useApp();
  const insets = useSafeAreaInsets();

  // Basic Details State
  const [fullName, setFullName] = useState(user?.name || 'Aarav Varma');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [userRole, setUserRole] = useState<'Owner' | 'Tenant' | 'Buyer' | 'Broker'>('Owner');

  // Contact Details State
  const [primaryPhone, setPrimaryPhone] = useState(user?.phone || '+91 9876543210');
  const [primaryEmail, setPrimaryEmail] = useState(user?.email || 'aarav.varma@seedha.com');
  const [alternatePhone, setAlternatePhone] = useState<string | null>(null);
  const [alternateEmail, setAlternateEmail] = useState<string | null>(null);

  // Address State
  const [streetAddress, setStreetAddress] = useState('Plot 42, Road No. 36, Jubilee Hills');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500033');
  const [stateName, setStateName] = useState('Telangana');

  // Modal 1: Add Alternate Mobile Number State
  const [showAddAlternateModal, setShowAddAlternateModal] = useState(false);
  const [altPhoneStep, setAltPhoneStep] = useState<1 | 2 | 3>(1); // 1: Enter phone, 2: OTP, 3: Success
  const [altPhoneInput, setAltPhoneInput] = useState('9567889900');
  const [altOtpDigits, setAltOtpDigits] = useState(['5', '6', '7', '7', '8', '0']);

  // Modal 2: Change Mobile Number State
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [changePhoneStep, setChangePhoneStep] = useState<1 | 2 | 3 | 4>(1); // 1: Verify current, 2: New phone, 3: OTP new, 4: Success
  const [changePhoneCurrentOtp, setChangePhoneCurrentOtp] = useState(['9', '8', '7', '6', '5', '4']);
  const [changePhoneNewInput, setChangePhoneNewInput] = useState('9154765352');
  const [changePhoneNewOtp, setChangePhoneNewOtp] = useState(['6', '7', '8', '9', '0', '0']);

  // Handle Edit/Save Header Button
  const [isEditing, setIsEditing] = useState(false);

  const handleDoneAddAlternate = () => {
    setAlternatePhone(`+91 ${altPhoneInput}`);
    setShowAddAlternateModal(false);
    setAltPhoneStep(1);
  };

  const handleDoneChangePhone = () => {
    setPrimaryPhone(`+91 ${changePhoneNewInput}`);
    setShowChangePhoneModal(false);
    setChangePhoneStep(1);
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
            style={styles.editBtn}
            onPress={() => {
              setIsEditing(!isEditing);
              if (isEditing) {
                Alert.alert('Saved', 'Your personal information has been updated successfully.');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
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
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format',
              }}
              style={styles.avatarImg}
            />
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.85}>
              <Camera size={14} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{fullName}</Text>

          <View style={styles.verifiedRow}>
            <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
            <Text style={styles.verifiedText}>Verified Owner</Text>
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
              editable={isEditing}
            />
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Date of birth</Text>
              <TextInput
                style={styles.inputBox}
                value={dob}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#94A3B8"
                onChangeText={setDob}
                editable={isEditing}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <TextInput
                style={styles.inputBox}
                value={gender}
                onChangeText={setGender}
                editable={isEditing}
              />
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
          <Text style={styles.sectionDesc}>Every phone number and email must be verified with an OTP.</Text>

          {/* Primary Mobile */}
          <View style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Phone size={16} color="#64748B" strokeWidth={2.2} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Mobile number</Text>
              <View style={styles.contactValRow}>
                <Text style={styles.contactVal}>{primaryPhone}</Text>
                <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.changePillBtn}
              onPress={() => {
                setChangePhoneStep(1);
                setShowChangePhoneModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.changePillText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Email */}
          <View style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Mail size={16} color="#64748B" strokeWidth={2.2} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email address</Text>
              <View style={styles.contactValRow}>
                <Text style={styles.contactVal}>{primaryEmail}</Text>
                <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
              </View>
            </View>
            <TouchableOpacity style={styles.changePillBtn} activeOpacity={0.8}>
              <Text style={styles.changePillText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Alternate Mobile */}
          <View style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Phone size={16} color="#64748B" strokeWidth={2.2} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Alternate mobile</Text>
              <View style={styles.contactValRow}>
                <Text style={[styles.contactVal, !alternatePhone && styles.notAddedText]}>
                  {alternatePhone || 'Not added'}
                </Text>
                {alternatePhone ? (
                  <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
                ) : null}
              </View>
            </View>

            {alternatePhone ? (
              <TouchableOpacity
                style={styles.changePillBtn}
                onPress={() => {
                  setAltPhoneStep(1);
                  setShowAddAlternateModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.changePillText}>Change</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addPillBtn}
                onPress={() => {
                  setAltPhoneStep(1);
                  setShowAddAlternateModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addPillText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Alternate Email */}
          <View style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Mail size={16} color="#64748B" strokeWidth={2.2} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Alternate email</Text>
              <View style={styles.contactValRow}>
                <Text style={[styles.contactVal, !alternateEmail && styles.notAddedText]}>
                  {alternateEmail || 'Not added'}
                </Text>
                {alternateEmail ? (
                  <CheckCircle2 size={13} color="#10B981" strokeWidth={2.4} />
                ) : null}
              </View>
            </View>
            <TouchableOpacity style={styles.addPillBtn} activeOpacity={0.8}>
              <Text style={styles.addPillText}>+ Add</Text>
            </TouchableOpacity>
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
              editable={isEditing}
            />
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.inputBox}
                value={city}
                onChangeText={setCity}
                editable={isEditing}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>PIN code</Text>
              <TextInput
                style={styles.inputBox}
                value={pincode}
                onChangeText={setPincode}
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>State</Text>
            <TextInput
              style={styles.inputBox}
              value={stateName}
              onChangeText={setStateName}
              editable={isEditing}
            />
          </View>
        </View>
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
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
    backgroundColor: '#F1F5F9',
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
  roleChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 14,
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
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
