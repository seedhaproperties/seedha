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
  Image as RNImage,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Building,
  House,
  User,
  Phone,
  Check,
  Clock,
  Users,
  IndianRupee,
  Wrench,
  ClipboardList,
  ArrowRight,
  DoorOpen,
  Plus,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import colors from '../../theme/colors';

export default function PropertyManagementScreen() {
  const { pop, user } = useApp();

  const [viewMode, setViewMode] = useState<'overview' | 'propertyDetails' | 'ownerDetails' | 'chooseSupport' | 'reviewRequest'>('overview');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'tenant_mgmt',
    'rent_collection',
    'inspections',
    'vacancy',
  ]);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [ownerPincode, setOwnerPincode] = useState('');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '');
  const [selectedPropertyType, setSelectedPropertyType] = useState('Apartment');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [stateName, setStateName] = useState('Karnataka');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  const handleUploadPhoto = () => {
    if (photos.length >= 10) {
      Alert.alert('Limit Reached', 'You can upload up to 10 photos.');
      return;
    }
    const samplePhotos = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    ];
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.propertyManagement.submit({
        ownerName: ownerName || user?.name || 'Property Owner',
        ownerPhone: ownerPhone || user?.phone || '+91 9876543210',
        flatDetails: `${selectedPropertyType} in ${locality || 'Bangalore'}`,
        address: `${locality || 'Indiranagar'}, ${city || 'Bangalore'}, ${stateName || 'Karnataka'} - ${pincode || '560038'}`,
        city: city || 'Bangalore',
        locality: locality || 'Indiranagar',
        serviceRequested: `Full Property Care (${selectedPropertyType})`,
      });
      setSubmittedRequest(res.request);
    } catch {
      // Local fallback for smooth UI demo
      setSubmittedRequest({
        id: `pm-${Date.now()}`,
        ownerName: ownerName || user?.name || 'Property Owner',
        ownerPhone: ownerPhone || user?.phone || '+91 9876543210',
        flatDetails: `${selectedPropertyType} in ${locality || 'Bangalore'}`,
        address: `${locality || 'Indiranagar'}, ${city || 'Bangalore'}, ${stateName || 'Karnataka'} - ${pincode || '560038'}`,
        city: city || 'Bangalore',
        locality: locality || 'Indiranagar',
        serviceRequested: `Full Property Care (${selectedPropertyType})`,
        status: 'SUBMITTED',
        locationMatched: true,
      });
    } finally {
      setLoading(false);
    }
  };

    // ─────────────────────────────────────────────────────────────
  // SUCCESS / SUBMITTED SCREEN matching media_1794719970441_57f8587c.png
  // ─────────────────────────────────────────────────────────────
  if (submittedRequest) {
    const serviceCountText = `${selectedServices.length || 2} management services`;

    return (
      <SafeAreaView style={styles.successScreenContainer}>
        <View style={styles.successScreenContent}>
          {/* Green Checkmark Circle */}
          <View style={styles.successIconBadgeCircle}>
            <CheckCircle2 size={44} color="#16A34A" strokeWidth={2.4} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.successScreenTitle}>Management request received</Text>
          <Text style={styles.successScreenSubtitle}>
            Your dedicated property manager will call within two business hours to verify the property and share the plan.
          </Text>

          {/* Summary Card */}
          <View style={styles.successInfoCardWhite}>
            <View style={styles.successInfoCardRow}>
              <Text style={styles.successInfoCardLabel}>Request ID</Text>
              <Text style={styles.successInfoCardValue}>SPM-24018</Text>
            </View>

            <View style={styles.successInfoCardDivider} />

            <View style={styles.successInfoCardRow}>
              <Text style={styles.successInfoCardLabel}>Selected support</Text>
              <Text style={styles.successInfoCardValue}>{serviceCountText}</Text>
            </View>
          </View>

          {/* Bottom Back Button */}
          <TouchableOpacity
            style={styles.successBackBlackBtn}
            onPress={pop}
            activeOpacity={0.88}
          >
            <Text style={styles.successBackBlackBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. OVERVIEW SCREEN matching media_1794718885080_5e60b008.jpg
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'overview') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.pmCustomHeader}>
          <TouchableOpacity onPress={pop} style={styles.pmBackCircleBtn} activeOpacity={0.8}>
            <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.pmHeaderTitleCol}>
            <Text style={styles.pmCustomHeaderTitle}>Property Management</Text>
            <Text style={styles.pmCustomHeaderSubtitle}>Reliable care for your property</Text>
          </View>
        </View>

        <ScrollView
          style={styles.pmScrollArea}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Dark/Image Card */}
          <View style={styles.pmHeroCardContainer}>
            <RNImage
              source={{
                uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
              }}
              style={styles.pmHeroCardImage}
            />
            <View style={styles.pmHeroDarkOverlay} />
            <View style={styles.pmHeroContentWrap}>
              <View style={styles.pmHeroShieldBox}>
                <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.pmHeroMainTitle}>
                Your property.{'\n'}Professionally managed.
              </Text>
              <Text style={styles.pmHeroSubtitle}>
                One team for tenants, rent, maintenance and regular inspections.
              </Text>
            </View>
          </View>

          {/* Section Heading */}
          <Text style={styles.pmSectionHeading}>Everything handled for you</Text>

          {/* Card 1: Tenant Management */}
          <View style={styles.pmFeatureCard}>
            <View style={styles.pmFeatureIconBox}>
              <Users size={20} color="#111827" strokeWidth={2} />
            </View>
            <View style={styles.pmFeatureTextCol}>
              <Text style={styles.pmFeatureTitle}>Tenant Management</Text>
              <Text style={styles.pmFeatureSubtitle}>Screening, move-in and support</Text>
            </View>
          </View>

          {/* Card 2: Rent Collection */}
          <View style={styles.pmFeatureCard}>
            <View style={styles.pmFeatureIconBox}>
              <IndianRupee size={20} color="#111827" strokeWidth={2.2} />
            </View>
            <View style={styles.pmFeatureTextCol}>
              <Text style={styles.pmFeatureTitle}>Rent Collection</Text>
              <Text style={styles.pmFeatureSubtitle}>On-time rent and statements</Text>
            </View>
          </View>

          {/* Card 3: Maintenance */}
          <View style={styles.pmFeatureCard}>
            <View style={styles.pmFeatureIconBox}>
              <Wrench size={20} color="#111827" strokeWidth={2} />
            </View>
            <View style={styles.pmFeatureTextCol}>
              <Text style={styles.pmFeatureTitle}>Maintenance</Text>
              <Text style={styles.pmFeatureSubtitle}>Verified repair professionals</Text>
            </View>
          </View>

          {/* Card 4: Inspections & Vacancy */}
          <View style={styles.pmFeatureCard}>
            <View style={styles.pmFeatureIconBox}>
              <ClipboardList size={20} color="#111827" strokeWidth={2} />
            </View>
            <View style={styles.pmFeatureTextCol}>
              <Text style={styles.pmFeatureTitle}>Inspections & Vacancy</Text>
              <Text style={styles.pmFeatureSubtitle}>
                Periodic audits, damage reports,tenant sourcing
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.pmStickyBottomBar}>
          <TouchableOpacity
            style={styles.pmEntireDetailsBtn}
            onPress={() => setViewMode('propertyDetails')}
            activeOpacity={0.88}
          >
            <Text style={styles.pmEntireDetailsBtnText}>Entire Details</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PROPERTY DETAILS SCREEN matching media_1794718861399_c7dc4991.png
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'propertyDetails') {
    return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.pmCustomHeader}>
        <TouchableOpacity
          onPress={() => setViewMode('overview')}
          style={styles.pmBackCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.pmHeaderTitleCol}>
          <Text style={styles.pmCustomHeaderTitle}>Property Management</Text>
          <Text style={styles.pmCustomHeaderSubtitle}>Reliable care for your property</Text>
        </View>
      </View>

      <ScrollView
        style={styles.pmScrollArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Heading */}
        <Text style={styles.formMainHeading}>Tell us about your property</Text>
        <Text style={styles.formSubNotice}>
          This helps us prepare the right management plan.
        </Text>

        {/* Property Type Grid (2x2) */}
        <Text style={styles.fieldSectionLabel}>Property type</Text>
        <View style={styles.propertyTypeGrid}>
          {/* 1. Apartment */}
          <TouchableOpacity
            style={[
              styles.typeSelectCard,
              selectedPropertyType === 'Apartment' && styles.typeSelectCardActive,
            ]}
            onPress={() => setSelectedPropertyType('Apartment')}
            activeOpacity={0.8}
          >
            <House
              size={18}
              color={selectedPropertyType === 'Apartment' ? '#111827' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.typeSelectCardText,
                selectedPropertyType === 'Apartment' && styles.typeSelectCardTextActive,
              ]}
            >
              Apartment
            </Text>
          </TouchableOpacity>

          {/* 2. Villa */}
          <TouchableOpacity
            style={[
              styles.typeSelectCard,
              selectedPropertyType === 'Villa' && styles.typeSelectCardActive,
            ]}
            onPress={() => setSelectedPropertyType('Villa')}
            activeOpacity={0.8}
          >
            <House
              size={18}
              color={selectedPropertyType === 'Villa' ? '#111827' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.typeSelectCardText,
                selectedPropertyType === 'Villa' && styles.typeSelectCardTextActive,
              ]}
            >
              Villa
            </Text>
          </TouchableOpacity>

          {/* 3. Independent House */}
          <TouchableOpacity
            style={[
              styles.typeSelectCard,
              selectedPropertyType === 'Independent House' && styles.typeSelectCardActive,
            ]}
            onPress={() => setSelectedPropertyType('Independent House')}
            activeOpacity={0.8}
          >
            <House
              size={18}
              color={selectedPropertyType === 'Independent House' ? '#111827' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.typeSelectCardText,
                selectedPropertyType === 'Independent House' && styles.typeSelectCardTextActive,
              ]}
            >
              Independent House
            </Text>
          </TouchableOpacity>

          {/* 4. Commercial */}
          <TouchableOpacity
            style={[
              styles.typeSelectCard,
              selectedPropertyType === 'Commercial' && styles.typeSelectCardActive,
            ]}
            onPress={() => setSelectedPropertyType('Commercial')}
            activeOpacity={0.8}
          >
            <Building
              size={18}
              color={selectedPropertyType === 'Commercial' ? '#111827' : '#4B5563'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.typeSelectCardText,
                selectedPropertyType === 'Commercial' && styles.typeSelectCardTextActive,
              ]}
            >
              Commercial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Property Locality */}
        <Text style={styles.fieldSectionLabel}>Property Locality</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="Area or locality"
          placeholderTextColor="#9CA3AF"
          value={locality}
          onChangeText={setLocality}
        />

        {/* Pincode & City Row */}
        <View style={styles.rowTwoCols}>
          <View style={styles.colHalfLeft}>
            <Text style={styles.fieldSectionLabel}>Pincode</Text>
            <TextInput
              style={styles.whiteInputBox}
              placeholder="6 digits"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
          <View style={styles.colHalfRight}>
            <Text style={styles.fieldSectionLabel}>City</Text>
            <TextInput
              style={styles.whiteInputBox}
              placeholder="City"
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* State */}
        <Text style={styles.fieldSectionLabel}>State</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="State"
          placeholderTextColor="#9CA3AF"
          value={stateName}
          onChangeText={setStateName}
        />

        {/* Property Photos */}
        <View style={styles.photosHeaderRow}>
          <View>
            <Text style={styles.fieldSectionLabelNoMargin}>Property Photos</Text>
            <Text style={styles.photosSubHelpText}>
              Upload high-res interior & exterior images
            </Text>
          </View>
          <View style={styles.photosCountBadge}>
            <Text style={styles.photosCountBadgeText}>{photos.length}/10 added</Text>
          </View>
        </View>

        {/* Upload Dashed Container */}
        <TouchableOpacity
          style={styles.uploadPhotosDashedContainer}
          onPress={handleUploadPhoto}
          activeOpacity={0.78}
        >
          <View style={styles.uploadPlusCircleBtn}>
            <Plus size={22} color="#111827" strokeWidth={2.4} />
          </View>
          <Text style={styles.uploadPhotosBtnTitle}>Tap to upload photos</Text>
        </TouchableOpacity>

        {/* Uploaded Thumbnails Preview */}
        {photos.length > 0 && (
          <View style={styles.uploadedPhotosThumbRow}>
            {photos.map((uri, idx) => (
              <View key={idx} style={styles.uploadedThumbWrap}>
                <RNImage source={{ uri }} style={styles.uploadedThumbImg} />
                <TouchableOpacity
                  style={styles.uploadedThumbDeleteBtn}
                  onPress={() => handleRemovePhoto(idx)}
                  activeOpacity={0.8}
                >
                  <X size={12} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.pmStickyBottomBar}>
        <TouchableOpacity
          style={styles.formContinueBtn}
          onPress={() => setViewMode('ownerDetails')}
          activeOpacity={0.88}
        >
          <Text style={styles.formContinueBtnText}>Continue</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. OWNER DETAILS SCREEN matching media_1794719216048_d193d2f7.jpg
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'ownerDetails') {
    return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.pmCustomHeader}>
        <TouchableOpacity
          onPress={() => setViewMode('propertyDetails')}
          style={styles.pmBackCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.pmHeaderTitleCol}>
          <Text style={styles.pmCustomHeaderTitle}>Property Management</Text>
          <Text style={styles.pmCustomHeaderSubtitle}>Reliable care for your property</Text>
        </View>
      </View>

      <ScrollView
        style={styles.pmScrollArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Heading */}
        <Text style={styles.formMainHeading}>Tell us about your details</Text>
        <Text style={styles.formSubNotice}>This helps us to contact you</Text>

        {/* 1. Full name */}
        <Text style={styles.fieldSectionLabel}>Full name</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="As per ID proof"
          placeholderTextColor="#9CA3AF"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        {/* 2. Phone number */}
        <Text style={styles.fieldSectionLabel}>Phone number</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="+91 10-digit number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={15}
          value={ownerPhone}
          onChangeText={setOwnerPhone}
        />

        {/* 3. Email address */}
        <Text style={styles.fieldSectionLabel}>Email address</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="name@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={ownerEmail}
          onChangeText={setOwnerEmail}
        />

        {/* Yellow Notice Banner */}
        <View style={styles.ownerNoticeYellowBanner}>
          <Clock size={16} color="#92400E" strokeWidth={2} style={{ marginTop: 2 }} />
          <Text style={styles.ownerNoticeYellowText}>
            Agreement updates will be sent to this phone number and email.
          </Text>
        </View>

        {/* 4. Full permanent address */}
        <Text style={[styles.fieldSectionLabel, { marginTop: 4 }]}>Full permanent address</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="House no., street, area, city"
          placeholderTextColor="#9CA3AF"
          value={permanentAddress}
          onChangeText={setPermanentAddress}
        />

        {/* 5. PIN code */}
        <Text style={styles.fieldSectionLabel}>PIN code</Text>
        <TextInput
          style={styles.whiteInputBox}
          placeholder="6 digits"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={6}
          value={ownerPincode}
          onChangeText={setOwnerPincode}
        />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.pmStickyBottomBar}>
        <TouchableOpacity
          style={styles.formContinueBtn}
          onPress={() => setViewMode('chooseSupport')}
          activeOpacity={0.88}
        >
          <Text style={styles.formContinueBtnText}>Continue</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    );
  }

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. CHOOSE YOUR SUPPORT SCREEN matching media_1794719376507_01a04837.jpg
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'chooseSupport') {
    return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.pmCustomHeader}>
        <TouchableOpacity
          onPress={() => setViewMode('ownerDetails')}
          style={styles.pmBackCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.pmHeaderTitleCol}>
          <Text style={styles.pmCustomHeaderTitle}>Property Management</Text>
          <Text style={styles.pmCustomHeaderSubtitle}>Reliable care for your property</Text>
        </View>
      </View>

      <ScrollView
        style={styles.pmScrollArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Heading */}
        <Text style={styles.formMainHeading}>Choose your support</Text>
        <Text style={styles.formSubNotice}>
          Select only the services your property needs.
        </Text>

        {/* 1. Tenant Management */}
        <TouchableOpacity
          style={[
            styles.serviceChoiceCard,
            selectedServices.includes('tenant_mgmt') && styles.serviceChoiceCardActive,
          ]}
          onPress={() => toggleService('tenant_mgmt')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.serviceChoiceIconBox,
              selectedServices.includes('tenant_mgmt') && styles.serviceChoiceIconBoxActive,
            ]}
          >
            <Users
              size={20}
              color={selectedServices.includes('tenant_mgmt') ? '#FFFFFF' : '#111827'}
              strokeWidth={2}
            />
          </View>
          <View style={styles.serviceChoiceTextCol}>
            <Text style={styles.serviceChoiceTitle}>Tenant Management</Text>
            <Text style={styles.serviceChoiceSubtitle}>Screening, move-in and support</Text>
          </View>
          <CheckCircle2
            size={20}
            color={selectedServices.includes('tenant_mgmt') ? '#111827' : '#E5E7EB'}
            strokeWidth={selectedServices.includes('tenant_mgmt') ? 2.2 : 1.5}
          />
        </TouchableOpacity>

        {/* 2. Rent Collection */}
        <TouchableOpacity
          style={[
            styles.serviceChoiceCard,
            selectedServices.includes('rent_collection') && styles.serviceChoiceCardActive,
          ]}
          onPress={() => toggleService('rent_collection')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.serviceChoiceIconBox,
              selectedServices.includes('rent_collection') && styles.serviceChoiceIconBoxActive,
            ]}
          >
            <IndianRupee
              size={20}
              color={selectedServices.includes('rent_collection') ? '#FFFFFF' : '#111827'}
              strokeWidth={2.2}
            />
          </View>
          <View style={styles.serviceChoiceTextCol}>
            <Text style={styles.serviceChoiceTitle}>Rent Collection</Text>
            <Text style={styles.serviceChoiceSubtitle}>On-time rent and statements</Text>
          </View>
          <CheckCircle2
            size={20}
            color={selectedServices.includes('rent_collection') ? '#111827' : '#E5E7EB'}
            strokeWidth={selectedServices.includes('rent_collection') ? 2.2 : 1.5}
          />
        </TouchableOpacity>

        {/* 3. Maintenance */}
        <TouchableOpacity
          style={[
            styles.serviceChoiceCard,
            selectedServices.includes('maintenance') && styles.serviceChoiceCardActive,
          ]}
          onPress={() => toggleService('maintenance')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.serviceChoiceIconBox,
              selectedServices.includes('maintenance') && styles.serviceChoiceIconBoxActive,
            ]}
          >
            <Wrench
              size={20}
              color={selectedServices.includes('maintenance') ? '#FFFFFF' : '#111827'}
              strokeWidth={2}
            />
          </View>
          <View style={styles.serviceChoiceTextCol}>
            <Text style={styles.serviceChoiceTitle}>Maintenance</Text>
            <Text style={styles.serviceChoiceSubtitle}>Verified repair professionals</Text>
          </View>
          <CheckCircle2
            size={20}
            color={selectedServices.includes('maintenance') ? '#111827' : '#E5E7EB'}
            strokeWidth={selectedServices.includes('maintenance') ? 2.2 : 1.5}
          />
        </TouchableOpacity>

        {/* 4. Property Inspections */}
        <TouchableOpacity
          style={[
            styles.serviceChoiceCard,
            selectedServices.includes('inspections') && styles.serviceChoiceCardActive,
          ]}
          onPress={() => toggleService('inspections')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.serviceChoiceIconBox,
              selectedServices.includes('inspections') && styles.serviceChoiceIconBoxActive,
            ]}
          >
            <ClipboardList
              size={20}
              color={selectedServices.includes('inspections') ? '#FFFFFF' : '#111827'}
              strokeWidth={2}
            />
          </View>
          <View style={styles.serviceChoiceTextCol}>
            <Text style={styles.serviceChoiceTitle}>Property Inspections</Text>
            <Text style={styles.serviceChoiceSubtitle}>Scheduled condition reports</Text>
          </View>
          <CheckCircle2
            size={20}
            color={selectedServices.includes('inspections') ? '#111827' : '#E5E7EB'}
            strokeWidth={selectedServices.includes('inspections') ? 2.2 : 1.5}
          />
        </TouchableOpacity>

        {/* 5. Tenant & Vacancy Management */}
        <TouchableOpacity
          style={[
            styles.serviceChoiceCard,
            selectedServices.includes('vacancy') && styles.serviceChoiceCardActive,
          ]}
          onPress={() => toggleService('vacancy')}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.serviceChoiceIconBox,
              selectedServices.includes('vacancy') && styles.serviceChoiceIconBoxActive,
            ]}
          >
            <DoorOpen
              size={20}
              color={selectedServices.includes('vacancy') ? '#FFFFFF' : '#111827'}
              strokeWidth={2}
            />
          </View>
          <View style={styles.serviceChoiceTextCol}>
            <Text style={styles.serviceChoiceTitle}>Tenant & Vacancy Management</Text>
            <Text style={styles.serviceChoiceSubtitle}>
              Occupancy tracking & vacancy marketing
            </Text>
          </View>
          <CheckCircle2
            size={20}
            color={selectedServices.includes('vacancy') ? '#111827' : '#E5E7EB'}
            strokeWidth={selectedServices.includes('vacancy') ? 2.2 : 1.5}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.pmStickyBottomBar}>
        <TouchableOpacity
          style={styles.formContinueBtn}
          onPress={() => setViewMode('reviewRequest')}
          activeOpacity={0.88}
        >
          <Text style={styles.formContinueBtnText}>Continue</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


  // ─────────────────────────────────────────────────────────────
  // 5. REVIEW YOUR REQUEST SCREEN matching media_1794719625934_98800e83.jpg
  // ─────────────────────────────────────────────────────────────
  const displayPropertyType = selectedPropertyType === 'Commercial' ? 'Commercial property' : 'Residential property';
  const displayCity = city || 'Hyderabad';
  const displayServicesCount = `${selectedServices.length} selected`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.pmCustomHeader}>
        <TouchableOpacity
          onPress={() => setViewMode('chooseSupport')}
          style={styles.pmBackCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.pmHeaderTitleCol}>
          <Text style={styles.pmCustomHeaderTitle}>Property Management</Text>
          <Text style={styles.pmCustomHeaderSubtitle}>Reliable care for your property</Text>
        </View>
      </View>

      <ScrollView
        style={styles.pmScrollArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Heading */}
        <Text style={styles.formMainHeading}>Review your request</Text>
        <Text style={styles.formSubNotice}>
          A manager will confirm pricing after a quick property check.
        </Text>

        {/* White Card: Photo Grid Mosaic & Summary */}
        <View style={styles.reviewSummaryCard}>
          {/* Photo Mosaic */}
          <View style={styles.mosaicContainer}>
            {/* Big Left Image */}
            <View style={styles.mosaicLeftCol}>
              <RNImage
                source={{
                  uri: photos[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
                }}
                style={styles.mosaicBigImage}
              />
              <View style={styles.mosaicCountPill}>
                <Text style={styles.mosaicCountPillText}>1 / 4</Text>
              </View>
            </View>

            {/* Right 3 Stacked Images */}
            <View style={styles.mosaicRightCol}>
              <RNImage
                source={{
                  uri: photos[1] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
                }}
                style={styles.mosaicSmallImage}
              />
              <RNImage
                source={{
                  uri: photos[2] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
                }}
                style={styles.mosaicSmallImage}
              />
              <View style={styles.mosaicOverlayWrap}>
                <RNImage
                  source={{
                    uri: photos[3] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
                  }}
                  style={styles.mosaicSmallImage}
                />
                <View style={styles.mosaicDarkOverlay}>
                  <Text style={styles.mosaicOverlayText}>+1</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key-Value Summary Rows */}
          <View style={[styles.reviewRow, { marginTop: 14 }]}>
            <Text style={styles.reviewRowKey}>Property</Text>
            <Text style={styles.reviewRowVal}>{displayPropertyType}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewRowKey}>City</Text>
            <Text style={styles.reviewRowVal}>{displayCity}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewRowKey}>Services</Text>
            <Text style={styles.reviewRowVal}>{displayServicesCount}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.reviewRowKey}>Consultation</Text>
            <Text style={styles.reviewRowVal}>Free</Text>
          </View>
        </View>

        {/* Notice Card: No advance payment is required */}
        <View style={styles.reviewNoticeCard}>
          <ShieldCheck size={20} color="#111827" strokeWidth={2} />
          <Text style={styles.reviewNoticeText}>
            No advance payment is required. Your plan starts only after you approve the final scope.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.pmStickyBottomBar}>
        <TouchableOpacity
          style={styles.requestCallBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.requestCallBtnText}>Request a Call</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({

  successScreenContainer: {
    flex: 1,
    backgroundColor: '#ECEEF5',
    justifyContent: 'center',
  },
  successScreenContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIconBadgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successScreenTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successScreenSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  successInfoCardWhite: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  successInfoCardRow: {
    paddingVertical: 2,
  },
  successInfoCardLabel: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  successInfoCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  successInfoCardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  successBackBlackBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  successBackBlackBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


  reviewSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  mosaicContainer: {
    flexDirection: 'row',
    height: 180,
    gap: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mosaicLeftCol: {
    flex: 1.8,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  mosaicBigImage: {
    width: '100%',
    height: '100%',
  },
  mosaicCountPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mosaicCountPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  mosaicRightCol: {
    flex: 1,
    gap: 6,
  },
  mosaicSmallImage: {
    width: '100%',
    flex: 1,
    borderRadius: 10,
  },
  mosaicOverlayWrap: {
    flex: 1,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mosaicDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosaicOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewRowKey: {
    fontSize: 13.5,
    color: '#6B7280',
  },
  reviewRowVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewNoticeCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  reviewNoticeText: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    flex: 1,
  },
  requestCallBtn: {
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
  requestCallBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


  serviceChoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  serviceChoiceCardActive: {
    borderColor: '#111827',
  },
  serviceChoiceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceChoiceIconBoxActive: {
    backgroundColor: '#000000',
  },
  serviceChoiceTextCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  serviceChoiceTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  serviceChoiceSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },


  ownerNoticeYellowBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ownerNoticeYellowText: {
    fontSize: 12.5,
    color: '#92400E',
    lineHeight: 17,
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#ECEEF5',
  },
  pmCustomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: '#ECEEF5',
  },
  pmBackCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pmHeaderTitleCol: {
    marginLeft: 14,
  },
  pmCustomHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  pmCustomHeaderSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pmScrollArea: {
    flex: 1,
    backgroundColor: '#ECEEF5',
  },
  pmHeroCardContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  pmHeroCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  pmHeroDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 15, 25, 0.65)',
  },
  pmHeroContentWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  pmHeroShieldBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmHeroMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  pmHeroSubtitle: {
    fontSize: 12.5,
    color: '#D1D5DB',
    lineHeight: 17,
  },
  pmSectionHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  pmFeatureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  pmFeatureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmFeatureTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  pmFeatureTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  pmFeatureSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  pmStickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ECEEF5',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  pmEntireDetailsBtn: {
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
  pmEntireDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Form Screen Styles
  formMainHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  formSubNotice: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 18,
  },
  fieldSectionLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 14,
  },
  fieldSectionLabelNoMargin: {
    fontSize: 13,
    color: '#6B7280',
  },
  propertyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeSelectCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  typeSelectCardActive: {
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
  },
  typeSelectCardText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeSelectCardTextActive: {
    fontWeight: '700',
    color: '#111827',
  },
  whiteInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalfLeft: {
    flex: 1,
  },
  colHalfRight: {
    flex: 1,
  },
  photosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  photosSubHelpText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  photosCountBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  photosCountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  uploadPhotosDashedContainer: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlusCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPhotosBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  uploadedPhotosThumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  uploadedThumbWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedThumbImg: {
    width: '100%',
    height: '100%',
  },
  uploadedThumbDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContinueBtn: {
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
  formContinueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Success Workflow Styles
  successScroll: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusTimelineCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  timelineDotActive: {
    backgroundColor: '#16A34A',
  },
  timelineConnector: {
    width: 2,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginLeft: 10,
    marginVertical: 2,
  },
  timelineTextCol: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  timelineStepDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  returnHomeBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '600',
  },
});
