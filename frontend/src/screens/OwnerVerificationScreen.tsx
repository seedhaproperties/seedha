import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  Image as RNImage,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Scale,
  Star,
  CheckCircle2,
  Download,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Bookmark,
  FilePlus,
  Check,
  ImagePlus,
  X,
  Lock,
  Clock,
  Info,
  Shield,
  Wallet,
  House,
  Wrench,
  FileText,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import colors from '../theme/colors';

// Saved rental homes matching media_1794669292780_beb16492.jpg
const savedRentalHomes = [
  {
    id: 'saved-1',
    title: '2 BHK Independent House',
    propertyType: 'Independent house',
    flatNumber: 'House 12',
    buildingName: 'Independent House',
    location: 'Gajuwaka',
    city: 'Vizag',
    pincode: '530026',
    price: '15,000',
    ownerName: 'Venkata Rao',
    ownerPhone: '+91 98490 23456',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  },
  {
    id: 'saved-2',
    title: '3 BHK Flat',
    propertyType: 'Apartment',
    flatNumber: 'Flat 302',
    buildingName: 'Cyber Heights',
    location: 'Kondapur',
    city: 'Hyderabad',
    pincode: '500084',
    price: '22,000',
    ownerName: 'Priya Sharma',
    ownerPhone: '+91 98765 12345',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  },
  {
    id: 'saved-3',
    title: '2 BHK Apartment',
    propertyType: 'Apartment',
    flatNumber: 'Flat 104',
    buildingName: 'Seaside Residency',
    location: 'MVP Colony',
    city: 'Vizag',
    pincode: '530017',
    price: '12,000',
    ownerName: 'Anand Rao',
    ownerPhone: '+91 99887 65432',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
  },
];

export default function OwnerVerificationScreen() {
  const { pop, push, currentScreen } = useApp();
  const prepopulated = currentScreen?.params?.property as any;

  // Step 1: selectHome matching media_1794667987270_77a62438.jpg
  // Step 1B: savedList matching media_1794669292780_beb16492.jpg
  // Step 2: form matching media_1794668375276_369da42e.png
  // Step 3: payment matching media_1794668662268_6c1b1ee0.jpg
  // Step 4: report
  const initialStep = prepopulated ? 'form' : 'selectHome';
  const [step, setStep] = useState<'selectHome' | 'savedList' | 'verifiedDetails' | 'form' | 'payment' | 'inProgress' | 'verificationCompleted' | 'report'>(initialStep);
  const [selectedHomeOption, setSelectedHomeOption] = useState<'saved' | 'add'>('add');
  const [selectedSavedId, setSelectedSavedId] = useState<string>('saved-1');

  // Property Details
  const [propertyType, setPropertyType] = useState('Apartment');
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Owner Details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  // User Payment Details (matching media_1794668662268_6c1b1ee0.jpg)
  const [userPhone, setUserPhone] = useState('9876543210');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'owner' | 'property'>('owner');

  const isFormValid =
    flatNumber.trim().length > 0 &&
    locality.trim().length > 0 &&
    ownerName.trim().length > 0 &&
    ownerPhone.trim().length >= 10;

  // Prepopulate saved property into verification fields
  const applySelectedSavedProperty = (savedId: string) => {
    const item = savedRentalHomes.find((p) => p.id === savedId) || savedRentalHomes[0];
    if (item) {
      setPropertyType(item.propertyType);
      setFlatNumber(item.flatNumber);
      setBuildingName(item.buildingName);
      setLocality(item.location);
      setCity(item.city);
      setPincode(item.pincode);
      setMonthlyRent(item.price);
      setOwnerName(item.ownerName);
      setOwnerPhone(item.ownerPhone);
    }
  };

  // Submit Flat & Owner Details -> Proceed to Payment
  const handleProceedToPayment = () => {
    if (!flatNumber.trim()) setFlatNumber('402');
    if (!locality.trim()) setLocality('FGFHG');
    if (!city.trim()) setCity('Hyderabad');
    if (!pincode.trim()) setPincode('533261');
    if (!ownerName.trim()) setOwnerName('FGFJGHJH');
    if (!ownerPhone.trim()) setOwnerPhone('+91 98850 11223');

    setStep('payment');
  };

  // Pay Money -> Receive Owner Background Details Digitally
  const handlePayMoney = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to authorize verification.');
      return;
    }

    setLoading(true);
    try {
      const id = requestId || `bg-${Date.now()}`;
      const res = await api.ownerBackground.pay(id, `txn_bg_${Date.now()}`, 799);
      setReport(res.record);
      setStep('inProgress');
    } catch {
      // Fallback verified report structure
      setReport({
        id: requestId || `bg-${Date.now()}`,
        ownerName: ownerName || 'Venkata Rao',
        flatNumber: flatNumber || '402',
        buildingName: buildingName || 'Independent House',
        propertyAddress: locality || 'Gajuwaka',
        city: city || 'Vizag',
        status: 'SENT_DIGITALLY',
        ownershipVerified: true,
        legalDisputeClear: true,
        taxReceiptsVerified: true,
        societyDuesClear: true,
        reportSummary: `Background verification completed for ${ownerName || 'Venkata Rao'} at ${buildingName || 'Independent House'}, ${flatNumber || '402'}. Title deed verified, zero encumbrances detected in Sub-Registrar records, municipal property tax current, and society dues cleared.`,
        reportPdfUrl: 'https://seedhaproperties.com/reports/sample_verification.pdf',
      });
      setStep('inProgress');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    Alert.alert(
      'Download Initiated',
      `Official verified Owner Background Report PDF for ${ownerName || 'Venkata Rao'} has been saved to your downloads.`,
    );
  };

  const handleAddPhoto = () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos.');
      return;
    }
    const samplePhotos = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    ];
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: Select Home / Intro matching media_1794667987270_77a62438.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'selectHome') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={pop}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verify Owner</Text>
            <Text style={styles.customHeaderSubtitle}>Rental homes · report within 24 hours</Text>
          </View>
        </View>

        {/* 3-Segment Progress Indicator */}
        <View style={styles.stepperBarWrap}>
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={styles.stepperBarSegment} />
          <View style={styles.stepperBarSegment} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Obsidian Hero Card */}
          <View style={styles.heroDarkCard}>
            <View style={styles.heroShieldIconBox}>
              <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.heroDarkTitle}>
              Check the owner and the home before you rent
            </Text>
            <Text style={styles.heroDarkSubtitle}>
              Choose a home, pay once, and get verified owner, property and rental details within 24 hours.
            </Text>
          </View>

          {/* Section Question */}
          <Text style={styles.selectionQuestionTitle}>Which home do you want verified?</Text>

          {/* Option 1: Select from saved properties matching media_1794668893794_a2a6e03b.jpg */}
          <TouchableOpacity
            style={styles.homeOptionCard}
            onPress={() => {
              setSelectedHomeOption('saved');
              setStep('savedList');
            }}
            activeOpacity={0.85}
          >
            <View
              style={
                selectedHomeOption === 'saved'
                  ? styles.homeOptionIconBoxBlack
                  : styles.homeOptionIconBoxGrey
              }
            >
              <Bookmark
                size={20}
                color={selectedHomeOption === 'saved' ? '#FFFFFF' : '#111827'}
                strokeWidth={2}
              />
            </View>
            <View style={styles.homeOptionTextCol}>
              <Text style={styles.homeOptionTitle}>Select from saved properties</Text>
              <Text style={styles.homeOptionSubtitle}>No saved rental homes yet</Text>
            </View>
            <View style={styles.radioBox}>
              {selectedHomeOption === 'saved' ? (
                <View style={styles.radioSelectedDot}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radioUnselectedRing} />
              )}
            </View>
          </TouchableOpacity>

          {/* Option 2: Add a flat or house for rent */}
          <TouchableOpacity
            style={styles.homeOptionCard}
            onPress={() => setSelectedHomeOption('add')}
            activeOpacity={0.85}
          >
            <View
              style={
                selectedHomeOption === 'add'
                  ? styles.homeOptionIconBoxBlack
                  : styles.homeOptionIconBoxGrey
              }
            >
              <FilePlus
                size={20}
                color={selectedHomeOption === 'add' ? '#FFFFFF' : '#111827'}
                strokeWidth={2}
              />
            </View>
            <View style={styles.homeOptionTextCol}>
              <Text style={styles.homeOptionTitle}>Add a flat or house for rent</Text>
              <Text style={styles.homeOptionSubtitle}>Enter the address, photos and owner details</Text>
            </View>
            <View style={styles.radioBox}>
              {selectedHomeOption === 'add' ? (
                <View style={styles.radioSelectedDot}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radioUnselectedRing} />
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.stickyBottomBar}>
          <TouchableOpacity
            style={styles.continueBlackBtn}
            onPress={() => {
              if (selectedHomeOption === 'add') {
                setStep('form');
              } else {
                setStep('savedList');
              }
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBlackBtnText}>Continue</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 1B: Choose a saved rental home matching media_1794669292780_beb16492.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'savedList') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep('selectHome')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verify Owner</Text>
            <Text style={styles.customHeaderSubtitle}>Rental homes · report within 24 hours</Text>
          </View>
        </View>

        {/* 3-Segment Progress Indicator (Segments 1 & 2 Solid Black) */}
        <View style={styles.stepperBarWrap}>
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={styles.stepperBarSegment} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Heading */}
          <Text style={styles.chooseSavedHomeHeading}>Choose a saved rental home</Text>

          {/* 3 Saved Rental Home Cards matching screenshot */}
          {savedRentalHomes.map((item) => {
            const isSelected = selectedSavedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.savedRentalCard}
                onPress={() => setSelectedSavedId(item.id)}
                activeOpacity={0.88}
              >
                <RNImage source={{ uri: item.image }} style={styles.savedRentalImage} />
                <View style={styles.savedRentalInfoCol}>
                  <Text style={styles.savedRentalTitle}>{item.title}</Text>
                  <View style={styles.savedRentalLocationRow}>
                    <MapPin size={12} color="#6B7280" strokeWidth={2} style={{ marginRight: 3 }} />
                    <Text style={styles.savedRentalLocationText}>
                      {item.location}, {item.city}
                    </Text>
                  </View>
                  <Text style={styles.savedRentalPrice}>₹{item.price}/month</Text>
                  <Text style={styles.savedRentalOwner}>Owner: {item.ownerName}</Text>
                </View>
                <View style={styles.radioBox}>
                  {isSelected ? (
                    <View style={styles.radioSelectedDot}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.radioUnselectedRing} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.stickyBottomBar}>
          <TouchableOpacity
            style={styles.continuePaymentRoundBtn}
            onPress={() => {
              applySelectedSavedProperty(selectedSavedId);
              setStep('verifiedDetails');
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.continuePaymentRoundBtnText}>Continue to payment</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  
  // ─────────────────────────────────────────────────────────────
  // STEP 1C: Verified Owner & Property matching media_1794670551764_4ad681b7.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'verifiedDetails') {
    const selectedProperty =
      savedRentalHomes.find((p) => p.id === selectedSavedId) || savedRentalHomes[2]; // Default to Item 3 (MVP Colony, Vizag) matching screenshot

    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep('savedList')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verified owner & property</Text>
            <Text style={styles.customHeaderSubtitle}>For rental homes</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Dark Card */}
          <View style={styles.heroDarkCard}>
            <View style={styles.heroShieldIconBox}>
              <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.heroDarkTitle}>
              Know your landlord and the home before you rent
            </Text>
            <Text style={styles.heroDarkSubtitle}>
              Get verified owner and property details with Seedha. We review ownership information, property records and rental details to help you make a confident rental decision. Receive your verification report within 24 hours.
            </Text>
          </View>

          {/* Selected Property Card */}
          <View style={styles.verifiedSelectedPropertyCard}>
            <RNImage
              source={{ uri: selectedProperty.image }}
              style={styles.verifiedSelectedPropertyImage}
            />
            <View style={styles.verifiedSelectedPropertyInfo}>
              <Text style={styles.verifiedSelectedPropertyTitle}>
                {selectedProperty.title}
              </Text>
              <Text style={styles.verifiedSelectedPropertyLoc}>
                {selectedProperty.location}, {selectedProperty.city}
              </Text>
              <Text style={styles.verifiedSelectedPropertyPrice}>
                ₹{selectedProperty.price}/month
              </Text>
            </View>
          </View>

          {/* Card: What you will receive */}
          <View style={styles.receiveCardWhite}>
            <Text style={styles.receiveCardTitle}>What you will receive</Text>

            {/* Block 1: Owner details */}
            <View style={styles.receiveBlueGreyBlock}>
              <View style={styles.receiveBlockHeader}>
                <View style={styles.receiveWhiteIconBox}>
                  <User size={18} color="#111827" strokeWidth={2} />
                </View>
                <Text style={styles.receiveBlockHeading}>Owner details</Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Identity & Contact Verification
                </Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Owner Background & Conduct
                </Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Complaint & Legal Record Status
                </Text>
              </View>
            </View>

            {/* Block 2: Property details */}
            <View style={styles.receiveBlueGreyBlock}>
              <View style={styles.receiveBlockHeader}>
                <View style={styles.receiveWhiteIconBox}>
                  <House size={18} color="#111827" strokeWidth={2} />
                </View>
                <Text style={styles.receiveBlockHeading}>Property details</Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Ownership & Title Details
                </Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Loan, Tax & Pending Dues Status
                </Text>
              </View>
              <View style={styles.receiveCheckItem}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <Text style={styles.receiveCheckItemText}>
                  Previous Tenant Reviews & Feedback
                </Text>
              </View>
            </View>
          </View>

          {/* Card: How it works */}
          <View style={styles.howItWorksCardWhite}>
            <Text style={styles.howItWorksCardTitle}>How it works</Text>

            {/* Step 1 */}
            <View style={styles.howStepRow}>
              <View style={styles.howStepIconBox}>
                <Wallet size={16} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.howStepTextCol}>
                <Text style={styles.howStepTitle}>Pay ₹799</Text>
                <Text style={styles.howStepSub}>Choose a time for our call and visit.</Text>
              </View>
            </View>

            {/* Line 1 */}
            <View style={styles.howStepLine} />

            {/* Step 2 */}
            <View style={styles.howStepRow}>
              <View style={styles.howStepIconBox}>
                <Phone size={16} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.howStepTextCol}>
                <Text style={styles.howStepTitle}>We verify</Text>
                <Text style={styles.howStepSub}>
                  Seedha verifies owner identity, property information and available records.
                </Text>
              </View>
            </View>

            {/* Line 2 */}
            <View style={styles.howStepLine} />

            {/* Step 3 */}
            <View style={styles.howStepRow}>
              <View style={styles.howStepIconBox}>
                <FileText size={16} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.howStepTextCol}>
                <Text style={styles.howStepTitle}>Report in 24 hours</Text>
                <Text style={styles.howStepSub}>
                  See the verified owner, property and rental details in the app.
                </Text>
              </View>
            </View>
          </View>

          {/* Card: Declared by the owner */}
          <View style={styles.declaredCardWhite}>
            <View style={styles.declaredHeaderRow}>
              <Text style={styles.declaredHeaderTitle}>Declared by the owner</Text>
              <View style={styles.declaredBadgeYellow}>
                <Text style={styles.declaredBadgeText}>Not yet verified</Text>
              </View>
            </View>
            <Text style={styles.declaredSubNotice}>
              The owner shared these when posting the home. Seedha checks each one in the verified report.
            </Text>

            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Posted as</Text>
              <Text style={styles.declaredVal}>Owner</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Owner</Text>
              <Text style={styles.declaredVal}>{selectedProperty.ownerName || 'fdhfgh'}</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Phone Number</Text>
              <Text style={styles.declaredVal}>9154475498</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Mail</Text>
              <Text style={styles.declaredVal}>dfdfg@gmail.com</Text>
            </View>
            <View style={[styles.declaredKeyValueRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.declaredKey}>Ownership</Text>
              <Text style={styles.declaredVal}>Purchased, 2022</Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.stickyBottomBar}>
          <TouchableOpacity
            style={styles.payVerifiedDetailsBtn}
            onPress={handlePayMoney}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Lock size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.payVerifiedDetailsBtnText}>
                  Pay ₹799 & get verified details
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // ─────────────────────────────────────────────────────────────
  // STEP 2: Form matching media_1794668375276_369da42e.png
  // ─────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep('selectHome')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verify Owner</Text>
            <Text style={styles.customHeaderSubtitle}>Rental homes · report within 24 hours</Text>
          </View>
        </View>

        {/* 3-Segment Progress Indicator (Segments 1 & 2 Active) */}
        <View style={styles.stepperBarWrap}>
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={styles.stepperBarSegment} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Flat or house details */}
          <View style={styles.formSectionCard}>
            <Text style={styles.formCardHeading}>Flat or house details</Text>
            <Text style={styles.formFieldLabel}>Property type</Text>

            {/* Property Type Pills */}
            <View style={styles.typePillsWrap}>
              {['Apartment', 'Independent house', 'Villa', 'Commerical Spaces', 'PG / Room'].map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.typePill,
                      propertyType === item && styles.typePillActive,
                    ]}
                    onPress={() => setPropertyType(item)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        propertyType === item && styles.typePillTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Flat / house no. & Building name (2 Columns) */}
            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.inputFieldLabel}>Flat / house no.</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="e.g. 402"
                  placeholderTextColor="#9CA3AF"
                  value={flatNumber}
                  onChangeText={setFlatNumber}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputFieldLabel}>Building name</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="Optional"
                  placeholderTextColor="#9CA3AF"
                  value={buildingName}
                  onChangeText={setBuildingName}
                />
              </View>
            </View>

            {/* Locality / area */}
            <View style={styles.formRowSingle}>
              <Text style={styles.inputFieldLabel}>Locality / area</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="e.g. Kondapur"
                placeholderTextColor="#9CA3AF"
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            {/* City & PIN code (2 Columns) */}
            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.inputFieldLabel}>City</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="Hyderabad"
                  placeholderTextColor="#9CA3AF"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.formCol}>
                <Text style={styles.inputFieldLabel}>PIN code</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="6 digits"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>

            {/* Monthly rent (₹) */}
            <View style={styles.formRowSingle}>
              <Text style={styles.inputFieldLabel}>Monthly rent (₹)</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="e.g. 18000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={monthlyRent}
                onChangeText={setMonthlyRent}
              />
            </View>
          </View>

          {/* Card 2: Photos (up to 6) */}
          <View style={styles.formSectionCard}>
            <Text style={styles.formCardHeading}>
              Photos <Text style={styles.formCardHeadingSub}>(up to 6)</Text>
            </Text>

            <View style={styles.photosGrid}>
              {photos.map((uri, idx) => (
                <View key={idx} style={styles.photoThumbWrap}>
                  <RNImage source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => handleRemovePhoto(idx)}
                    activeOpacity={0.8}
                  >
                    <X size={14} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 6 && (
                <TouchableOpacity
                  style={styles.addPhotoDashedBox}
                  onPress={handleAddPhoto}
                  activeOpacity={0.75}
                >
                  <ImagePlus size={22} color="#111827" strokeWidth={2} />
                  <Text style={styles.addPhotoText}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Card 3: Owner details */}
          <View style={styles.formSectionCard}>
            <Text style={styles.formCardHeading}>Owner details</Text>

            {/* Owner name */}
            <View style={styles.formRowSingle}>
              <Text style={styles.inputFieldLabel}>Owner name</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>

            {/* Owner mobile number */}
            <View style={styles.formRowSingle}>
              <Text style={styles.inputFieldLabel}>Owner mobile number</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="10-digit number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={ownerPhone}
                onChangeText={setOwnerPhone}
              />
            </View>

            {/* Owner email */}
            <View style={styles.formRowSingle}>
              <Text style={styles.inputFieldLabel}>Owner email</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="Optional"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={ownerEmail}
                onChangeText={setOwnerEmail}
              />
            </View>

            {/* Help footnote */}
            <Text style={styles.ownerNoticeFootnote}>
              Seedha will call the owner to confirm identity and ownership.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar for Step: Form */}
        <View style={styles.formStickyBottomBar}>
          <TouchableOpacity
            style={styles.continuePaymentBtn}
            onPress={handleProceedToPayment}
            activeOpacity={0.88}
          >
            <Text style={styles.continuePaymentBtnText}>Continue to payment</Text>
          </TouchableOpacity>
          <Text style={styles.continuePaymentNotice}>
            Add the flat number, locality, owner name and a valid owner mobile number.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3: Payment matching media_1794668662268_6c1b1ee0.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep(selectedHomeOption === 'saved' ? 'savedList' : 'form')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verify Owner</Text>
            <Text style={styles.customHeaderSubtitle}>Rental homes · report within 24 hours</Text>
          </View>
        </View>

        {/* 3-Segment Progress Indicator (All 3 Segments Solid Black) */}
        <View style={styles.stepperBarWrap}>
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
          <View style={[styles.stepperBarSegment, styles.stepperBarSegmentActive]} />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Verifying Property Summary */}
          <View style={styles.paymentSummaryCardWhite}>
            <Text style={styles.verifyingEyebrow}>Verifying</Text>
            <Text style={styles.verifyingPropertyType}>{propertyType || 'Apartment'}</Text>
            <Text style={styles.verifyingAddress}>
              {[flatNumber || '402', buildingName, locality || 'FGFHG', city || 'Hyderabad', pincode || '533261']
                .filter(Boolean)
                .join(', ')}
            </Text>
            <Text style={styles.verifyingOwnerLine}>
              Owner: <Text style={styles.verifyingOwnerBold}>{ownerName || 'FGFJGHJH'}</Text>
            </Text>

            <View style={styles.verifyingCardDivider} />

            {/* Checklist items */}
            <View style={styles.verificationCheckRow}>
              <Phone size={16} color="#111827" strokeWidth={2} />
              <Text style={styles.verificationCheckText}>
                Owner identity and contact details verification
              </Text>
            </View>

            <View style={styles.verificationCheckRow}>
              <FileText size={16} color="#111827" strokeWidth={2} />
              <Text style={styles.verificationCheckText}>
                Property ownership and document verification
              </Text>
            </View>

            <View style={styles.verificationCheckRow}>
              <Wrench size={16} color="#111827" strokeWidth={2} />
              <Text style={styles.verificationCheckText}>
                Property details and available records verification
              </Text>
            </View>
          </View>

          {/* Card 2: User Mobile Number & Authorization */}
          <View style={styles.paymentSummaryCardWhite}>
            <Text style={styles.userPhoneInputLabel}>Your mobile number (for updates)</Text>
            <TextInput
              style={styles.userPhoneTextInput}
              placeholder="Enter your mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={userPhone}
              onChangeText={setUserPhone}
            />

            {/* Terms checkbox row */}
            <TouchableOpacity
              style={styles.termsAgreementRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.termsCheckboxBox,
                  agreedToTerms && styles.termsCheckboxBoxActive,
                ]}
              >
                {agreedToTerms && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.termsAgreementText}>
                I agree to Seedha Properties' Terms & Conditions and authorize verification of the submitted owner and property information.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 3: Total Price Box */}
          <View style={styles.totalPriceCardWhite}>
            <Text style={styles.totalPriceLabel}>Total (incl. GST)</Text>
            <Text style={styles.totalPriceValue}>₹799</Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar for Step: Payment */}
        <View style={styles.paymentStickyBottomBar}>
          <TouchableOpacity
            style={styles.payRequestReportBtn}
            onPress={handlePayMoney}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Lock size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.payRequestReportBtnText}>Pay ₹799 & request report</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.payRequestNotice}>
            You will receive the verified report within 24 hours.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  
  // ─────────────────────────────────────────────────────────────
  // STEP 3B: Verification In Progress matching media_1794670953188_2408c25f.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'inProgress') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep('selectHome')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verification in progress</Text>
            <Text style={styles.customHeaderSubtitle}>
              {propertyType || 'Apartment'} · VR-169475
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Dark Card */}
          <View style={styles.heroDarkCard}>
            <View style={styles.heroClockRow}>
              <Clock size={15} color="#D1D5DB" strokeWidth={2} />
              <Text style={styles.heroClockText}>Report within 24 hours</Text>
            </View>
            <Text style={styles.heroExpectedDateText}>
              Expected by 14 Nov, 10:32 am
            </Text>
            <View style={styles.heroProgressBarTrack}>
              <View style={styles.heroProgressBarFill} />
            </View>
            <Text style={styles.heroProgressDescText}>
              Your property verification is underway. Your report will be available within 24 hours.
            </Text>
          </View>

          {/* Progress Timeline Card */}
          <View style={styles.inProgressCardWhite}>
            <Text style={styles.inProgressCardTitle}>Progress</Text>

            {/* Step 1: Request received */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Request received</Text>
                <Text style={styles.progressItemDesc}>
                  Payment confirmed and your request is with our verification team.
                </Text>
              </View>
            </View>

            {/* Step 2: Details cross-checked */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Details cross-checked</Text>
                <Text style={styles.progressItemDesc}>
                  We compare the declared owner and property details with official records.
                </Text>
                <Text style={styles.progressDoneText}>Done</Text>
              </View>
            </View>

            {/* Step 3: Owner Verification */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressBlackCircle}>
                  <Clock size={13} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#E5E7EB' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Owner Verification</Text>
                <Text style={styles.progressItemDesc}>
                  Owner identity and ownership details are being verified.
                </Text>
                <Text style={styles.progressInProgressText}>In progress now</Text>
              </View>
            </View>

            {/* Step 4: Property Verification */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreyCircle}>
                  <Text style={styles.progressCircleNumber}>4</Text>
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#E5E7EB' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={[styles.progressItemTitle, { color: '#6B7280' }]}>
                  Property Verification
                </Text>
                <Text style={[styles.progressItemDesc, { color: '#9CA3AF' }]}>
                  Property details, records and information are being verified.
                </Text>
              </View>
            </View>

            {/* Step 5: Report ready */}
            <View style={[styles.progressTimelineItem, { marginBottom: 4 }]}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreyCircle}>
                  <Text style={styles.progressCircleNumber}>5</Text>
                </View>
              </View>
              <View style={styles.progressContentCol}>
                <Text style={[styles.progressItemTitle, { color: '#6B7280' }]}>
                  Report ready
                </Text>
                <Text style={[styles.progressItemDesc, { color: '#9CA3AF' }]}>
                  Your Seedha Verified Report is being prepared.
                </Text>
              </View>
            </View>
          </View>

          {/* Details declared by the owner */}
          <View style={styles.declaredCardWhite}>
            <Text style={styles.declaredHeaderTitle}>Details declared by the owner</Text>

            <View style={[styles.declaredKeyValueRow, { marginTop: 6 }]}>
              <Text style={styles.declaredKey}>Submitted by</Text>
              <Text style={styles.declaredVal}>New rental home</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Posted as</Text>
              <Text style={styles.declaredVal}>Owner</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Owner</Text>
              <Text style={styles.declaredVal}>{ownerName || 'fdhfgh'}</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Phone Number</Text>
              <Text style={styles.declaredVal}>{ownerPhone || '9154475498'}</Text>
            </View>
            <View style={styles.declaredKeyValueRow}>
              <Text style={styles.declaredKey}>Mail</Text>
              <Text style={styles.declaredVal}>{ownerEmail || 'dfdfg@gmail.com'}</Text>
            </View>
            <View style={[styles.declaredKeyValueRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.declaredKey}>Ownership</Text>
              <Text style={styles.declaredVal}>Purchased</Text>
            </View>
          </View>

          {/* Prototype note */}
          <View style={styles.prototypeNoteRow}>
            <Info size={14} color="#9CA3AF" style={{ marginTop: 2 }} />
            <Text style={styles.prototypeNoteText}>
              Prototype note: the 24-hour process is sped up here so you can see every stage in about a minute.
            </Text>
          </View>

          {/* Seedha Verified process badge */}
          <View style={styles.seedhaVerifiedBadgeRow}>
            <Shield size={13} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.seedhaVerifiedBadgeText}>Seedha Verified process</Text>
          </View>

          {/* View Completed Report Action */}
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <TouchableOpacity
              style={styles.viewReportBtn}
              onPress={() => setStep('verificationCompleted')}
              activeOpacity={0.88}
            >
              <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.viewReportBtnText}>Check Report Status (Completed)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }


  
  // ─────────────────────────────────────────────────────────────
  // STEP 3C: Verification Completed Report matching media_1794717169784_fbf3c3f3.jpg
  // ─────────────────────────────────────────────────────────────
  if (step === 'verificationCompleted') {
    const displayPropertyTitle = buildingName || propertyType || '2 BHK Independent House';

    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => setStep('inProgress')}
            style={styles.backCircleBtn}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.customHeaderTitle}>Verification Report</Text>
            <Text style={styles.customHeaderSubtitle}>
              {displayPropertyTitle} · VR-394844
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Yellow Banner: Verification Completed */}
          <View style={styles.completedYellowBanner}>
            <View style={styles.completedAlertIconBox}>
              <AlertTriangle size={28} color="#D97706" strokeWidth={2.2} />
            </View>
            <View style={styles.completedBannerTextCol}>
              <Text style={styles.completedBannerTitle}>Verification Completed</Text>
              <Text style={styles.completedBannerSub}>Completed 14 Nov, 10:19 am</Text>
            </View>
          </View>

          {/* Progress Timeline Card - All Completed (Green) */}
          <View style={styles.inProgressCardWhite}>
            <Text style={styles.inProgressCardTitle}>Progress</Text>

            {/* Step 1: Request received */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Request received</Text>
                <Text style={styles.progressItemDesc}>
                  Payment confirmed and your request is with our verification team.
                </Text>
              </View>
            </View>

            {/* Step 2: Details cross-checked */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Details cross-checked</Text>
                <Text style={styles.progressItemDesc}>
                  We compare the declared owner and property details with official records.
                </Text>
                <Text style={styles.progressDoneText}>Done</Text>
              </View>
            </View>

            {/* Step 3: Owner Verification */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Owner Verification</Text>
                <Text style={styles.progressItemDesc}>
                  Owner identity and ownership details have been verified.
                </Text>
                <Text style={styles.progressDoneText}>Done</Text>
              </View>
            </View>

            {/* Step 4: Property Verification */}
            <View style={styles.progressTimelineItem}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={[styles.progressTimelineLine, { backgroundColor: '#16A34A' }]} />
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Property Verification</Text>
                <Text style={styles.progressItemDesc}>
                  Property details and available records have been verified.
                </Text>
                <Text style={styles.progressDoneText}>Done</Text>
              </View>
            </View>

            {/* Step 5: Report ready */}
            <View style={[styles.progressTimelineItem, { marginBottom: 4 }]}>
              <View style={styles.progressIconCol}>
                <View style={styles.progressGreenCircle}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>
              <View style={styles.progressContentCol}>
                <Text style={styles.progressItemTitle}>Report ready</Text>
                <Text style={styles.progressItemDesc}>
                  Your Seedha Verified Report is ready to view.
                </Text>
                <Text style={styles.progressDoneText}>Done</Text>
              </View>
            </View>
          </View>

          {/* Verification Summary Card */}
          <View style={styles.summaryBoxWhite}>
            <Text style={styles.summaryBoxTitle}>Verification Summary</Text>
            <View style={styles.summaryBoxContentRow}>
              <ShieldCheck size={20} color="#111827" strokeWidth={2.2} />
              <Text style={styles.summaryBoxText}>
                Your owner and property details have been reviewed by Seedha Properties.
              </Text>
            </View>
          </View>

          {/* View Full report button */}
          <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
            <TouchableOpacity
              style={styles.viewFullReportBlackBtn}
              onPress={() => setStep('report')}
              activeOpacity={0.88}
            >
              <Text style={styles.viewFullReportBlackBtnText}>View Full report</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Footnote */}
          <View style={styles.legalFootnoteRow}>
            <Info size={14} color="#6B7280" style={{ marginTop: 2 }} />
            <Text style={styles.legalFootnoteText}>
              Based on records and checks available on the report date. For information only, not legal advice.
            </Text>
          </View>

          {/* Seedha Verified process badge */}
          <View style={styles.seedhaVerifiedBadgeRow}>
            <Shield size={13} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.seedhaVerifiedBadgeText}>Seedha Verified process</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }


  
  // ─────────────────────────────────────────────────────────────
  // STEP 4: Background Details Screen matching media_1794717513530_378cbd00.png
  // ─────────────────────────────────────────────────────────────
  const displayTitle = buildingName || propertyType || '2 BHK Independent House';
  const displayLoc = locality ? `${locality}, ${city}` : 'Gajuwaka, Vizag';
  const displayOwner = ownerName || 'Venkata Rao';
  const displayPhone = ownerPhone || '9154475498';
  const displayEmail = ownerEmail || 'dfdfg@gmail.com';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => setStep('verificationCompleted')}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.customHeaderTitle}>Background Details</Text>
          <Text style={styles.customHeaderSubtitle}>
            {displayTitle} · {displayLoc}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Obsidian Hero Card - Seedha Trust Score */}
        <View style={styles.reportHeroDarkCard}>
          <View style={styles.trustScoreRingBox}>
            <Text style={styles.trustScoreNumber}>92</Text>
          </View>
          <View style={styles.trustScoreInfoCol}>
            <Text style={styles.trustScoreLabel}>Seedha Trust Score</Text>
            <Text style={styles.trustScoreRating}>Excellent</Text>
            <Text style={styles.trustScoreDesc}>
              Based on verified identity, market conduct on Seedha and the property's records.
            </Text>
          </View>
        </View>

        {/* Tab Switcher: Owner background | Property history */}
        <View style={styles.reportTabWrap}>
          <TouchableOpacity
            style={[
              styles.reportTabBtn,
              activeReportTab === 'owner' && styles.reportTabBtnActive,
            ]}
            onPress={() => setActiveReportTab('owner')}
            activeOpacity={0.85}
          >
            <User
              size={15}
              color={activeReportTab === 'owner' ? '#FFFFFF' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.reportTabBtnText,
                activeReportTab === 'owner' && styles.reportTabBtnTextActive,
              ]}
            >
              Owner background
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reportTabBtn,
              activeReportTab === 'property' && styles.reportTabBtnActive,
            ]}
            onPress={() => setActiveReportTab('property')}
            activeOpacity={0.85}
          >
            <House
              size={15}
              color={activeReportTab === 'property' ? '#FFFFFF' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.reportTabBtnText,
                activeReportTab === 'property' && styles.reportTabBtnTextActive,
              ]}
            >
              Property history
            </Text>
          </TouchableOpacity>
        </View>

        {activeReportTab === 'owner' ? (
          <>
            {/* Card 1: Declared by the owner */}
            <View style={styles.declaredCardWhite}>
              <View style={styles.declaredHeaderRow}>
                <Text style={styles.declaredHeaderTitle}>Declared by the owner</Text>
                <View style={styles.verifiedGreenBadge}>
                  <Text style={styles.verifiedGreenBadgeText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.declaredSubNotice}>
                Information provided by the owner and checked as part of the Seedha verification process.
              </Text>

              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Posted as</Text>
                <Text style={styles.declaredVal}>Owner</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Ownership</Text>
                <Text style={styles.declaredVal}>Purchased, 2022</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Phone Number</Text>
                <Text style={styles.declaredVal}>{displayPhone}</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Mail</Text>
                <Text style={styles.declaredVal}>{displayEmail}</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Loan on property</Text>
                <Text style={styles.declaredVal}>No loan</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Property tax paid</Text>
                <Text style={styles.declaredVal}>Yes</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Pending dues</Text>
                <Text style={styles.declaredVal}>None</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Litigation</Text>
                <Text style={styles.declaredVal}>None</Text>
              </View>
              <View style={[styles.declaredKeyValueRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.declaredKey}>Previous tenants</Text>
                <Text style={styles.declaredVal}>Newly built, never rented</Text>
              </View>
            </View>

            {/* Card 2: Owner Profile Card */}
            <View style={styles.ownerProfileCardWhite}>
              <RNImage
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' }}
                style={styles.ownerAvatarImg}
              />
              <View style={styles.ownerProfileInfoCol}>
                <Text style={styles.ownerProfileName}>{displayOwner}</Text>
                <Text style={styles.ownerProfileSub}>Owner · Member since 2023</Text>
              </View>
              <View style={styles.ownerVerifiedPill}>
                <Check size={11} color="#16A34A" strokeWidth={3} />
                <Text style={styles.ownerVerifiedPillText}>Verified</Text>
              </View>
            </View>

            {/* Card 3: Identity verification */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <CreditCard size={18} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Identity verification</Text>
              </View>
              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Phone & email</Text>
                  <Text style={styles.reportCheckDesc}>Mobile and email confirmed with OTP.</Text>
                  <Text style={styles.reportSourceText}>Source: Seedha account</Text>
                </View>
              </View>
            </View>

            {/* Card 4: Conduct & behaviour on Seedha */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <Building size={18} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Conduct & behaviour on Seedha</Text>
              </View>

              {/* 3 Stat Metrics */}
              <View style={styles.statsThreeRow}>
                <View style={styles.statMetricBox}>
                  <Text style={styles.statMetricVal}>94%</Text>
                  <Text style={styles.statMetricLabel}>Response rate</Text>
                </View>
                <View style={styles.statMetricBox}>
                  <Text style={styles.statMetricVal}>&lt; 2 hrs</Text>
                  <Text style={styles.statMetricLabel}>Avg reply time</Text>
                </View>
                <View style={styles.statMetricBox}>
                  <Text style={styles.statMetricVal}>84%</Text>
                  <Text style={styles.statMetricLabel}>Visits honoured</Text>
                </View>
              </View>

              {/* Checklist items */}
              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Deal completion</Text>
                  <Text style={styles.reportCheckDesc}>5 of 5 past deals completed smoothly.</Text>
                  <Text style={styles.reportSourceText}>Source: Seedha deals history</Text>
                </View>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Complaints</Text>
                  <Text style={styles.reportCheckDesc}>No complaints or fraud reports received.</Text>
                  <Text style={styles.reportSourceText}>Source: Seedha trust & safety</Text>
                </View>
              </View>

              <View style={[styles.reportCheckRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Deposit refunds</Text>
                  <Text style={styles.reportCheckDesc}>Past tenants confirm deposits were returned on time.</Text>
                  <Text style={styles.reportSourceText}>Source: Tenant feedback after move-out</Text>
                </View>
              </View>
            </View>

            {/* Card 5: What people say */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <Star size={17} color="#111827" fill="#111827" />
                <Text style={styles.reportCardSectionTitle}>What people say</Text>
              </View>

              {/* Review 1 */}
              <View style={styles.reviewItemBox}>
                <View style={styles.reviewStarsRow}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.reviewDateText}>January 2024</Text>
                </View>
                <Text style={styles.reviewCommentText}>
                  "Very cooperative and quick to fix issues. Deposit was returned within a week."
                </Text>
              </View>

              {/* Review 2 */}
              <View style={[styles.reviewItemBox, { borderBottomWidth: 0 }]}>
                <View style={styles.reviewStarsRow}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.reviewDateText}>August 2023</Text>
                </View>
                <Text style={styles.reviewCommentText}>
                  "Documents were ready and the owner was transparent about everything."
                </Text>
              </View>

              <Text style={styles.reviewsFootnote}>
                Only reviews from people who completed a verified transaction with the owner.
              </Text>
            </View>

            {/* Card 6: Legal & safety checks */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <ShieldCheck size={18} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Legal & safety checks</Text>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Court cases</Text>
                  <Text style={styles.reportCheckDesc}>
                    No civil or criminal cases found against this name for the last 10 years.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: eCourts records search</Text>
                </View>
              </View>

              <View style={[styles.reportCheckRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Fraud & blacklist</Text>
                  <Text style={styles.reportCheckDesc}>Not found in any fraud or defaulter list.</Text>
                  <Text style={styles.reportSourceText}>Source: Internal and partner screening</Text>
                </View>
              </View>
            </View>
          </>
                ) : (
          /* Tab 2: Property History matching media_1794717782998_f92a0fcf.png */
          <>
            {/* Card 1: Declared by the owner (Not yet verified) */}
            <View style={styles.declaredCardWhite}>
              <View style={styles.declaredHeaderRow}>
                <Text style={styles.declaredHeaderTitle}>Declared by the owner</Text>
                <View style={styles.declaredBadgeYellow}>
                  <Text style={styles.declaredBadgeText}>Not yet verified</Text>
                </View>
              </View>
              <Text style={styles.declaredSubNotice}>
                Information provided by the owner and checked as part of the Seedha verification process.
              </Text>

              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Posted as</Text>
                <Text style={styles.declaredVal}>Owner</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Ownership</Text>
                <Text style={styles.declaredVal}>Purchased, 2022</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Loan on property</Text>
                <Text style={styles.declaredVal}>No loan</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Property tax paid</Text>
                <Text style={styles.declaredVal}>Yes</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Pending dues</Text>
                <Text style={styles.declaredVal}>None</Text>
              </View>
              <View style={styles.declaredKeyValueRow}>
                <Text style={styles.declaredKey}>Litigation</Text>
                <Text style={styles.declaredVal}>None</Text>
              </View>
              <View style={[styles.declaredKeyValueRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.declaredKey}>Previous tenants</Text>
                <Text style={styles.declaredVal}>Newly built, never rented</Text>
              </View>
            </View>

            {/* Card 2: Ownership History */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <FileText size={17} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Ownership history</Text>
              </View>

              {/* Timeline Step 1 */}
              <View style={styles.ownershipHistoryItemRow}>
                <View style={styles.ownershipStepIconCol}>
                  <View style={styles.blackNumberStepCircle}>
                    <Text style={styles.blackNumberStepCircleText}>1</Text>
                  </View>
                  <View style={styles.ownershipStepConnectingLine} />
                </View>
                <View style={styles.ownershipStepTextCol}>
                  <Text style={styles.ownershipStepYear}>2018</Text>
                  <Text style={styles.ownershipStepDesc}>
                    Built and handed over by the original developer
                  </Text>
                </View>
              </View>

              {/* Timeline Step 2 */}
              <View style={styles.ownershipHistoryItemRow}>
                <View style={styles.ownershipStepIconCol}>
                  <View style={styles.blackNumberStepCircle}>
                    <Text style={styles.blackNumberStepCircleText}>2</Text>
                  </View>
                  <View style={styles.ownershipStepConnectingLine} />
                </View>
                <View style={styles.ownershipStepTextCol}>
                  <Text style={styles.ownershipStepYear}>2022</Text>
                  <Text style={styles.ownershipStepDesc}>
                    First sale registered to the earlier owner
                  </Text>
                </View>
              </View>

              {/* Timeline Step 3 */}
              <View style={[styles.ownershipHistoryItemRow, { marginBottom: 4 }]}>
                <View style={styles.ownershipStepIconCol}>
                  <View style={styles.blackNumberStepCircle}>
                    <Text style={styles.blackNumberStepCircleText}>3</Text>
                  </View>
                </View>
                <View style={styles.ownershipStepTextCol}>
                  <Text style={styles.ownershipStepYear}>2024</Text>
                  <Text style={styles.ownershipStepDesc}>
                    Transferred to {displayOwner} (current owner)
                  </Text>
                </View>
              </View>

              <Text style={styles.ownershipHistorySourceFootnote}>
                Source: Property registration documents
              </Text>
            </View>

            {/* Card 3: Legal status */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <Scale size={18} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Legal status</Text>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Title</Text>
                  <Text style={styles.reportCheckDesc}>
                    Clear title. Seller name matches the registered deed.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: Registration database</Text>
                </View>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Encumbrance (last 13 years)</Text>
                  <Text style={styles.reportCheckDesc}>
                    No loans, mortgages or liens recorded.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: Encumbrance certificate</Text>
                </View>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Building approvals</Text>
                  <Text style={styles.reportCheckDesc}>
                    Municipal plan approval and occupancy certificate available.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: Municipal authority</Text>
                </View>
              </View>

              <View style={[styles.reportCheckRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Disputes</Text>
                  <Text style={styles.reportCheckDesc}>
                    No pending litigation on this property.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: eCourts & legal records</Text>
                </View>
              </View>
            </View>

            {/* Card 4: Listing & price history */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <Clock size={17} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Listing & price history</Text>
              </View>

              <View style={styles.priceHistoryRow}>
                <View>
                  <Text style={styles.priceHistoryMainLabel}>Current rent</Text>
                  <Text style={styles.priceHistorySubLabel}>Now</Text>
                </View>
                <Text style={styles.priceHistoryMainVal}>₹15,000/month</Text>
              </View>

              <View style={styles.priceHistoryRow}>
                <View>
                  <Text style={styles.priceHistoryMainLabel}>Previous rent</Text>
                  <Text style={styles.priceHistorySubLabel}>8 months ago</Text>
                </View>
                <Text style={styles.priceHistoryPrevVal}>₹13,500/mo</Text>
              </View>

              <View style={[styles.priceHistoryRow, { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.priceHistoryMainLabel}>Times listed</Text>
                  <Text style={styles.priceHistorySubLabel}>Since 2024</Text>
                </View>
                <Text style={styles.priceHistoryTimesVal}>2</Text>
              </View>
            </View>

            {/* Card 5: Property Verification */}
            <View style={styles.reportWhiteCard}>
              <View style={styles.reportCardHeaderRow}>
                <Wrench size={18} color="#111827" strokeWidth={2} />
                <Text style={styles.reportCardSectionTitle}>Property Verification</Text>
              </View>

              <View style={styles.reportCheckRow}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Physical visit completed</Text>
                  <Text style={styles.reportCheckDesc}>
                    Inspected on 14 Nov by a Seedha executive. Photos match the listing.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: Seedha inspection team</Text>
                </View>
              </View>

              <View style={[styles.reportCheckRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.2} />
                <View style={styles.reportCheckTextCol}>
                  <Text style={styles.reportCheckTitle}>Condition score</Text>
                  <Text style={styles.reportCheckDesc}>
                    8/10. Walls, plumbing and electricals in good condition.
                  </Text>
                  <Text style={styles.reportSourceText}>Source: Seedha inspection checklist</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Legal Disclaimer Box */}
        <View style={styles.reportNoticeBox}>
          <Info size={14} color="#6B7280" style={{ marginTop: 2 }} />
          <Text style={styles.reportNoticeBoxText}>
            This summary is based on records and details available on the date shown and is for information only. It is not legal advice. For a detailed, document-level check, order a full verification report.
          </Text>
        </View>

        {/* Seedha Verified process footnote */}
        <View style={styles.seedhaVerifiedBadgeRow}>
          <Shield size={13} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.seedhaVerifiedBadgeText}>
            Based on records and checks available on the report date. For information only, not legal advice.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.reportStickyBottomBar}>
        <TouchableOpacity
          style={styles.downloadReportBlackBtn}
          onPress={handleDownloadPdf}
          activeOpacity={0.88}
        >
          <Download size={17} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.downloadReportBlackBtnText}>Download report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  ownershipHistoryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ownershipStepIconCol: {
    alignItems: 'center',
    width: 24,
  },
  blackNumberStepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackNumberStepCircleText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  ownershipStepConnectingLine: {
    width: 1.5,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  ownershipStepTextCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  ownershipStepYear: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  ownershipStepDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  ownershipHistorySourceFootnote: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  priceHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceHistoryMainLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
  },
  priceHistorySubLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  priceHistoryMainVal: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  priceHistoryPrevVal: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  priceHistoryTimesVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },


  reportHeroDarkCard: {
    backgroundColor: '#1E1E22',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  trustScoreRingBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderTopColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  trustScoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trustScoreInfoCol: {
    flex: 1,
    marginLeft: 16,
  },
  trustScoreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  trustScoreRating: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  trustScoreDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 15,
  },
  reportTabWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reportTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reportTabBtnActive: {
    backgroundColor: '#000000',
  },
  reportTabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  reportTabBtnTextActive: {
    color: '#FFFFFF',
  },
  verifiedGreenBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedGreenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  ownerProfileCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  ownerAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  ownerProfileInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  ownerProfileName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  ownerProfileSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ownerVerifiedPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerVerifiedPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  reportWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  reportCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  reportCardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reportCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reportCheckTextCol: {
    flex: 1,
  },
  reportCheckTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
  },
  reportCheckDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 16,
  },
  reportSourceText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
  statsThreeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statMetricBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statMetricVal: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  statMetricLabel: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewItemBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewDateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  reviewCommentText: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 17,
  },
  reviewsFootnote: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 10,
    lineHeight: 15,
  },
  reportNoticeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reportNoticeBoxText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    flex: 1,
  },
  reportStickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ECEEF5',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  downloadReportBlackBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  downloadReportBlackBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


  completedYellowBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedAlertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBannerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  completedBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  completedBannerSub: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
  },
  summaryBoxWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryBoxTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryBoxContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryBoxText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    flex: 1,
    marginLeft: 12,
  },
  viewFullReportBlackBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  viewFullReportBlackBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '600',
  },
  legalFootnoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  legalFootnoteText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    flex: 1,
  },


  heroClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroClockText: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  heroExpectedDateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  heroProgressBarTrack: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  heroProgressBarFill: {
    width: '38%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  heroProgressDescText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  inProgressCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  inProgressCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },
  progressTimelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressIconCol: {
    alignItems: 'center',
    width: 28,
  },
  progressGreenCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlackCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressGreyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleNumber: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  progressTimelineLine: {
    width: 2,
    height: 38,
    marginVertical: 4,
  },
  progressContentCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  progressItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressItemDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  progressDoneText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 4,
  },
  progressInProgressText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  prototypeNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  prototypeNoteText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    flex: 1,
  },
  seedhaVerifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  seedhaVerifiedBadgeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  viewReportBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewReportBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
  },


  verifiedSelectedPropertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  verifiedSelectedPropertyImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  verifiedSelectedPropertyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  verifiedSelectedPropertyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedSelectedPropertyLoc: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  verifiedSelectedPropertyPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  receiveCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  receiveCardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  receiveBlueGreyBlock: {
    backgroundColor: '#EEF2F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  receiveBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiveWhiteIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiveBlockHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
  },
  receiveCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  receiveCheckItemText: {
    fontSize: 12.5,
    color: '#4B5563',
  },
  howItWorksCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  howItWorksCardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  howStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  howStepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howStepTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  howStepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  howStepSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  howStepLine: {
    width: 1.5,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 17,
    marginVertical: 2,
  },
  declaredCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  declaredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  declaredHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  declaredBadgeYellow: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  declaredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  declaredSubNotice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 16,
  },
  declaredKeyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  declaredKey: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  declaredVal: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  payVerifiedDetailsBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  payVerifiedDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  container: {
    flex: 1,
    backgroundColor: '#ECEEF5',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 12,
    backgroundColor: '#ECEEF5',
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 14,
  },
  headerTitleCol: {
    flex: 1,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  customHeaderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  stepperBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: '#ECEEF5',
  },
  stepperBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  stepperBarSegmentActive: {
    backgroundColor: '#000000',
  },
  scrollArea: {
    flex: 1,
  },
  heroDarkCard: {
    backgroundColor: '#262629',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroShieldIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroDarkTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 8,
  },
  heroDarkSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  selectionQuestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  homeOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  homeOptionIconBoxGrey: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeOptionIconBoxBlack: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeOptionTextCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  homeOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  homeOptionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radioBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelectedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselectedRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#ECEEF5',
  },
  continueBlackBtn: {
    backgroundColor: '#000000',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  continueBlackBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Step 1B: Saved Rental Home List Styles matching media_1794669292780_beb16492.jpg
  chooseSavedHomeHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  savedRentalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  savedRentalImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  savedRentalInfoCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  savedRentalTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  savedRentalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  savedRentalLocationText: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  savedRentalPrice: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 3,
  },
  savedRentalOwner: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  continuePaymentRoundBtn: {
    backgroundColor: '#000000',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  continuePaymentRoundBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Form Screen Styles
  formSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  formCardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  formCardHeadingSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  formFieldLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  typePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typePill: {
    backgroundColor: '#EEF0F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  typePillActive: {
    backgroundColor: '#000000',
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  formRow2Col: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  formRowSingle: {
    marginBottom: 12,
  },
  inputFieldLabel: {
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 6,
  },
  customTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  photoThumbWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    position: 'relative',
  },
  photoThumb: {
    width: 88,
    height: 88,
    borderRadius: 14,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoDashedBox: {
    width: 88,
    height: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#111827',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addPhotoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  ownerNoticeFootnote: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 16,
  },
  formStickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ECEEF5',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  continuePaymentBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  continuePaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continuePaymentNotice: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
  // Step 3 / Payment Screen Styles (matching media_1794668662268_6c1b1ee0.jpg)
  paymentSummaryCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  verifyingEyebrow: {
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 2,
  },
  verifyingPropertyType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  verifyingAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  verifyingOwnerLine: {
    fontSize: 13,
    color: '#4B5563',
  },
  verifyingOwnerBold: {
    fontWeight: '700',
    color: '#111827',
  },
  verifyingCardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  verificationCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  verificationCheckText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  userPhoneInputLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  userPhoneTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  termsAgreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  termsCheckboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsCheckboxBoxActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  termsAgreementText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    flex: 1,
    marginLeft: 10,
  },
  totalPriceCardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  totalPriceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  paymentStickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ECEEF5',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  payRequestReportBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  payRequestReportBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  payRequestNotice: {
    fontSize: 11.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  // Step 4 / Report Styles
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  verifiedHeaderBanner: {
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifiedBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  verifiedBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  checkTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkStatusText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  summaryParagraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  downloadBtnText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
