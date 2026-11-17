import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
  Share2,
  FileSignature,
  Building,
  Building2,
  Store,
  Briefcase,
  Factory,
  User,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  Printer,
  HelpCircle,
  FileText,
  House,
  Users,
  PenLine,
  Lock,
  Wallet,
  Calendar,
  BedDouble,
  Fan,
  Lightbulb,
  Sofa,
  Snowflake,
  Droplets,
  Flame,
  Armchair,
  Tv,
  Shirt,
  Package,
  Microwave,
  Smartphone,
  Banknote,
  Landmark,
  Receipt,
  Plus,
  Minus,
  Pencil,
  AlertCircle,
  X,
  Tag,
  MapPin,
  Truck,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

type Step = 'intro' | 'contract' | 'property' | 'parties' | 'role' | 'enterDetails' | 'preview' | 'pay' | 'order' | 'completed';

const PROPERTY_KINDS = [
  { id: 'apartment', name: 'Apartment/Flat', icon: Building2 },
  { id: 'house', name: 'Independent House', icon: House },
  { id: 'shop', name: 'Shop', icon: Store },
  { id: 'office', name: 'Office', icon: Briefcase },
  { id: 'godown', name: 'Godown', icon: Package },
  { id: 'shed', name: 'Land+Building/Shed', icon: Factory },
];

const FURNISHING_ITEMS = [
  { id: 'beds', name: 'Beds', icon: BedDouble },
  { id: 'fans', name: 'Fans', icon: Fan },
  { id: 'tubes', name: 'Tubes', icon: Lightbulb },
  { id: 'sofas', name: 'Sofas', icon: Sofa },
  { id: 'acs', name: 'ACs', icon: Snowflake },
  { id: 'elec_geysers', name: 'Electric Geysers', icon: Droplets },
  { id: 'gas_geysers', name: 'Gas Geysers', icon: Flame },
  { id: 'chairs', name: 'Chairs', icon: Armchair },
  { id: 'tables', name: 'Tables', icon: Tv },
  { id: 'washing_machines', name: 'Washing Machines', icon: Shirt },
  { id: 'curtains', name: 'Curtains', icon: Shirt },
  { id: 'bulbs', name: 'Bulbs', icon: Lightbulb },
  { id: 'cupboards', name: 'Cupboards', icon: Package },
  { id: 'microwave', name: 'Microwave', icon: Microwave },
  { id: 'water_purifier', name: 'Water Purifier', icon: Droplets },
];

interface PersonDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  age: string;
  gender: string; // 'M' | 'F' | 'Other'
  pan: string;
  aadhaar: string;
  isExpanded?: boolean;
}

export default function RentalAgreementScreen() {
  const { currentScreen, pop, setTab, addAdminRequest } = useApp();
  const initialStep = (currentScreen?.params?.step as Step) || 'intro';
  const [step, setStep] = useState<Step>(initialStep);
  const [userRole, setUserRole] = useState<'owner' | 'tenant'>('tenant');
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  // Step 1: Contract Details States
  const [propertyCity, setPropertyCity] = useState('Hyderabad');
  const [monthlyRentInput, setMonthlyRentInput] = useState('25,000');
  const [refundableDepositInput, setRefundableDepositInput] = useState('1,00,000');
  const [stampPaperAmount, setStampPaperAmount] = useState('100');
  const [rentIncludesMaintenance, setRentIncludesMaintenance] = useState(false);
  const [maintenancePaymentType, setMaintenancePaymentType] = useState<'actuals' | 'fixed'>('fixed');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [increaseRentToggle, setIncreaseRentToggle] = useState(true);
  const [rentIncreasePercentage, setRentIncreasePercentage] = useState('');
  const [depositPaymentModes, setDepositPaymentModes] = useState<string[]>(['upi']);
  const [agreementDurationMonths, setAgreementDurationMonths] = useState('11');
  const [startDateChoice, setStartDateChoice] = useState('28th November');
  const [customStartDate, setCustomStartDate] = useState('');
  const [lockInMonths, setLockInMonths] = useState('1');
  const [noticePeriodMonths, setNoticePeriodMonths] = useState('1');
  const [itemCounts, setItemCounts] = useState<{ [key: string]: number }>({ Fans: 2 });
  const [customItemName, setCustomItemName] = useState('');
  const [customItems, setCustomItems] = useState<string[]>([]);

  // Step 2: Property Details States
  const [propertyKind, setPropertyKind] = useState<'apartment' | 'house' | 'shop' | 'office' | 'godown' | 'shed'>('apartment');
  const [bhkType, setBhkType] = useState<string>('2 BHK');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [flatNumber, setFlatNumber] = useState<string>('');
  const [buildingName, setBuildingName] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [propertyCityName, setPropertyCityName] = useState<string>('Bangalore');
  const [propertyStateName, setPropertyStateName] = useState<string>('Karnataka');

  const handleToggleItem = (name: string) => {
    setItemCounts(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  };

  const handleDecrementItem = (name: string) => {
    setItemCounts(prev => {
      const current = prev[name] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: current - 1 };
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const item = customItemName.trim();
    if (!customItems.includes(item)) {
      setCustomItems(prev => [...prev, item]);
      setItemCounts(prev => ({ ...prev, [item]: 1 }));
    }
    setCustomItemName('');
  };

  const toggleDepositMode = (mode: string) => {
    if (depositPaymentModes.includes(mode)) {
      setDepositPaymentModes(depositPaymentModes.filter(m => m !== mode));
    } else {
      setDepositPaymentModes([...depositPaymentModes, mode]);
    }
  };

  // Form Details
  const [ownerName, setOwnerName] = useState('Rajeshwar Rao');
  const [ownerPhone, setOwnerPhone] = useState('+91 98490 12345');
  const [ownerEmail, setOwnerEmail] = useState('rajeshwar@email.com');
  const [ownerPan, setOwnerPan] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [tenantName, setTenantName] = useState('Rahul Sharma');
  const [tenantPhone, setTenantPhone] = useState('+91 98765 43210');
  const [tenantEmail, setTenantEmail] = useState('rahul@email.com');
  const [tenantAddress, setTenantAddress] = useState('H.No 12-4, Ameerpet, Hyderabad');
  const [tenantAadhaar, setTenantAadhaar] = useState('');
  // Step 3: Parties States matching user screenshot
  const [activePartyTab, setActivePartyTab] = useState<'landlord' | 'tenant'>('landlord');
  const [activeLandlordIndex, setActiveLandlordIndex] = useState(1); // Landlord 2 active matching screenshot
  const [activeTenantIndex, setActiveTenantIndex] = useState(0);

  const [landlords, setLandlords] = useState<PersonDetails[]>([
    {
      fullName: 'Rajeshwar Rao',
      phone: '9849012345',
      email: 'rajeshwar@email.com',
      address: 'H.No 4-50, Jubilee Hills, Hyderabad',
      pincode: '500033',
      age: '48',
      gender: 'M',
      pan: 'ABCDE1234F',
      aadhaar: '',
      isExpanded: true,
    },
    {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      pincode: '',
      age: '',
      gender: '',
      pan: '',
      aadhaar: '',
      isExpanded: true,
    },
  ]);

  const [tenants, setTenants] = useState<PersonDetails[]>([
    {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      pincode: '',
      age: '',
      gender: '',
      pan: '',
      aadhaar: '',
      isExpanded: true,
    },
  ]);

  const handleAddPerson = (type: 'landlord' | 'tenant') => {
    const newPerson: PersonDetails = {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      pincode: '',
      age: '',
      gender: '',
      pan: '',
      aadhaar: '',
      isExpanded: true,
    };
    if (type === 'landlord') {
      setLandlords(prev => [...prev, newPerson]);
      setActiveLandlordIndex(landlords.length);
    } else {
      setTenants(prev => [...prev, newPerson]);
      setActiveTenantIndex(tenants.length);
    }
  };

  const handleRemovePerson = (type: 'landlord' | 'tenant', index: number) => {
    if (type === 'landlord') {
      if (landlords.length <= 1) return;
      setLandlords(prev => prev.filter((_, i) => i !== index));
      setActiveLandlordIndex(Math.max(0, index - 1));
    } else {
      if (tenants.length <= 1) return;
      setTenants(prev => prev.filter((_, i) => i !== index));
      setActiveTenantIndex(Math.max(0, index - 1));
    }
  };

  const handleUpdatePerson = (
    type: 'landlord' | 'tenant',
    index: number,
    field: keyof PersonDetails,
    value: any
  ) => {
    if (type === 'landlord') {
      setLandlords(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        if (index === 0) {
          if (field === 'fullName') setOwnerName(value);
          if (field === 'phone') setOwnerPhone(value);
          if (field === 'email') setOwnerEmail(value);
          if (field === 'pan') setOwnerPan(value);
          if (field === 'address') setOwnerAddress(value);
        }
        return copy;
      });
    } else {
      setTenants(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        if (index === 0) {
          if (field === 'fullName') setTenantName(value);
          if (field === 'phone') setTenantPhone(value);
          if (field === 'email') setTenantEmail(value);
          if (field === 'address') setTenantAddress(value);
          if (field === 'aadhaar') setTenantAadhaar(value);
        }
        return copy;
      });
    }
  };

  const [propertyAddress, setPropertyAddress] = useState('Flat 402, Rainbow Vistas, HITEC City, Hyderabad');
  const [rentAmount, setRentAmount] = useState('32000');
  const [depositAmount, setDepositAmount] = useState('64000');
  const [durationMonths, setDurationMonths] = useState('11');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [extraCopy, setExtraCopy] = useState(false);
  const [notarisedAgreement, setNotarisedAgreement] = useState(false);
  const [eSignAgreement, setESignAgreement] = useState(false);
  const [deliverToParty, setDeliverToParty] = useState<'landlord' | 'tenant'>('landlord');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'next'>('standard');

  const handleStartAgreement = () => {
    setStep('enterDetails');
  };

  const handleProceedToPreview = () => {
    if (!ownerName.trim() || !tenantName.trim() || !propertyAddress.trim()) {
      alert('Please fill in Owner, Tenant, and Property Address details.');
      return;
    }
    setStep('preview');
  };

  const handleProceedToPayment = () => {
    setStep('pay');
  };

  const handlePay = () => {
    if (addAdminRequest) {
      addAdminRequest({
        category: 'rental_agreement',
        title: `Rental Agreement: ${tenantName} & ${ownerName}`,
        userName: userRole === 'tenant' ? tenantName : ownerName,
        userPhone: userRole === 'tenant' ? tenantPhone : ownerPhone,
        userEmail: 'rahul@email.com',
        location: propertyAddress,
        amount: `₹${parseInt(rentAmount || '32000').toLocaleString('en-IN')}/mo`,
        details: {
          role: userRole,
          tenantName,
          tenantPhone,
          ownerName,
          ownerPhone,
          propertyAddress,
          rentAmount: `₹${rentAmount || '32000'}`,
          depositAmount: `₹${depositAmount || '64000'}`,
          durationMonths: `${durationMonths} Months`,
          stampDutyPaid: '₹599 Paid',
        },
      });
    }

    setStep('completed');
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      alert('Rental Agreement PDF downloaded successfully with valid e-Stamp seal!');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {step !== 'completed' && (
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'intro') pop();
            else if (step === 'contract') setStep('intro');
            else if (step === 'property') setStep('contract');
            else if (step === 'parties') {
              if (activePartyTab === 'tenant') {
                setActivePartyTab('landlord');
              } else {
                setStep('property');
              }
            }
            else if (step === 'role') setStep('parties');
            else if (step === 'enterDetails') setStep('parties');
            else if (step === 'preview') setStep('parties');
            else if (step === 'pay') setStep('preview');
            else if (step === 'order') setStep('pay');
            else if (step === 'completed') setTab('home');
          }}
          style={styles.backCircle}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Rental Agreement</Text>
          {step === 'intro' && (
            <Text style={styles.headerSub}>Create and manage your agreement</Text>
          )}
          {step !== 'intro' && step !== 'contract' && step !== 'property' && step !== 'parties' && step !== 'preview' && step !== 'pay' && (
            <Text style={styles.headerSub}>
              {step === 'role'
                ? 'Select Owner / Tenant'
                : step === 'enterDetails'
                  ? 'Enter Agreement Details'
                  
                    
                      : step === 'order'
                        ? 'Placing Order...'
                        : 'Agreement Received'}
            </Text>
          )}
        </View>
        {step === 'intro' ? (
          <TouchableOpacity style={styles.helpCircle} activeOpacity={0.8}>
            <HelpCircle size={20} color="#6B7280" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>
      )}

      {/* 5-Step Stepper Bar for Contract, Property, Parties & Summary */}
      {(step === 'contract' || step === 'property' || step === 'parties' || step === 'preview' || step === 'pay') && (
        <View style={styles.contractStepperWrap}>
          {/* Step 1: Contract */}
          <TouchableOpacity
            style={styles.contractStepItem}
            onPress={() => setStep('contract')}
            activeOpacity={0.8}
          >
            {step === 'property' || step === 'parties' || step === 'preview' || step === 'pay' ? (
              <View style={styles.contractStepBadgeDone}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={styles.contractStepBadgeActive}>
                <Text style={styles.contractStepBadgeTextActive}>1</Text>
              </View>
            )}
            <Text style={step === 'contract' ? styles.contractStepLabelActive : styles.contractStepLabelInactive}>
              Contract
            </Text>
          </TouchableOpacity>

          <Text style={styles.contractStepDot}>·</Text>

          {/* Step 2: Property */}
          <TouchableOpacity
            style={styles.contractStepItem}
            onPress={() => setStep('property')}
            activeOpacity={0.8}
          >
            {step === 'parties' || step === 'preview' || step === 'pay' ? (
              <View style={styles.contractStepBadgeDone}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={step === 'property' ? styles.contractStepBadgeActive : styles.contractStepBadgeInactive}>
                <Text style={step === 'property' ? styles.contractStepBadgeTextActive : styles.contractStepBadgeTextInactive}>
                  2
                </Text>
              </View>
            )}
            <Text style={step === 'property' ? styles.contractStepLabelActive : styles.contractStepLabelInactive}>
              Property
            </Text>
          </TouchableOpacity>

          <Text style={styles.contractStepDot}>·</Text>

          {/* Step 3: Parties */}
          <TouchableOpacity
            style={styles.contractStepItem}
            onPress={() => setStep('parties')}
            activeOpacity={0.8}
          >
            {step === 'preview' || step === 'pay' ? (
              <View style={styles.contractStepBadgeDone}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={step === 'parties' ? styles.contractStepBadgeActive : styles.contractStepBadgeInactive}>
                <Text style={step === 'parties' ? styles.contractStepBadgeTextActive : styles.contractStepBadgeTextInactive}>
                  3
                </Text>
              </View>
            )}
            <Text style={step === 'parties' ? styles.contractStepLabelActive : styles.contractStepLabelInactive}>
              Parties
            </Text>
          </TouchableOpacity>

          <Text style={styles.contractStepDot}>·</Text>

          {/* Step 4: Summary */}
          <TouchableOpacity
            style={styles.contractStepItem}
            onPress={() => setStep('preview')}
            activeOpacity={0.8}
          >
            {step === 'pay' ? (
              <View style={styles.contractStepBadgeDone}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            ) : (
              <View style={step === 'preview' ? styles.contractStepBadgeActive : styles.contractStepBadgeInactive}>
                <Text style={step === 'preview' ? styles.contractStepBadgeTextActive : styles.contractStepBadgeTextInactive}>
                  4
                </Text>
              </View>
            )}
            <Text style={step === 'preview' ? styles.contractStepLabelActive : styles.contractStepLabelInactive}>
              Summary
            </Text>
          </TouchableOpacity>

          <Text style={styles.contractStepDot}>·</Text>

          {/* Step 5: Pay */}
          <TouchableOpacity
            style={styles.contractStepItem}
            onPress={() => setStep('pay')}
            activeOpacity={0.8}
          >
            <View style={step === 'pay' ? styles.contractStepBadgeActive : styles.contractStepBadgeInactive}>
              <Text style={step === 'pay' ? styles.contractStepBadgeTextActive : styles.contractStepBadgeTextInactive}>
                5
              </Text>
            </View>
            <Text style={step === 'pay' ? styles.contractStepLabelActive : styles.contractStepLabelInactive}>
              Pay
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={step === 'intro' ? styles.introScrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {/* Step: Intro Landing matching user image */}
        {step === 'intro' && (
          <View style={styles.introContent}>
            {/* Dark Hero Card */}
            <TouchableOpacity
              style={styles.introHeroCard}
              onPress={() => setStep('contract')}
              activeOpacity={0.92}
            >
              <View style={styles.heroCircleDecoration} />
              <View style={styles.heroIconBox}>
                <FileText size={22} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.introHeroTitle}>
                Create Your Rental{'\n'}Agreement Online
              </Text>
              <Text style={styles.introHeroDesc}>
                Enter the details, review your agreement and download the completed document—all in one place.
              </Text>
            </TouchableOpacity>

            {/* 3 Quick Stat Cards */}
            <View style={styles.introStatsRow}>
              <View style={styles.introStatCard}>
                <Clock size={19} color="#111827" strokeWidth={2.2} />
                <Text style={styles.introStatVal}>10 min</Text>
                <Text style={styles.introStatLabel}>Quick setup</Text>
              </View>
              <TouchableOpacity
                style={styles.introStatCard}
                onPress={() => setStep('contract')}
                activeOpacity={0.85}
              >
                <Text style={styles.introRupeeIcon}>₹</Text>
                <Text style={styles.introStatVal}>₹599</Text>
                <Text style={styles.introStatLabel}>Total cost</Text>
              </TouchableOpacity>
              <View style={styles.introStatCard}>
                <ShieldCheck size={20} color="#111827" strokeWidth={2.2} />
                <Text style={styles.introStatVal}>Secure</Text>
                <Text style={styles.introStatLabel}>Private data</Text>
              </View>
            </View>

            {/* How it works Section */}
            <View style={styles.howItWorksWrap}>
              <Text style={styles.howItWorksTitle}>How it works</Text>

              {/* Step 1: Contract details - Rent, dates and furnishing */}
              <TouchableOpacity
                style={styles.workStepCard}
                onPress={() => setStep('contract')}
                activeOpacity={0.85}
              >
                <View style={styles.stepIconWrap}>
                  <FileText size={20} color="#111827" strokeWidth={2} />
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>1</Text>
                  </View>
                </View>
                <View style={styles.stepInfoCol}>
                  <Text style={styles.stepTitle}>Contract details</Text>
                  <Text style={styles.stepDesc}>Rent, dates and furnishing</Text>
                </View>
              </TouchableOpacity>

              {/* Step 2 */}
              <TouchableOpacity
                style={styles.workStepCard}
                onPress={() => setStep('property')}
                activeOpacity={0.85}
              >
                <View style={styles.stepIconWrap}>
                  <House size={20} color="#111827" strokeWidth={2} />
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>2</Text>
                  </View>
                </View>
                <View style={styles.stepInfoCol}>
                  <Text style={styles.stepTitle}>Property details</Text>
                  <Text style={styles.stepDesc}>Property type, BHK and complete address</Text>
                </View>
              </TouchableOpacity>

              {/* Step 3 */}
              <TouchableOpacity
                style={styles.workStepCard}
                onPress={() => setStep('parties')}
                activeOpacity={0.85}
              >
                <View style={styles.stepIconWrap}>
                  <Users size={20} color="#111827" strokeWidth={2} />
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>3</Text>
                  </View>
                </View>
                <View style={styles.stepInfoCol}>
                  <Text style={styles.stepTitle}>Landlord and tenant</Text>
                  <Text style={styles.stepDesc}>Contact details of both parties</Text>
                </View>
              </TouchableOpacity>

              {/* Step 4 */}
              <TouchableOpacity
                style={styles.workStepCard}
                onPress={() => setStep('preview')}
                activeOpacity={0.85}
              >
                <View style={styles.stepIconWrap}>
                  <PenLine size={20} color="#111827" strokeWidth={2} />
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>4</Text>
                  </View>
                </View>
                <View style={styles.stepInfoCol}>
                  <Text style={styles.stepTitle}>Summary</Text>
                  <Text style={styles.stepDesc}>Review, add extras and pay</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Privacy Notice Banner */}
            <View style={styles.introPrivacyCard}>
              <Lock size={20} color="#92400E" strokeWidth={2} />
              <View style={styles.privacyTextCol}>
                <Text style={styles.privacyTitle}>Your information stays private.</Text>
                <Text style={styles.privacySub}>Details are used only to prepare the agreement.</Text>
              </View>
            </View>
          </View>
        )}

        {/* Step: Contract details (Matching user's uploaded page) */}
        {step === 'contract' && (
          <View style={styles.contractContentPadding}>
            {/* Card 1: Rent & deposit */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Wallet size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>Rent & deposit</Text>
                  <Text style={styles.cardSubtitle}>Money terms agreed by both parties</Text>
                </View>
              </View>

              {/* Property city */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Property city</Text>
                <TextInput
                  style={styles.contractInput}
                  value={propertyCity}
                  onChangeText={setPropertyCity}
                  placeholder="e.g. Hyderabad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Monthly rent & Refundable deposit */}
              <View style={styles.contractTwoCol}>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Monthly rent</Text>
                  <View style={styles.currencyInputWrap}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      value={monthlyRentInput}
                      onChangeText={setMonthlyRentInput}
                      placeholder="25,000"
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Refundable deposit</Text>
                  <View style={styles.currencyInputWrap}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      value={refundableDepositInput}
                      onChangeText={setRefundableDepositInput}
                      placeholder="1,00,000"
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              {/* Stamp paper amount */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Stamp paper amount</Text>
                <TouchableOpacity
                  style={[styles.stampPillBtn, stampPaperAmount === '100' && styles.stampPillBtnActive]}
                  onPress={() => setStampPaperAmount('100')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.stampPillText, stampPaperAmount === '100' && styles.stampPillTextActive]}>
                    ₹100
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Rent is including maintenance */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Rent is including maintenance</Text>
                <View style={styles.segmentedRow}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, rentIncludesMaintenance && styles.segmentBtnActive]}
                    onPress={() => setRentIncludesMaintenance(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentBtnText, rentIncludesMaintenance && styles.segmentBtnTextActive]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentBtn, !rentIncludesMaintenance && styles.segmentBtnActive]}
                    onPress={() => setRentIncludesMaintenance(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentBtnText, !rentIncludesMaintenance && styles.segmentBtnTextActive]}>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sub-card: How will maintenance be paid? (when No is selected) */}
              {!rentIncludesMaintenance && (
                <View style={styles.subCardBox}>
                  <Text style={styles.subCardQuestion}>How will maintenance be paid?</Text>
                  <View style={styles.radioCardsRow}>
                    <TouchableOpacity
                      style={[
                        styles.radioCard,
                        maintenancePaymentType === 'actuals' && styles.radioCardSelected,
                      ]}
                      onPress={() => setMaintenancePaymentType('actuals')}
                      activeOpacity={0.85}
                    >
                      <View style={styles.radioCardTop}>
                        <Text style={styles.radioCardTitle}>As per actuals</Text>
                        <View style={[styles.radioOuter, maintenancePaymentType === 'actuals' && styles.radioOuterSelected]}>
                          {maintenancePaymentType === 'actuals' && <View style={styles.radioInner} />}
                        </View>
                      </View>
                      <Text style={styles.radioCardSub}>
                        the tenant pays maintenance as billed by the society
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.radioCard,
                        maintenancePaymentType === 'fixed' && styles.radioCardSelected,
                      ]}
                      onPress={() => setMaintenancePaymentType('fixed')}
                      activeOpacity={0.85}
                    >
                      <View style={styles.radioCardTop}>
                        <Text style={styles.radioCardTitle}>Fixed amount</Text>
                        <View style={[styles.radioOuter, maintenancePaymentType === 'fixed' && styles.radioOuterSelected]}>
                          {maintenancePaymentType === 'fixed' ? (
                            <View style={styles.radioCheckCircle}>
                              <Check size={11} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <Text style={styles.radioCardSub}>
                        specify a fixed maintenance amount and frequency
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Fixed Maintenance Amount & Pay Frequency */}
                  {maintenancePaymentType === 'fixed' && (
                    <View style={styles.fixedMaintenanceRow}>
                      <View style={styles.colHalf}>
                        <Text style={styles.contractFieldLabel}>Maintenance amount</Text>
                        <View style={styles.currencyInputWrap}>
                          <Text style={styles.currencySymbol}>₹</Text>
                          <TextInput
                            style={styles.currencyInput}
                            value={maintenanceAmount}
                            onChangeText={setMaintenanceAmount}
                            placeholder="Amount"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      </View>

                      <View style={styles.colHalf}>
                        <Text style={styles.contractFieldLabel}>Pay frequency</Text>
                        <TouchableOpacity
                          style={styles.selectDropdownBtn}
                          onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.selectDropdownText, !maintenanceFrequency && styles.selectDropdownPlaceholder]}>
                            {maintenanceFrequency || 'Select'}
                          </Text>
                          <ChevronDown size={18} color="#6B7280" />
                        </TouchableOpacity>
                        {showFrequencyDropdown && (
                          <View style={styles.dropdownMenu}>
                            {['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].map(freq => (
                              <TouchableOpacity
                                key={freq}
                                style={styles.dropdownMenuItem}
                                onPress={() => {
                                  setMaintenanceFrequency(freq);
                                  setShowFrequencyDropdown(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownMenuItemText,
                                    maintenanceFrequency === freq && styles.dropdownMenuItemTextActive,
                                  ]}
                                >
                                  {freq}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Increase rent toggle */}
              <View style={styles.toggleCardRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Increase rent</Text>
                  <Text style={styles.toggleSub}>e.g. increase rent after 11 months</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitchTrack,
                    increaseRentToggle ? styles.toggleSwitchTrackOn : styles.toggleSwitchTrackOff,
                  ]}
                  onPress={() => setIncreaseRentToggle(!increaseRentToggle)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.toggleSwitchThumb,
                      increaseRentToggle ? styles.toggleSwitchThumbOn : styles.toggleSwitchThumbOff,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Increase in percentage when toggle is ON */}
              {increaseRentToggle && (
                <View style={styles.increaseRentField}>
                  <Text style={styles.contractFieldLabel}>Increase in percentage</Text>
                  <TextInput
                    style={styles.contractInput}
                    value={rentIncreasePercentage}
                    onChangeText={setRentIncreasePercentage}
                    placeholder="eg: 15%"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              {/* How will the deposit be paid? */}
              <View style={styles.contractField}>
                <Text style={styles.contractDepositTitle}>How will the deposit be paid?</Text>
                <Text style={styles.contractDepositSub}>Choose all that apply</Text>
                <View style={styles.depositGrid}>
                  <TouchableOpacity
                    style={[
                      styles.depositOptionCard,
                      depositPaymentModes.includes('upi') && styles.depositOptionCardActive,
                    ]}
                    onPress={() => toggleDepositMode('upi')}
                    activeOpacity={0.85}
                  >
                    <Smartphone size={18} color="#111827" />
                    <Text style={styles.depositOptionText}>UPI</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.depositOptionCard,
                      depositPaymentModes.includes('cash') && styles.depositOptionCardActive,
                    ]}
                    onPress={() => toggleDepositMode('cash')}
                    activeOpacity={0.85}
                  >
                    <Banknote size={18} color="#111827" />
                    <Text style={styles.depositOptionText}>Cash</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.depositOptionCard,
                      depositPaymentModes.includes('internet_banking') && styles.depositOptionCardActive,
                    ]}
                    onPress={() => toggleDepositMode('internet_banking')}
                    activeOpacity={0.85}
                  >
                    <Landmark size={18} color="#111827" />
                    <Text style={styles.depositOptionText}>Internet banking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.depositOptionCard,
                      depositPaymentModes.includes('demand_draft') && styles.depositOptionCardActive,
                    ]}
                    onPress={() => toggleDepositMode('demand_draft')}
                    activeOpacity={0.85}
                  >
                    <Receipt size={18} color="#111827" />
                    <Text style={styles.depositOptionText}>Demand Draft</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card 2: Duration & dates */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Calendar size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>Duration & dates</Text>
                  <Text style={styles.cardSubtitle}>When the agreement starts and how it renews</Text>
                </View>
              </View>

              {/* Agreement duration */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Agreement duration</Text>
                <View style={styles.segmentedRow}>
                  {['6', '11', 'Other'].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.segmentBtn,
                        agreementDurationMonths === duration && styles.segmentBtnActive,
                      ]}
                      onPress={() => setAgreementDurationMonths(duration)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          agreementDurationMonths === duration && styles.segmentBtnTextActive,
                        ]}
                      >
                        {duration}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.durationHelperText}>{agreementDurationMonths} months</Text>
              </View>

              {/* Start date */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Start date</Text>
                <View style={styles.segmentedRow}>
                  {['28th November', '1st December'].map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.segmentBtn,
                        startDateChoice === d && styles.segmentBtnActive,
                      ]}
                      onPress={() => setStartDateChoice(d)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          startDateChoice === d && styles.segmentBtnTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.contractInput, { marginTop: 10 }]}
                  placeholder="Or enter specific date (DD/MM/YYYY)"
                  value={customStartDate}
                  onChangeText={setCustomStartDate}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Minimum lock-in & Notice period */}
              <View style={styles.contractTwoCol}>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Minimum lock-in</Text>
                  <Text style={styles.unitSubText}>months</Text>
                  <View style={styles.miniPillsRow}>
                    {['0', '1', 'Other'].map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.miniPill,
                          lockInMonths === opt && styles.miniPillActive,
                        ]}
                        onPress={() => setLockInMonths(opt)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.miniPillText,
                            lockInMonths === opt && styles.miniPillTextActive,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Notice period</Text>
                  <Text style={styles.unitSubText}>months</Text>
                  <View style={styles.miniPillsRow}>
                    {['0', '1', '2', '3'].map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.miniPill,
                          noticePeriodMonths === opt && styles.miniPillActive,
                        ]}
                        onPress={() => setNoticePeriodMonths(opt)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.miniPillText,
                            noticePeriodMonths === opt && styles.miniPillTextActive,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Card 3: What is included */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Armchair size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>What is included</Text>
                  <Text style={styles.cardSubtitle}>Furnishing items provided</Text>
                </View>
              </View>

              {/* 3-Column Grid */}
              <View style={styles.furnishingGrid}>
                {FURNISHING_ITEMS.map(item => {
                  const count = itemCounts[item.name] || 0;
                  const IconComp = item.icon;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.furnishGridCard,
                        count > 0 && styles.furnishGridCardSelected,
                      ]}
                    >
                      <IconComp size={22} color="#111827" strokeWidth={1.8} />
                      <Text style={styles.furnishCardTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {count === 0 ? (
                        <TouchableOpacity
                          style={styles.furnishAddBtn}
                          onPress={() => handleToggleItem(item.name)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.furnishAddText}>+ Add</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.furnishCounterRow}>
                          <TouchableOpacity
                            onPress={() => handleDecrementItem(item.name)}
                            style={styles.furnishCountBtn}
                            activeOpacity={0.7}
                          >
                            <Minus size={12} color="#111827" />
                          </TouchableOpacity>
                          <Text style={styles.furnishCountValue}>{count}</Text>
                          <TouchableOpacity
                            onPress={() => handleToggleItem(item.name)}
                            style={styles.furnishCountBtn}
                            activeOpacity={0.7}
                          >
                            <Plus size={12} color="#111827" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Custom items added by user */}
                {customItems.map(name => {
                  const count = itemCounts[name] || 1;
                  return (
                    <View
                      key={name}
                      style={[styles.furnishGridCard, styles.furnishGridCardSelected]}
                    >
                      <Package size={22} color="#111827" strokeWidth={1.8} />
                      <Text style={styles.furnishCardTitle} numberOfLines={2}>
                        {name}
                      </Text>
                      <View style={styles.furnishCounterRow}>
                        <TouchableOpacity
                          onPress={() => handleDecrementItem(name)}
                          style={styles.furnishCountBtn}
                          activeOpacity={0.7}
                        >
                          <Minus size={12} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.furnishCountValue}>{count}</Text>
                        <TouchableOpacity
                          onPress={() => handleToggleItem(name)}
                          style={styles.furnishCountBtn}
                          activeOpacity={0.7}
                        >
                          <Plus size={12} color="#111827" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Anything else? */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Anything else?</Text>
                <View style={styles.addCustomItemRow}>
                  <TextInput
                    style={styles.addCustomItemInput}
                    placeholder="Type an item name"
                    value={customItemName}
                    onChangeText={setCustomItemName}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={styles.addCustomItemBtn}
                    onPress={handleAddCustomItem}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addCustomItemBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Added items tags list */}
                {Object.entries(itemCounts).filter(([_, count]) => count > 0).length > 0 && (
                  <View style={styles.selectedItemsTagsRow}>
                    {Object.entries(itemCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([name, count]) => (
                        <View key={name} style={styles.selectedItemPill}>
                          <Text style={styles.selectedItemPillText}>
                            {count} x {name}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Property Details (Matching media_1794637482249_c8ad795e.png) */}
        {step === 'property' && (
          <View style={styles.contractContentPadding}>
            {/* Card 1: What kind of property? */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Building2 size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>What kind of property?</Text>
                  <Text style={styles.cardSubtitle}>Choose the property type</Text>
                </View>
              </View>

              {/* 6 Property Type Cards */}
              <View style={styles.propertyTypeGrid}>
                {PROPERTY_KINDS.map(item => {
                  const isSelected = propertyKind === item.id;
                  const IconComp = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.propertyTypeCard,
                        isSelected && styles.propertyTypeCardSelected,
                      ]}
                      onPress={() => setPropertyKind(item.id as any)}
                      activeOpacity={0.85}
                    >
                      <IconComp
                        size={22}
                        color={isSelected ? '#FFFFFF' : '#111827'}
                        strokeWidth={1.8}
                      />
                      <Text
                        style={[
                          styles.propertyTypeCardText,
                          isSelected && styles.propertyTypeCardTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* BHK type */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>BHK type</Text>
                <View style={styles.bhkWrap}>
                  {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Other'].map(type => {
                    const isSelected = bhkType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.bhkPill,
                          isSelected && styles.bhkPillSelected,
                        ]}
                        onPress={() => setBhkType(type)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.bhkPillText,
                            isSelected && styles.bhkPillTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Card 2: Unit details */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <House size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>Unit details</Text>
                  <Text style={styles.cardSubtitle}>Where inside the building</Text>
                </View>
              </View>

              {/* Floor & Flat number */}
              <View style={styles.contractTwoCol}>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Floor</Text>
                  <TextInput
                    style={styles.contractInput}
                    value={floorNumber}
                    onChangeText={setFloorNumber}
                    placeholder="e.g. 4"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Flat number</Text>
                  <TextInput
                    style={styles.contractInput}
                    value={flatNumber}
                    onChangeText={setFlatNumber}
                    placeholder="e.g. 402"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Building name */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Building name</Text>
                <TextInput
                  style={styles.contractInput}
                  value={buildingName}
                  onChangeText={setBuildingName}
                  placeholder="Building or society name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Card 3: Address */}
            <View style={styles.contractCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Building size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardMainTitle}>Address</Text>
                  <Text style={styles.cardSubtitle}>Used in the agreement document</Text>
                </View>
              </View>

              {/* Locality */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>Locality</Text>
                <TextInput
                  style={styles.contractInput}
                  value={locality}
                  onChangeText={setLocality}
                  placeholder="Area or locality"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Pincode & City */}
              <View style={styles.contractTwoCol}>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>Pincode</Text>
                  <TextInput
                    style={styles.contractInput}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="6 digits"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.colHalf}>
                  <Text style={styles.contractFieldLabel}>City</Text>
                  <TextInput
                    style={styles.contractInput}
                    value={propertyCityName}
                    onChangeText={setPropertyCityName}
                    placeholder="City"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* State */}
              <View style={styles.contractField}>
                <Text style={styles.contractFieldLabel}>State</Text>
                <TextInput
                  style={styles.contractInput}
                  value={propertyStateName}
                  onChangeText={setPropertyStateName}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Address preview */}
              <View style={styles.addressPreviewBox}>
                <Text style={styles.addressPreviewLabel}>Address preview</Text>
                <Text style={styles.addressPreviewText}>
                  {[buildingName, locality, propertyCityName, propertyStateName].filter(Boolean).join(', ') ||
                    'Bangalore, Karnataka'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Parties (Landlord & Tenant Details Matching media_1794639492928_b8797c38.png) */}
        {step === 'parties' && (() => {
          const isLandlord = activePartyTab === 'landlord';
          const currentList = isLandlord ? landlords : tenants;
          const currentIndex = isLandlord ? activeLandlordIndex : activeTenantIndex;
          const person = currentList[currentIndex] || currentList[0];
          const personNumber = currentIndex + 1;
          const roleLabel = isLandlord ? 'Landlord' : 'Tenant';

          return (
            <View style={styles.contractContentPadding}>
              {/* Landlord / Tenant Segmented Tab Capsule */}
              <View style={styles.partyTabContainer}>
                {/* Landlord Tab */}
                <TouchableOpacity
                  style={[
                    styles.partyTab,
                    isLandlord && styles.partyTabActive,
                  ]}
                  onPress={() => setActivePartyTab('landlord')}
                  activeOpacity={0.85}
                >
                  <House
                    size={18}
                    color={isLandlord ? '#FFFFFF' : '#6B7280'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.partyTabText,
                      isLandlord && styles.partyTabTextActive,
                    ]}
                  >
                    Landlord
                  </Text>
                  <View
                    style={[
                      styles.partyBadge,
                      isLandlord && styles.partyBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.partyBadgeText,
                        isLandlord && styles.partyBadgeTextActive,
                      ]}
                    >
                      {landlords.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Tenant Tab */}
                <TouchableOpacity
                  style={[
                    styles.partyTab,
                    !isLandlord && styles.partyTabActive,
                  ]}
                  onPress={() => {
                    setActivePartyTab('tenant');
                    setActiveTenantIndex(0);
                  }}
                  activeOpacity={0.85}
                >
                  <Users
                    size={18}
                    color={!isLandlord ? '#FFFFFF' : '#6B7280'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.partyTabText,
                      !isLandlord && styles.partyTabTextActive,
                    ]}
                  >
                    Tenant
                  </Text>
                  <View
                    style={[
                      styles.partyBadge,
                      !isLandlord && styles.partyBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.partyBadgeText,
                        !isLandlord && styles.partyBadgeTextActive,
                      ]}
                    >
                      {tenants.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Sub-pills Row (e.g. 1 Landlord 1, 2 Landlord 2, + Add Landlord) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partySubPillsScroll}
              >
                {currentList.map((p, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.partySubPill,
                        isSelected && styles.partySubPillActive,
                      ]}
                      onPress={() => {
                        if (isLandlord) setActiveLandlordIndex(idx);
                        else setActiveTenantIndex(idx);
                      }}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.partySubPillBadge,
                          isSelected && styles.partySubPillBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.partySubPillBadgeText,
                            isSelected && styles.partySubPillBadgeTextActive,
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.partySubPillText,
                          isSelected && styles.partySubPillTextActive,
                        ]}
                      >
                        {roleLabel} {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* + Add Landlord / Tenant Button */}
                <TouchableOpacity
                  style={styles.partyAddPill}
                  onPress={() => handleAddPerson(isLandlord ? 'landlord' : 'tenant')}
                  activeOpacity={0.85}
                >
                  <Plus size={14} color="#111827" strokeWidth={2.5} />
                  <Text style={styles.partyAddPillText}>Add {roleLabel}</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Form Card for the Selected Person */}
              <View style={styles.partyCard}>
                {/* Header: "Landlord 2 details" & "Remove" */}
                <View style={styles.partyCardHeader}>
                  <Text style={styles.partyCardTitle}>
                    {roleLabel} {personNumber} details
                  </Text>
                  {currentList.length > 1 && (
                    <TouchableOpacity
                      onPress={() =>
                        handleRemovePerson(isLandlord ? 'landlord' : 'tenant', currentIndex)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.partyRemoveText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Full name */}
                <View style={styles.partyField}>
                  <Text style={styles.partyFieldLabel}>Full name</Text>
                  <TextInput
                    style={styles.partyInput}
                    placeholder="As per ID proof"
                    placeholderTextColor="#9CA3AF"
                    value={person?.fullName || ''}
                    onChangeText={val =>
                      handleUpdatePerson(
                        isLandlord ? 'landlord' : 'tenant',
                        currentIndex,
                        'fullName',
                        val
                      )
                    }
                  />
                </View>

                {/* Phone number with +91 prefix */}
                <View style={styles.partyField}>
                  <Text style={styles.partyFieldLabel}>Phone number</Text>
                  <View style={styles.phoneInputWrap}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="10-digit number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={person?.phone || ''}
                      onChangeText={val =>
                        handleUpdatePerson(
                          isLandlord ? 'landlord' : 'tenant',
                          currentIndex,
                          'phone',
                          val
                        )
                      }
                    />
                  </View>
                </View>

                {/* Email address */}
                <View style={styles.partyField}>
                  <Text style={styles.partyFieldLabel}>Email address</Text>
                  <TextInput
                    style={styles.partyInput}
                    placeholder="name@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={person?.email || ''}
                    onChangeText={val =>
                      handleUpdatePerson(
                        isLandlord ? 'landlord' : 'tenant',
                        currentIndex,
                        'email',
                        val
                      )
                    }
                  />
                </View>

                {/* Yellow Callout Banner */}
                <View style={styles.partyCallout}>
                  <Clock size={16} color="#92400E" strokeWidth={2} />
                  <Text style={styles.partyCalloutText}>
                    Agreement updates will be sent to this phone number and email.
                  </Text>
                </View>

                {/* Full permanent address */}
                <View style={styles.partyField}>
                  <Text style={styles.partyFieldLabel}>Full permanent address</Text>
                  <TextInput
                    style={styles.partyInput}
                    placeholder="House no., street, area, city"
                    placeholderTextColor="#9CA3AF"
                    value={person?.address || ''}
                    onChangeText={val =>
                      handleUpdatePerson(
                        isLandlord ? 'landlord' : 'tenant',
                        currentIndex,
                        'address',
                        val
                      )
                    }
                  />
                </View>

                {/* PIN code */}
                <View style={styles.partyField}>
                  <Text style={styles.partyFieldLabel}>PIN code</Text>
                  <TextInput
                    style={styles.partyInput}
                    placeholder="6 digits"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={6}
                    value={person?.pincode || ''}
                    onChangeText={val =>
                      handleUpdatePerson(
                        isLandlord ? 'landlord' : 'tenant',
                        currentIndex,
                        'pincode',
                        val
                      )
                    }
                  />
                </View>

                {/* Accordion: "More about this landlord" */}
                <TouchableOpacity
                  style={styles.partyAccordionHeader}
                  onPress={() =>
                    handleUpdatePerson(
                      isLandlord ? 'landlord' : 'tenant',
                      currentIndex,
                      'isExpanded',
                      !person?.isExpanded
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.partyAccordionTitle}>
                    More about this {roleLabel.toLowerCase()}
                  </Text>
                  {person?.isExpanded ? (
                    <ChevronUp size={18} color="#475569" strokeWidth={2} />
                  ) : (
                    <ChevronDown size={18} color="#475569" strokeWidth={2} />
                  )}
                </TouchableOpacity>

                {/* Accordion Body */}
                {person?.isExpanded && (
                  <View style={styles.partyAccordionBody}>
                    {/* Age and Gender in a two-column row */}
                    <View style={styles.partyTwoCol}>
                      {/* Age */}
                      <View style={styles.colAge}>
                        <Text style={styles.partyFieldLabel}>Age</Text>
                        <TextInput
                          style={styles.partyInput}
                          placeholder="Years"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          maxLength={3}
                          value={person?.age || ''}
                          onChangeText={val =>
                            handleUpdatePerson(
                              isLandlord ? 'landlord' : 'tenant',
                              currentIndex,
                              'age',
                              val
                            )
                          }
                        />
                      </View>

                      {/* Gender */}
                      <View style={styles.colGender}>
                        <Text style={styles.partyFieldLabel}>Gender</Text>
                        <View style={styles.genderPillsRow}>
                          {['M', 'F', 'Other'].map(gen => {
                            const isGenSelected = person?.gender === gen;
                            return (
                              <TouchableOpacity
                                key={gen}
                                style={[
                                  styles.genderPill,
                                  isGenSelected && styles.genderPillActive,
                                ]}
                                onPress={() =>
                                  handleUpdatePerson(
                                    isLandlord ? 'landlord' : 'tenant',
                                    currentIndex,
                                    'gender',
                                    gen
                                  )
                                }
                                activeOpacity={0.85}
                              >
                                <Text
                                  style={[
                                    styles.genderPillText,
                                    isGenSelected && styles.genderPillTextActive,
                                  ]}
                                >
                                  {gen}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>

                    {/* PAN */}
                    <View style={styles.partyField}>
                      <Text style={styles.partyFieldLabel}>PAN</Text>
                      <TextInput
                        style={styles.partyInput}
                        placeholder="ABCDE1234F"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        maxLength={10}
                        value={person?.pan || ''}
                        onChangeText={val =>
                          handleUpdatePerson(
                            isLandlord ? 'landlord' : 'tenant',
                            currentIndex,
                            'pan',
                            val
                          )
                        }
                      />
                    </View>

                    {/* Aadhar */}
                    <View style={styles.partyField}>
                      <Text style={styles.partyFieldLabel}>Aadhar</Text>
                      <TextInput
                        style={styles.partyInput}
                        placeholder="12-digit number"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={12}
                        value={person?.aadhaar || ''}
                        onChangeText={val =>
                          handleUpdatePerson(
                            isLandlord ? 'landlord' : 'tenant',
                            currentIndex,
                            'aadhaar',
                            val
                          )
                        }
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })()}
                            {/* Step 1: Owner / Tenant Role Selection & Click Rental Agreements */}
                            {step === 'role' && (
                              <View style={styles.contentPadding}>
                                <View style={styles.heroCard}>
                                  <View style={styles.heroBadge}>
                                    <FileSignature size={16} color={colors.secondary} />
                                    <Text style={styles.heroBadgeText}>GOVERNMENT APPROVED E-STAMP</Text>
                                  </View>
                                  <Text style={styles.heroTitle}>Create Legally Binding Rental Agreement</Text>
                                  <Text style={styles.heroSub}>
                                    100% legal, non-judicial e-stamp paper delivered digitally with Aadhaar e-Sign support.
                                  </Text>
                                </View>

                                <Text style={styles.sectionHeading}>Are you an Owner or Tenant?</Text>

                                <View style={styles.rolesRow}>
                                  <TouchableOpacity
                                    onPress={() => setUserRole('tenant')}
                                    style={[styles.roleOption, userRole === 'tenant' && styles.roleOptionActive]}
                                    activeOpacity={0.85}
                                  >
                                    <View style={[styles.roleIconBox, { backgroundColor: colors.primaryBg }]}>
                                      <User size={22} color={colors.primary} />
                                    </View>
                                    <Text style={styles.roleTitle}>I am the Tenant</Text>
                                    <Text style={styles.roleSub}>Draft agreement to submit to landlord & claim HRA</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    onPress={() => setUserRole('owner')}
                                    style={[styles.roleOption, userRole === 'owner' && styles.roleOptionActive]}
                                    activeOpacity={0.85}
                                  >
                                    <View style={[styles.roleIconBox, { backgroundColor: colors.secondaryBg }]}>
                                      <Building size={22} color={colors.secondary} />
                                    </View>
                                    <Text style={styles.roleTitle}>I am the Landlord</Text>
                                    <Text style={styles.roleSub}>Draft agreement for new or renewing tenant</Text>
                                  </TouchableOpacity>
                                </View>

                                <View style={styles.perksBox}>
                                  <View style={styles.perkItem}>
                                    <CheckCircle2 size={16} color={colors.secondary} />
                                    <Text style={styles.perkText}>Official ₹100 e-Stamp certificate included</Text>
                                  </View>
                                  <View style={styles.perkItem}>
                                    <CheckCircle2 size={16} color={colors.secondary} />
                                    <Text style={styles.perkText}>Legally vetted clauses protecting deposit & tenure</Text>
                                  </View>
                                  <View style={styles.perkItem}>
                                    <CheckCircle2 size={16} color={colors.secondary} />
                                    <Text style={styles.perkText}>Both parties e-sign from mobile via Aadhaar OTP</Text>
                                  </View>
                                </View>

                                <TouchableOpacity
                                  onPress={handleStartAgreement}
                                  style={styles.primaryButton}
                                  activeOpacity={0.9}
                                >
                                  <Text style={styles.primaryButtonText}>Click Rental Agreements → Start Details</Text>
                                  <ArrowRight size={18} color={colors.textWhite} />
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* Step 2: Enter Details */}
                            {step === 'enterDetails' && (
                              <View style={styles.contentPadding}>
                                <View style={styles.stepBadge}>
                                  <Text style={styles.stepBadgeText}>Step 2 of 5: Enter Parties & Property Details</Text>
                                </View>

                                <Text style={styles.subHeading}>Landlord / Owner Details</Text>
                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Owner Full Name *</Text>
                                  <TextInput
                                    style={styles.textInput}
                                    value={ownerName}
                                    onChangeText={setOwnerName}
                                    placeholder="e.g. Rajeshwar Rao"
                                  />
                                </View>
                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Owner Phone *</Text>
                                  <TextInput
                                    style={styles.textInput}
                                    value={ownerPhone}
                                    onChangeText={setOwnerPhone}
                                    placeholder="+91 98490 12345"
                                  />
                                </View>

                                <Text style={styles.subHeading}>Tenant Details</Text>
                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Tenant Full Name *</Text>
                                  <TextInput
                                    style={styles.textInput}
                                    value={tenantName}
                                    onChangeText={setTenantName}
                                    placeholder="e.g. Rahul Sharma"
                                  />
                                </View>
                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Tenant Phone *</Text>
                                  <TextInput
                                    style={styles.textInput}
                                    value={tenantPhone}
                                    onChangeText={setTenantPhone}
                                    placeholder="+91 98765 43210"
                                  />
                                </View>

                                <Text style={styles.subHeading}>Property & Financial Terms</Text>
                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Rented Property Address *</Text>
                                  <TextInput
                                    style={styles.textInput}
                                    value={propertyAddress}
                                    onChangeText={setPropertyAddress}
                                    placeholder="Flat / Unit No., Building, Area, City"
                                  />
                                </View>

                                <View style={styles.rowTwo}>
                                  <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Monthly Rent (₹)</Text>
                                    <TextInput
                                      style={styles.textInput}
                                      keyboardType="numeric"
                                      value={rentAmount}
                                      onChangeText={setRentAmount}
                                    />
                                  </View>
                                  <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Security Deposit (₹)</Text>
                                    <TextInput
                                      style={styles.textInput}
                                      keyboardType="numeric"
                                      value={depositAmount}
                                      onChangeText={setDepositAmount}
                                    />
                                  </View>
                                </View>

                                <View style={styles.formGroup}>
                                  <Text style={styles.inputLabel}>Agreement Duration</Text>
                                  <View style={styles.chipRow}>
                                    {['11', '22', '33'].map(m => (
                                      <TouchableOpacity
                                        key={m}
                                        onPress={() => setDurationMonths(m)}
                                        style={[styles.tenureChip, durationMonths === m && styles.tenureChipActive]}
                                      >
                                        <Text style={[styles.tenureChipText, durationMonths === m && styles.tenureChipTextActive]}>
                                          {m} Months
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </View>

                                <TouchableOpacity
                                  onPress={handleProceedToPreview}
                                  style={styles.primaryButton}
                                  activeOpacity={0.9}
                                >
                                  <Text style={styles.primaryButtonText}>Submit and Preview Agreement</Text>
                                  <ArrowRight size={18} color={colors.textWhite} />
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* Step 4: Summary matching media_1794649513718_6eb2ffc7.png */}
                            {step === 'preview' && (
                              <View style={[styles.contractContentPadding, { paddingBottom: 100 }]}>
                                {/* Top Card: Form partly filled */}
                                <View style={styles.summaryStatusCard}>
                                  {/* Circular Progress Gauge */}
                                  <View style={styles.summaryGaugeWrap}>
                                    <Svg width={62} height={62} viewBox="0 0 62 62">
                                      <Circle
                                        cx="31"
                                        cy="31"
                                        r={26}
                                        stroke="#E5E7EB"
                                        strokeWidth={4.5}
                                        fill="none"
                                      />
                                      <Circle
                                        cx="31"
                                        cy="31"
                                        r={26}
                                        stroke="#16A34A"
                                        strokeWidth={4.5}
                                        fill="none"
                                        strokeDasharray="163.36 163.36"
                                        strokeDashoffset={163.36 * (1 - 0.08)}
                                        strokeLinecap="round"
                                        transform="rotate(-90 31 31)"
                                      />
                                    </Svg>
                                    <View style={styles.summaryGaugeCenter}>
                                      <Text style={styles.summaryGaugeText}>8%</Text>
                                    </View>
                                  </View>

                                  {/* Status Texts & Preview Link */}
                                  <View style={styles.summaryStatusInfo}>
                                    <Text style={styles.summaryStatusTitle}>Form partly filled</Text>
                                    <Text style={styles.summaryStatusSubtitle}>
                                      You can still continue, or go back and add more details.
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.summaryPreviewLink}
                                      onPress={() => setShowDraftModal(true)}
                                      activeOpacity={0.7}
                                    >
                                      <FileText size={14} color="#111827" strokeWidth={2} />
                                      <Text style={styles.summaryPreviewLinkText}>Preview draft</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                {/* Black Spotlight Card */}
                                <View style={styles.summaryHeroCard}>
                                  <Text style={styles.summaryHeroEyebrow}>Review before you continue</Text>
                                  <Text style={styles.summaryHeroTitle}>
                                    {propertyKind === 'apartment'
                                      ? 'Apartment/Flat'
                                      : propertyKind === 'house'
                                        ? 'Independent House/Villa'
                                        : propertyKind === 'shop'
                                          ? 'Shop/Retail'
                                          : propertyKind === 'office'
                                            ? 'Office Space'
                                            : propertyKind === 'godown'
                                              ? 'Godown/Warehouse'
                                              : 'Industrial Shed'}
                                  </Text>
                                  <Text style={styles.summaryHeroSubtitle}>
                                    {propertyCityName || 'Bangalore'}, {propertyStateName || 'Karnataka'}
                                  </Text>

                                  {/* Stats Capsule */}
                                  <View style={styles.summaryHeroStatsCapsule}>
                                    <View style={styles.summaryHeroStatCol}>
                                      <Text style={styles.summaryHeroStatVal}>
                                        ₹{monthlyRentInput && monthlyRentInput !== '0' ? monthlyRentInput : '0'}
                                      </Text>
                                      <Text style={styles.summaryHeroStatLbl}>Rent / month</Text>
                                    </View>
                                    <View style={styles.summaryHeroStatCol}>
                                      <Text style={styles.summaryHeroStatVal}>
                                        ₹{refundableDepositInput && refundableDepositInput !== '0' ? refundableDepositInput : '0'}
                                      </Text>
                                      <Text style={styles.summaryHeroStatLbl}>Deposit</Text>
                                    </View>
                                    <View style={styles.summaryHeroStatCol}>
                                      <Text style={styles.summaryHeroStatVal}>
                                        {agreementDurationMonths || '11'} mo
                                      </Text>
                                      <Text style={styles.summaryHeroStatLbl}>Duration</Text>
                                    </View>
                                  </View>
                                </View>

                                {/* Card 1: Parties */}
                                <View style={styles.summarySectionCard}>
                                  <View style={styles.summarySectionHeader}>
                                    <Text style={styles.summarySectionTitle}>Parties</Text>
                                    <TouchableOpacity
                                      style={styles.summaryEditBtn}
                                      onPress={() => setStep('parties')}
                                      activeOpacity={0.7}
                                    >
                                      <Pencil size={12} color="#111827" strokeWidth={2} />
                                      <Text style={styles.summaryEditBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Landlord</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {landlords[0]?.fullName?.trim() || '—'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Landlord contact</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {landlords[0]?.phone?.trim() ? `+91 ${landlords[0].phone.trim()}` : '—'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Tenant</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {tenants[0]?.fullName?.trim() || '—'}
                                    </Text>
                                  </View>
                                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.summaryRowLabel}>Tenant contact</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {tenants[0]?.phone?.trim() ? `+91 ${tenants[0].phone.trim()}` : '—'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Card 2: Timeline & terms */}
                                <View style={styles.summarySectionCard}>
                                  <View style={styles.summarySectionHeader}>
                                    <Text style={styles.summarySectionTitle}>Timeline & terms</Text>
                                    <TouchableOpacity
                                      style={styles.summaryEditBtn}
                                      onPress={() => setStep('contract')}
                                      activeOpacity={0.7}
                                    >
                                      <Pencil size={12} color="#111827" strokeWidth={2} />
                                      <Text style={styles.summaryEditBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Start date</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {startDateChoice === 'Custom' ? (customStartDate || '—') : (startDateChoice || '—')}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Minimum lock-in</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {lockInMonths || '1'} month(s)
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Notice period</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {noticePeriodMonths || '1'} month(s)
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Rent includes maintenance</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {rentIncludesMaintenance ? 'Yes' : 'No'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Maintenance</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {rentIncludesMaintenance
                                        ? 'Included'
                                        : maintenanceAmount?.trim()
                                          ? `₹${maintenanceAmount.trim()}`
                                          : '—'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Rent increase</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {increaseRentToggle
                                        ? rentIncreasePercentage?.trim()
                                          ? `${rentIncreasePercentage.trim()}%`
                                          : 'Yes'
                                        : 'No'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Stamp paper</Text>
                                    <Text style={styles.summaryRowValue}>₹{stampPaperAmount || '100'}</Text>
                                  </View>
                                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.summaryRowLabel}>Deposit paid via</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {depositPaymentModes && depositPaymentModes.length > 0
                                        ? depositPaymentModes.map(m => m.toUpperCase()).join(', ')
                                        : '—'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Card 3: Inclusions */}
                                <View style={styles.summarySectionCard}>
                                  <View style={styles.summarySectionHeader}>
                                    <Text style={styles.summarySectionTitle}>Inclusions</Text>
                                    <TouchableOpacity
                                      style={styles.summaryEditBtn}
                                      onPress={() => setStep('contract')}
                                      activeOpacity={0.7}
                                    >
                                      <Pencil size={12} color="#111827" strokeWidth={2} />
                                      <Text style={styles.summaryEditBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                  </View>

                                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.summaryRowLabel}>Furnishing</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {(() => {
                                        const activeFurnishing = Object.entries(itemCounts)
                                          .filter(([_, count]) => count > 0)
                                          .map(([item, count]) => `${count} ${item}`);
                                        const allItems = [...activeFurnishing, ...customItems];
                                        return allItems.length > 0 ? allItems.join(', ') : 'No items added';
                                      })()}
                                    </Text>
                                  </View>
                                </View>

                                {/* Card 4: Property */}
                                <View style={styles.summarySectionCard}>
                                  <View style={styles.summarySectionHeader}>
                                    <Text style={styles.summarySectionTitle}>Property</Text>
                                    <TouchableOpacity
                                      style={styles.summaryEditBtn}
                                      onPress={() => setStep('property')}
                                      activeOpacity={0.7}
                                    >
                                      <Pencil size={12} color="#111827" strokeWidth={2} />
                                      <Text style={styles.summaryEditBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Floor / Flat</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {floorNumber || flatNumber
                                        ? `${floorNumber || ''} / ${flatNumber || ''}`
                                        : '/'}
                                    </Text>
                                  </View>
                                  <View style={styles.summaryRow}>
                                    <Text style={styles.summaryRowLabel}>Building</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {buildingName?.trim() || '—'}
                                    </Text>
                                  </View>
                                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.summaryRowLabel}>Locality</Text>
                                    <Text style={styles.summaryRowValue}>
                                      {locality?.trim() || '—'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Disclaimer Notice Banner */}
                                <View style={styles.summaryNoticeBanner}>
                                  <AlertCircle size={18} color="#D97706" strokeWidth={2} style={{ marginTop: 1 }} />
                                  <Text style={styles.summaryNoticeText}>
                                    This creates a draft. Stamping, signing and registration are separate steps.
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* Step 5: Pay matching media_1794650110665_a151ba42.png */}
                            {step === 'pay' && (
                              <View style={[styles.contractContentPadding, { paddingBottom: 110 }]}>
                                {/* Card 1: Extras for your agreement */}
                                <View style={styles.paySectionCard}>
                                  <View style={styles.paySectionHeader}>
                                    <View style={styles.payHeaderIconBox}>
                                      <Tag size={18} color="#111827" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                      <Text style={styles.paySectionTitle}>Extras for your agreement</Text>
                                      <Text style={styles.paySectionSubtitle}>Optional services, tap to add</Text>
                                    </View>
                                  </View>

                                  {/* Extra 1: One extra original copy */}
                                  <View style={styles.payItemRow}>
                                    <View style={[styles.payItemIconBox, { backgroundColor: '#FEF9C3' }]}>
                                      <FileText size={20} color="#D97706" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                                      <Text style={styles.payItemTitle}>One extra original copy</Text>
                                      <Text style={styles.payItemSubtitle}>
                                        A second original at half price, one for each party.
                                      </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                      <Text style={styles.payItemPrice}>₹249</Text>
                                      <TouchableOpacity
                                        style={[
                                          styles.payAddBtn,
                                          extraCopy && styles.payAddBtnActive,
                                        ]}
                                        onPress={() => setExtraCopy(!extraCopy)}
                                        activeOpacity={0.8}
                                      >
                                        <Text
                                          style={[
                                            styles.payAddBtnText,
                                            extraCopy && styles.payAddBtnTextActive,
                                          ]}
                                        >
                                          {extraCopy ? 'Added' : 'Add'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>

                                  {/* Extra 2: Notarised Agreement */}
                                  <View style={styles.payItemRow}>
                                    <View style={[styles.payItemIconBox, { backgroundColor: '#EFF6FF' }]}>
                                      <ShieldCheck size={20} color="#2563EB" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                                      <Text style={styles.payItemTitle}>Notarised Agreement</Text>
                                      <Text style={styles.payItemSubtitle}>
                                        Verified and stamped by an official notary, accepted as valid address proof.
                                      </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                      <Text style={styles.payItemPrice}>₹350</Text>
                                      <TouchableOpacity
                                        style={[
                                          styles.payAddBtn,
                                          notarisedAgreement && styles.payAddBtnActive,
                                        ]}
                                        onPress={() => setNotarisedAgreement(!notarisedAgreement)}
                                        activeOpacity={0.8}
                                      >
                                        <Text
                                          style={[
                                            styles.payAddBtnText,
                                            notarisedAgreement && styles.payAddBtnTextActive,
                                          ]}
                                        >
                                          {notarisedAgreement ? 'Added' : 'Add'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>

                                  {/* Extra 3: E-Sign Agreement */}
                                  <View style={[styles.payItemRow, { marginBottom: 0 }]}>
                                    <View style={[styles.payItemIconBox, { backgroundColor: '#FDF2F8' }]}>
                                      <PenLine size={20} color="#DB2777" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                                      <Text style={styles.payItemTitle}>E-Sign Agreement</Text>
                                      <Text style={styles.payItemSubtitle}>
                                        Digitally sign your agreement from anywhere. Valid for soft copy only.
                                      </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                      <Text style={styles.payItemPrice}>₹249</Text>
                                      <TouchableOpacity
                                        style={[
                                          styles.payAddBtn,
                                          eSignAgreement && styles.payAddBtnActive,
                                        ]}
                                        onPress={() => setESignAgreement(!eSignAgreement)}
                                        activeOpacity={0.8}
                                      >
                                        <Text
                                          style={[
                                            styles.payAddBtnText,
                                            eSignAgreement && styles.payAddBtnTextActive,
                                          ]}
                                        >
                                          {eSignAgreement ? 'Added' : 'Add'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>

                                {/* Card 2: Where should we deliver? */}
                                <View style={styles.paySectionCard}>
                                  <View style={styles.paySectionHeader}>
                                    <View style={styles.payHeaderIconBox}>
                                      <MapPin size={18} color="#111827" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                      <Text style={styles.paySectionTitle}>Where should we deliver?</Text>
                                      <Text style={styles.paySectionSubtitle}>Select an address for the document</Text>
                                    </View>
                                  </View>

                                  {/* Landlord Address Option */}
                                  <TouchableOpacity
                                    style={styles.payDeliveryOption}
                                    onPress={() => setDeliverToParty('landlord')}
                                    activeOpacity={0.85}
                                  >
                                    <View
                                      style={[
                                        styles.payRadioCircle,
                                        deliverToParty === 'landlord' && styles.payRadioCircleActive,
                                      ]}
                                    >
                                      {deliverToParty === 'landlord' && (
                                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                      )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                      <Text style={styles.payDeliveryTitle}>Landlord</Text>
                                      <Text style={styles.payDeliverySub}>
                                        {landlords[0]?.address?.trim() || 'Address not entered'}
                                      </Text>
                                    </View>
                                    <View style={styles.payRoleBadge}>
                                      <Text style={styles.payRoleBadgeText}>Landlord</Text>
                                    </View>
                                  </TouchableOpacity>

                                  {/* Tenant Address Option */}
                                  <TouchableOpacity
                                    style={styles.payDeliveryOption}
                                    onPress={() => setDeliverToParty('tenant')}
                                    activeOpacity={0.85}
                                  >
                                    <View
                                      style={[
                                        styles.payRadioCircle,
                                        deliverToParty === 'tenant' && styles.payRadioCircleActive,
                                      ]}
                                    >
                                      {deliverToParty === 'tenant' && (
                                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                      )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                      <Text style={styles.payDeliveryTitle}>Tenant</Text>
                                      <Text style={styles.payDeliverySub}>
                                        {tenants[0]?.address?.trim() || 'Address not entered'}
                                      </Text>
                                    </View>
                                    <View style={styles.payRoleBadge}>
                                      <Text style={styles.payRoleBadgeText}>Tenant</Text>
                                    </View>
                                  </TouchableOpacity>

                                  {/* Add new address button */}
                                  <TouchableOpacity
                                    style={styles.payAddAddressBtn}
                                    onPress={() => {
                                      alert('Enter address details in Parties step to deliver here.');
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <Plus size={16} color="#111827" strokeWidth={2} />
                                    <Text style={styles.payAddAddressBtnText}>Add new address</Text>
                                  </TouchableOpacity>
                                </View>

                                {/* Card 3: Delivery speed */}
                                <View style={styles.paySectionCard}>
                                  <View style={styles.paySectionHeader}>
                                    <View style={styles.payHeaderIconBox}>
                                      <Truck size={18} color="#111827" strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                      <Text style={styles.paySectionTitle}>Delivery speed</Text>
                                      <Text style={styles.paySectionSubtitle}>Choose how fast you need it</Text>
                                    </View>
                                  </View>

                                  {/* Standard Day Delivery */}
                                  <TouchableOpacity
                                    style={styles.payDeliveryOption}
                                    onPress={() => setDeliverySpeed('standard')}
                                    activeOpacity={0.85}
                                  >
                                    <View
                                      style={[
                                        styles.payRadioCircle,
                                        deliverySpeed === 'standard' && styles.payRadioCircleActive,
                                      ]}
                                    >
                                      {deliverySpeed === 'standard' && (
                                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                      )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                                      <Text style={styles.payDeliveryTitle}>Standard Day Delivery</Text>
                                      <Text style={styles.payDeliverySub}>
                                        Courier charges apply outside the property city.
                                      </Text>
                                    </View>
                                    <Text style={styles.paySpeedPrice}>₹149</Text>
                                  </TouchableOpacity>

                                  {/* Next Day Delivery */}
                                  <TouchableOpacity
                                    style={styles.payDeliveryOption}
                                    onPress={() => setDeliverySpeed('next')}
                                    activeOpacity={0.85}
                                  >
                                    <View
                                      style={[
                                        styles.payRadioCircle,
                                        deliverySpeed === 'next' && styles.payRadioCircleActive,
                                      ]}
                                    >
                                      {deliverySpeed === 'next' && (
                                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                      )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                                      <Text style={styles.payDeliveryTitle}>Next Day Delivery</Text>
                                      <Text style={styles.payDeliverySub}>
                                        Agreement delivered the next day.
                                      </Text>
                                    </View>
                                    <Text style={styles.paySpeedPrice}>₹499</Text>
                                  </TouchableOpacity>

                                  {/* Notice box */}
                                  <View style={styles.paySpeedNoticeBox}>
                                    <Clock size={16} color="#111827" strokeWidth={2} style={{ marginTop: 2 }} />
                                    <Text style={styles.paySpeedNoticeText}>
                                      <Text style={{ fontWeight: '700', color: '#111827' }}>
                                        Submit your draft before 3 PM
                                      </Text>{' '}
                                      for same or next day delivery. After 3 PM, processing starts the next working day. Sundays and public holidays are excluded.
                                    </Text>
                                  </View>
                                </View>

                                {/* Card 4: Payment summary */}
                                <View style={styles.paySectionCard}>
                                  <Text style={styles.paySummaryCardTitle}>Payment summary</Text>

                                  <View style={styles.paySummaryRow}>
                                    <Text style={styles.paySummaryLabel}>Convenience charges</Text>
                                    <Text style={styles.paySummaryValue}>₹499</Text>
                                  </View>
                                  <View style={styles.paySummaryRow}>
                                    <Text style={styles.paySummaryLabel}>Govt stamp duty</Text>
                                    <Text style={styles.paySummaryValue}>
                                      ₹{stampPaperAmount || '100'}
                                    </Text>
                                  </View>
                                  <View style={styles.paySummaryRow}>
                                    <Text style={styles.paySummaryLabel}>
                                      {deliverySpeed === 'next' ? 'Next day delivery' : 'Standard delivery'}
                                    </Text>
                                    <Text style={styles.paySummaryValue}>
                                      ₹{deliverySpeed === 'next' ? '499' : '149'}
                                    </Text>
                                  </View>
                                  {extraCopy && (
                                    <View style={styles.paySummaryRow}>
                                      <Text style={styles.paySummaryLabel}>One extra original copy</Text>
                                      <Text style={styles.paySummaryValue}>₹249</Text>
                                    </View>
                                  )}
                                  {notarisedAgreement && (
                                    <View style={styles.paySummaryRow}>
                                      <Text style={styles.paySummaryLabel}>Notarised Agreement</Text>
                                      <Text style={styles.paySummaryValue}>₹350</Text>
                                    </View>
                                  )}
                                  {eSignAgreement && (
                                    <View style={styles.paySummaryRow}>
                                      <Text style={styles.paySummaryLabel}>E-Sign Agreement</Text>
                                      <Text style={styles.paySummaryValue}>₹249</Text>
                                    </View>
                                  )}

                                  <View style={styles.paySummaryTotalRow}>
                                    <Text style={styles.paySummaryTotalLabel}>Total amount</Text>
                                    <Text style={styles.paySummaryTotalValue}>
                                      ₹{
                                        499 +
                                        parseInt(stampPaperAmount || '100', 10) +
                                        (deliverySpeed === 'next' ? 499 : 149) +
                                        (extraCopy ? 249 : 0) +
                                        (notarisedAgreement ? 350 : 0) +
                                        (eSignAgreement ? 249 : 0)
                                      }
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            )}

                            {/* Step 5: Order Agreements Processing */}
                            {step === 'order' && (
                              <View style={styles.orderWrap}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.orderTitle}>Order Agreements in Progress...</Text>
                                <Text style={styles.orderSub}>
                                  Affixing government non-judicial stamp, generating QR verification stamp, and preparing digital e-sign links.
                                </Text>
                              </View>
                            )}

                            {/* Step: Payment Successful matching media_1794650594700_d053962f.jpg */}
                            {step === 'completed' && (
                              <View style={styles.successScreenWrap}>
                                {/* Top Mint Glow with Green Check Outline */}
                                <View style={styles.successGlowHalo}>
                                  <View style={styles.successCheckCircle}>
                                    <Check size={22} color="#16A34A" strokeWidth={3.5} />
                                  </View>
                                </View>

                                {/* Title & Subtitle */}
                                <Text style={styles.successMainTitle}>Payment Successful</Text>
                                <Text style={styles.successMainSub}>
                                  Your rental agreement document is ready. You can download it now.
                                </Text>

                                {/* Download Document Button */}
                                <TouchableOpacity
                                  style={styles.successDownloadBtn}
                                  onPress={handleDownload}
                                  activeOpacity={0.88}
                                >
                                  <Download size={18} color="#FFFFFF" strokeWidth={2.2} />
                                  <Text style={styles.successDownloadBtnText}>
                                    {downloadSuccess ? 'Downloaded!' : 'Download Document'}
                                  </Text>
                                </TouchableOpacity>

                                {/* Document delivery Card */}
                                <View style={styles.successDeliveryCard}>
                                  <View style={styles.successDeliveryCardHeader}>
                                    <Truck size={18} color="#111827" strokeWidth={2} />
                                    <Text style={styles.successDeliveryCardTitle}>Document delivery</Text>
                                  </View>

                                  <View style={styles.successDeliveryRow}>
                                    <Text style={styles.successDeliveryLabel}>Delivery type</Text>
                                    <Text style={styles.successDeliveryValue}>
                                      {deliverySpeed === 'next' ? 'Next Day Delivery' : 'Standard Delivery'}
                                    </Text>
                                  </View>

                                  <View style={styles.successDeliveryRow}>
                                    <Text style={styles.successDeliveryLabel}>Expected by</Text>
                                    <Text style={styles.successDeliveryValue}>14 Nov 2026</Text>
                                  </View>

                                  <View style={styles.successDeliveryRow}>
                                    <Text style={styles.successDeliveryLabel}>Delivering to</Text>
                                    <Text style={styles.successDeliveryValue}>
                                      {deliverToParty === 'landlord'
                                        ? `Landlord, ${landlords[0]?.address?.trim() || 'Address not entered'}`
                                        : `Tenant, ${tenants[0]?.address?.trim() || 'Address not entered'}`}
                                    </Text>
                                  </View>

                                  <View style={styles.successDeliveryRow}>
                                    <Text style={styles.successDeliveryLabel}>Order amount</Text>
                                    <Text style={styles.successDeliveryValue}>
                                      ₹{
                                        499 +
                                        parseInt(stampPaperAmount || '100', 10) +
                                        (deliverySpeed === 'next' ? 499 : 149) +
                                        (extraCopy ? 249 : 0) +
                                        (notarisedAgreement ? 350 : 0) +
                                        (eSignAgreement ? 249 : 0)
                                      }
                                    </Text>
                                  </View>

                                  <View style={[styles.successDeliveryRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.successDeliveryLabel}>Agreement ID</Text>
                                    <Text style={styles.successDeliveryValue}>SP-RA-260418</Text>
                                  </View>
                                </View>

                                {/* Notice below card */}
                                <Text style={styles.successFooterNotice}>
                                  Your original document will be delivered to the selected address. Updates are sent to the phone number and email you provided.
                                </Text>

                                {/* Done Button */}
                                <TouchableOpacity
                                  style={styles.successDoneBtn}
                                  onPress={() => setTab('home')}
                                  activeOpacity={0.88}
                                >
                                  <Text style={styles.successDoneBtnText}>Done</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </ScrollView>

                          {/* Sticky Bottom Bar for Step: Intro */}
                          {step === 'intro' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={() => setStep('contract')}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>Start Creating Agreement</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* Sticky Bottom Bar for Step: Contract Details */}
                          {step === 'contract' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={() => setStep('property')}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>Continue</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* Sticky Bottom Bar for Step: Property Details */}
                          {step === 'property' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={() => setStep('parties')}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>Continue</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          
                          
                          {/* Sticky Bottom Bar for Step: Pay */}
                          {step === 'pay' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={handlePay}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>
                                  Make payment · ₹{
                                    499 +
                                    parseInt(stampPaperAmount || '100', 10) +
                                    (deliverySpeed === 'next' ? 499 : 149) +
                                    (extraCopy ? 249 : 0) +
                                    (notarisedAgreement ? 350 : 0) +
                                    (eSignAgreement ? 249 : 0)
                                  }
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
  
                          {/* Sticky Bottom Bar for Step: Preview / Summary */}
                          {step === 'preview' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={() => setStep('pay')}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>Continue to checkout</Text>
                              </TouchableOpacity>
                            </View>
                          )}
  
                          {/* Sticky Bottom Bar for Step: Parties */}
                          {step === 'parties' && (
                            <View style={styles.introBottomBar}>
                              <TouchableOpacity
                                style={styles.introStartBtn}
                                onPress={() => {
                                  if (activePartyTab === 'landlord') {
                                    setActivePartyTab('tenant');
                                    setActiveTenantIndex(0);
                                  } else {
                                    setStep('preview');
                                  }
                                }}
                                activeOpacity={0.88}
                              >
                                <Text style={styles.introStartBtnText}>Continue</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        
      {/* Draft Preview Modal */}
      <Modal
        visible={showDraftModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDraftModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ECEEF5' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }}>Draft Agreement Preview</Text>
            <TouchableOpacity
              onPress={() => setShowDraftModal(false)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={styles.stampPaper}>
              <View style={styles.stampHeader}>
                <Text style={styles.stampGovText}>GOVERNMENT OF INDIA · NON-JUDICIAL</Text>
                <Text style={styles.stampCertNo}>Certificate No: IN-DL84920492819241K</Text>
                <Text style={styles.stampValue}>E-STAMP VALUE: ₹{stampPaperAmount || '100'}.00</Text>
              </View>
              <Text style={styles.legalTitle}>RESIDENTIAL LEASE AGREEMENT</Text>
              <Text style={styles.legalDate}>
                Made on this {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>LESSOR (LANDLORD):</Text>
                <Text style={styles.clauseBody}>
                  {landlords[0]?.fullName?.trim() || ownerName}, Phone: {landlords[0]?.phone?.trim() || ownerPhone}
                </Text>
              </View>
              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>LESSEE (TENANT):</Text>
                <Text style={styles.clauseBody}>
                  {tenants[0]?.fullName?.trim() || tenantName}, Phone: {tenants[0]?.phone?.trim() || tenantPhone}
                </Text>
              </View>
              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>PREMISES:</Text>
                <Text style={styles.clauseBody}>
                  {buildingName ? `${buildingName}, ` : ''}{locality ? `${locality}, ` : ''}{propertyCityName || 'Bangalore'}, {propertyStateName || 'Karnataka'}
                </Text>
              </View>
              <View style={styles.clauseBox}>
                <Text style={styles.clauseTitle}>TERMS:</Text>
                <Text style={styles.clauseItem}>• Monthly Rent: ₹{monthlyRentInput || '0'}</Text>
                <Text style={styles.clauseItem}>• Refundable Deposit: ₹{refundableDepositInput || '0'}</Text>
                <Text style={styles.clauseItem}>• Duration: {agreementDurationMonths || '11'} months</Text>
                <Text style={styles.clauseItem}>• Notice Period: {noticePeriodMonths || '1'} month(s)</Text>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
  </View>
                        );
}

                        const styles = StyleSheet.create({

  successScreenWrap: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 20,
    paddingBottom: 40,
    backgroundColor: '#ECEEF5',
  },
  successGlowHalo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  successCheckCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 20,
  },
  successMainSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  successDownloadBtn: {
    backgroundColor: '#000000',
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  successDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successDeliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  successDeliveryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  successDeliveryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  successDeliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  successDeliveryLabel: {
    fontSize: 13.5,
    color: '#6B7280',
  },
  successDeliveryValue: {
    fontSize: 13.5,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  successFooterNotice: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  successDoneBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },


  paySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  paySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  payHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paySectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  payItemRow: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payItemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  payItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  payItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  payAddBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payAddBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  payAddBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  payAddBtnTextActive: {
    color: '#FFFFFF',
  },
  payDeliveryOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payRadioCircleActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  payDeliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  payDeliverySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  payRoleBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  payRoleBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  payAddAddressBtn: {
    borderWidth: 1,
    borderColor: '#111827',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  payAddAddressBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  paySpeedPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  paySpeedNoticeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 2,
  },
  paySpeedNoticeText: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
    flex: 1,
  },
  paySummaryCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  paySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paySummaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  paySummaryValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  paySummaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paySummaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paySummaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },


  contractStepDot: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 1,
  },
  summaryStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryGaugeWrap: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGaugeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryStatusInfo: {
    flex: 1,
    marginLeft: 14,
  },
  summaryStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  summaryStatusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 6,
  },
  summaryPreviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  summaryPreviewLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  summaryHeroCard: {
    backgroundColor: '#000000',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  summaryHeroEyebrow: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryHeroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryHeroSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  summaryHeroStatsCapsule: {
    backgroundColor: '#1E1E22',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  summaryHeroStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryHeroStatVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  summaryHeroStatLbl: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  summarySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  summarySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryEditBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryRowLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  summaryRowValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  summaryNoticeBanner: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FEF08A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryNoticeText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 17,
  },

                          container: {
                          flex: 1,
                        backgroundColor: '#ECEEF5',
  },
                        header: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingTop: Platform.OS === 'android' ? 20 : 12,
                        paddingBottom: 12,
                        backgroundColor: '#ECEEF5',
  },
                        backCircle: {
                          width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
  },
                        helpCircle: {
                          width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
  },
                        headerTitleCol: {
                          flex: 1,
                        marginLeft: 14,
  },
                        headerTitle: {
                          fontSize: 18,
                        fontWeight: '700',
                        color: '#111827',
  },
                        headerSub: {
                          fontSize: 12,
                        color: '#6B7280',
                        marginTop: 2,
  },
                        scrollArea: {
                          flex: 1,
  },
                        introScrollContent: {
                          paddingBottom: 24,
  },
                        introContent: {
                          paddingHorizontal: 16,
                        paddingTop: 8,
  },
                        introHeroCard: {
                          backgroundColor: '#000000',
                        borderRadius: 24,
                        padding: 22,
                        overflow: 'hidden',
                        position: 'relative',
                        marginBottom: 14,
  },
                        heroCircleDecoration: {
                          position: 'absolute',
                        top: -45,
                        right: -45,
                        width: 170,
                        height: 170,
                        borderRadius: 85,
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
                        heroIconBox: {
                          width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        introHeroTitle: {
                          fontSize: 22,
                        fontWeight: '700',
                        color: '#FFFFFF',
                        marginTop: 20,
                        lineHeight: 28,
  },
                        introHeroDesc: {
                          fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.72)',
                        marginTop: 10,
                        lineHeight: 19,
  },
                        introStatsRow: {
                          flexDirection: 'row',
                        gap: 10,
                        marginTop: 2,
                        marginBottom: 20,
  },
                        introStatCard: {
                          flex: 1,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 18,
                        paddingVertical: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 3,
                        elevation: 1,
  },
                        introRupeeIcon: {
                          fontSize: 18,
                        fontWeight: '700',
                        color: '#111827',
  },
                        introStatVal: {
                          fontSize: 15,
                        fontWeight: '700',
                        color: '#111827',
                        marginTop: 6,
  },
                        introStatLabel: {
                          fontSize: 11,
                        color: '#6B7280',
                        marginTop: 2,
  },
                        howItWorksWrap: {
                          marginBottom: 16,
  },
                        howItWorksTitle: {
                          fontSize: 16,
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: 12,
  },
                        workStepCard: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 18,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 2,
                        elevation: 1,
  },
                        stepIconWrap: {
                          width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
  },
                        stepNumBadge: {
                          position: 'absolute',
                        top: -3,
                        right: -3,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: '#000000',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        stepNumText: {
                          fontSize: 10,
                        fontWeight: '700',
                        color: '#FFFFFF',
  },
                        stepInfoCol: {
                          marginLeft: 14,
                        flex: 1,
  },
                        stepTitle: {
                          fontSize: 14,
                        fontWeight: '600',
                        color: '#111827',
  },
                        stepDesc: {
                          fontSize: 12,
                        color: '#6B7280',
                        marginTop: 2,
  },
                        introPrivacyCard: {
                          backgroundColor: '#FEF3C7',
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                        marginBottom: 14,
  },
                        privacyTextCol: {
                          marginLeft: 12,
                        flex: 1,
  },
                        privacyTitle: {
                          fontSize: 13,
                        fontWeight: '700',
                        color: '#78350F',
  },
                        privacySub: {
                          fontSize: 11.5,
                        color: '#92400E',
                        marginTop: 2,
  },
                        introBottomBar: {
                          backgroundColor: '#ECEEF5',
                        paddingHorizontal: 16,
                        paddingTop: 10,
                        paddingBottom: Platform.OS === 'android' ? 16 : 24,
                        borderTopWidth: 1,
                        borderTopColor: '#E2E5EE',
  },
                        introStartBtn: {
                          backgroundColor: '#000000',
                        height: 52,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        introStartBtnText: {
                          color: '#FFFFFF',
                        fontSize: 15,
                        fontWeight: '700',
  },
                        contractStepperWrap: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingTop: 4,
                        paddingBottom: 14,
                        backgroundColor: '#ECEEF5',
  },
                        contractStepItem: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
  },
                        contractStepBadgeActive: {
                          width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#000000',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        contractStepBadgeDone: {
                          width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#16A34A',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        contractStepBadgeTextActive: {
                          color: '#FFFFFF',
                        fontSize: 11,
                        fontWeight: '700',
  },
                        contractStepLabelActive: {
                          fontSize: 13,
                        fontWeight: '700',
                        color: '#111827',
  },
                        contractStepBadgeInactive: {
                          width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        contractStepBadgeTextInactive: {
                          color: '#6B7280',
                        fontSize: 11,
                        fontWeight: '600',
  },
                        contractStepLabelInactive: {
                          fontSize: 13,
                        color: '#9CA3AF',
                        fontWeight: '500',
  },
                        contractContentPadding: {
                          paddingHorizontal: 16,
                        paddingTop: 4,
                        paddingBottom: 24,
  },
                        contractCard: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        padding: 18,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 3,
                        elevation: 1,
  },
                        cardHeaderRow: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 16,
  },
                        cardIconBox: {
                          width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        cardHeaderTextCol: {
                          marginLeft: 12,
                        flex: 1,
  },
                        cardMainTitle: {
                          fontSize: 16,
                        fontWeight: '700',
                        color: '#111827',
  },
                        cardSubtitle: {
                          fontSize: 12,
                        color: '#6B7280',
                        marginTop: 2,
  },
                        contractField: {
                          marginTop: 14,
  },
                        contractFieldLabel: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#6B7280',
                        marginBottom: 6,
  },
                        contractInput: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        height: 48,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        fontSize: 14,
                        color: '#111827',
  },
                        contractTwoCol: {
                          flexDirection: 'row',
                        gap: 12,
                        marginTop: 14,
  },
                        colHalf: {
                          flex: 1,
  },
                        currencyInputWrap: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        height: 48,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        currencySymbol: {
                          fontSize: 15,
                        fontWeight: '600',
                        color: '#111827',
                        marginRight: 6,
  },
                        currencyInput: {
                          flex: 1,
                        fontSize: 14,
                        color: '#111827',
                        fontWeight: '500',
                        height: '100%',
  },
                        stampPillBtn: {
                          backgroundColor: '#FFFFFF',
                        height: 44,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        stampPillBtnActive: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        stampPillText: {
                          fontSize: 14,
                        fontWeight: '600',
                        color: '#374151',
  },
                        stampPillTextActive: {
                          color: '#FFFFFF',
                        fontWeight: '700',
  },
                        segmentedRow: {
                          flexDirection: 'row',
                        gap: 10,
  },
                        segmentBtn: {
                          flex: 1,
                        backgroundColor: '#FFFFFF',
                        height: 44,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        segmentBtnActive: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        segmentBtnText: {
                          fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
  },
                        segmentBtnTextActive: {
                          color: '#FFFFFF',
                        fontWeight: '600',
  },
                        subCardBox: {
                          backgroundColor: '#F9FAFB',
                        borderRadius: 16,
                        padding: 14,
                        marginTop: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        subCardQuestion: {
                          fontSize: 12.5,
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: 10,
  },
                        radioCardsRow: {
                          flexDirection: 'row',
                        gap: 10,
  },
                        radioCard: {
                          flex: 1,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        radioCardSelected: {
                          borderColor: '#000000',
                        backgroundColor: '#FAFAFA',
  },
                        radioCardTop: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6,
  },
                        radioCardTitle: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#111827',
  },
                        radioOuter: {
                          width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: '#D1D5DB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        radioOuterSelected: {
                          borderColor: '#000000',
  },
                        radioInner: {
                          width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#000000',
  },
                        radioCheckCircle: {
                          width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#000000',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        fixedMaintenanceRow: {
                          flexDirection: 'row',
                        gap: 12,
                        marginTop: 12,
  },
                        selectDropdownBtn: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        height: 48,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
  },
                        selectDropdownText: {
                          fontSize: 14,
                        color: '#111827',
                        fontWeight: '500',
  },
                        selectDropdownPlaceholder: {
                          color: '#9CA3AF',
  },
                        dropdownMenu: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        marginTop: 4,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 3,
                        overflow: 'hidden',
  },
                        dropdownMenuItem: {
                          paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6',
  },
                        dropdownMenuItemText: {
                          fontSize: 13,
                        color: '#374151',
  },
                        dropdownMenuItemTextActive: {
                          fontWeight: '700',
                        color: '#111827',
  },
                        increaseRentField: {
                          marginTop: 10,
  },
                        radioCardSub: {
                          fontSize: 11,
                        color: '#6B7280',
                        lineHeight: 15,
  },
                        toggleCardRow: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: 14,
                        marginTop: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
  },
                        toggleTextCol: {
                          flex: 1,
  },
                        toggleTitle: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#111827',
  },
                        toggleSub: {
                          fontSize: 11,
                        color: '#6B7280',
                        marginTop: 2,
  },
                        toggleSwitchTrack: {
                          width: 48,
                        height: 28,
                        borderRadius: 14,
                        padding: 3,
                        justifyContent: 'center',
  },
                        toggleSwitchTrackOn: {
                          backgroundColor: '#000000',
  },
                        toggleSwitchTrackOff: {
                          backgroundColor: '#E5E7EB',
  },
                        toggleSwitchThumb: {
                          width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: '#FFFFFF',
  },
                        toggleSwitchThumbOn: {
                          alignSelf: 'flex-end',
  },
                        toggleSwitchThumbOff: {
                          alignSelf: 'flex-start',
  },
                        contractDepositTitle: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#111827',
  },
                        contractDepositSub: {
                          fontSize: 11.5,
                        color: '#6B7280',
                        marginTop: 1,
                        marginBottom: 10,
  },
                        depositGrid: {
                          flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
  },
                        depositOptionCard: {
                          width: '48%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        height: 48,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        depositOptionCardActive: {
                          borderColor: '#000000',
                        backgroundColor: '#F9FAFB',
  },
                        depositOptionText: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#111827',
  },
                        durationHelperText: {
                          fontSize: 12,
                        color: '#6B7280',
                        marginTop: 6,
  },
                        unitSubText: {
                          fontSize: 11,
                        color: '#9CA3AF',
                        marginTop: -4,
                        marginBottom: 6,
  },
                        miniPillsRow: {
                          flexDirection: 'row',
                        gap: 6,
  },
                        miniPill: {
                          flex: 1,
                        backgroundColor: '#FFFFFF',
                        height: 40,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        miniPillActive: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        miniPillText: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#374151',
  },
                        miniPillTextActive: {
                          color: '#FFFFFF',
                        fontWeight: '600',
  },
                        furnishingGrid: {
                          flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 8,
  },
                        furnishGridCard: {
                          width: '31.3%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 6,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 90,
  },
                        furnishGridCardSelected: {
                          borderColor: '#000000',
                        backgroundColor: '#F9FAFB',
  },
                        furnishCardTitle: {
                          fontSize: 11.5,
                        fontWeight: '600',
                        color: '#111827',
                        textAlign: 'center',
                        marginTop: 4,
                        marginBottom: 4,
  },
                        furnishAddBtn: {
                          paddingVertical: 2,
                        paddingHorizontal: 8,
  },
                        furnishAddText: {
                          fontSize: 11,
                        color: '#6B7280',
                        fontWeight: '500',
  },
                        furnishCounterRow: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
  },
                        furnishCountBtn: {
                          width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        furnishCountValue: {
                          fontSize: 12,
                        fontWeight: '700',
                        color: '#111827',
  },
                        addCustomItemRow: {
                          flexDirection: 'row',
                        gap: 8,
  },
                        addCustomItemInput: {
                          flex: 1,
                        height: 46,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 14,
                        backgroundColor: '#FFFFFF',
                        fontSize: 14,
                        color: '#111827',
  },
                        addCustomItemBtn: {
                          height: 46,
                        paddingHorizontal: 20,
                        backgroundColor: '#000000',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        addCustomItemBtnText: {
                          color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: '700',
  },
                        selectedItemsTagsRow: {
                          flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 10,
  },
                        selectedItemPill: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        selectedItemPillText: {
                          fontSize: 12,
                        fontWeight: '500',
                        color: '#374151',
  },
                        propertyTypeGrid: {
                          flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 4,
  },
                        propertyTypeCard: {
                          width: '31.3%',
                        height: 86,
                        borderRadius: 16,
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
  },
                        propertyTypeCardSelected: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        propertyTypeCardText: {
                          fontSize: 11,
                        fontWeight: '600',
                        color: '#111827',
                        textAlign: 'center',
                        marginTop: 6,
                        lineHeight: 14,
  },
                        propertyTypeCardTextSelected: {
                          color: '#FFFFFF',
  },
                        bhkWrap: {
                          flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 4,
  },
                        bhkPill: {
                          height: 38,
                        paddingHorizontal: 16,
                        borderRadius: 19,
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        bhkPillSelected: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        bhkPillText: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#374151',
  },
                        bhkPillTextSelected: {
                          color: '#FFFFFF',
                        fontWeight: '600',
  },
                        addressPreviewBox: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: 14,
                        marginTop: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        addressPreviewLabel: {
                          fontSize: 11,
                        color: '#9CA3AF',
                        marginBottom: 4,
                        fontWeight: '500',
  },
                        addressPreviewText: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#111827',
  },
                        eSignNoticeBox: {
                          backgroundColor: '#F9FAFB',
                        borderRadius: 16,
                        padding: 14,
                        gap: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        eSignStepRow: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
  },
                        eSignDot: {
                          width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#059669',
  },
                        eSignText: {
                          flex: 1,
                        fontSize: 13,
                        color: '#374151',
                        lineHeight: 18,
  },
                        partyTabContainer: {
                          flexDirection: 'row',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 20,
                        padding: 4,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
  },
                        partyTab: {
                          flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        borderRadius: 16,
                        gap: 6,
  },
                        partyTabActive: {
                          backgroundColor: '#000000',
  },
                        partyTabText: {
                          fontSize: 14,
                        fontWeight: '600',
                        color: '#6B7280',
  },
                        partyTabTextActive: {
                          color: '#FFFFFF',
  },
                        partyBadge: {
                          width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        partyBadgeActive: {
                          backgroundColor: '#374151',
  },
                        partyBadgeText: {
                          fontSize: 11,
                        fontWeight: '700',
                        color: '#6B7280',
  },
                        partyBadgeTextActive: {
                          color: '#FFFFFF',
  },
                        partySubPillsScroll: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 2,
                        marginBottom: 14,
  },
                        partySubPill: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        gap: 6,
  },
                        partySubPillActive: {
                          backgroundColor: '#0F172A',
                        borderColor: '#0F172A',
  },
                        partySubPillBadge: {
                          width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: '#F3F4F6',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        partySubPillBadgeActive: {
                          backgroundColor: '#FFFFFF',
  },
                        partySubPillBadgeText: {
                          fontSize: 11,
                        fontWeight: '700',
                        color: '#6B7280',
  },
                        partySubPillBadgeTextActive: {
                          color: '#0F172A',
  },
                        partySubPillText: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#6B7280',
  },
                        partySubPillTextActive: {
                          color: '#FFFFFF',
                        fontWeight: '600',
  },
                        partyAddPill: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderStyle: 'dashed',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        gap: 4,
  },
                        partyAddPillText: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#111827',
  },
                        partyCard: {
                          backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        marginBottom: 20,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 3,
                        elevation: 1,
  },
                        partyCardHeader: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16,
  },
                        partyCardTitle: {
                          fontSize: 15,
                        fontWeight: '700',
                        color: '#111827',
  },
                        partyRemoveText: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: '#EF4444',
  },
                        partyField: {
                          marginBottom: 14,
  },
                        partyFieldLabel: {
                          fontSize: 13,
                        color: '#4B5563',
                        fontWeight: '500',
                        marginBottom: 6,
  },
                        partyInput: {
                          height: 48,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 14,
                        fontSize: 14,
                        color: '#111827',
                        backgroundColor: '#FFFFFF',
  },
                        phoneInputWrap: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        height: 48,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 14,
                        backgroundColor: '#FFFFFF',
  },
                        phonePrefix: {
                          fontSize: 14,
                        fontWeight: '600',
                        color: '#111827',
                        marginRight: 6,
  },
                        phoneInput: {
                          flex: 1,
                        fontSize: 14,
                        color: '#111827',
                        height: 48,
  },
                        partyCallout: {
                          backgroundColor: '#FEF3C7',
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginVertical: 10,
                        borderWidth: 1,
                        borderColor: '#FDE68A',
  },
                        partyCalloutText: {
                          flex: 1,
                        fontSize: 12,
                        lineHeight: 16,
                        color: '#92400E',
  },
                        partyAccordionHeader: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#EEF2F6',
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginTop: 6,
                        marginBottom: 14,
  },
                        partyAccordionTitle: {
                          fontSize: 13.5,
                        fontWeight: '600',
                        color: '#1E293B',
  },
                        partyAccordionBody: {
                          marginTop: 4,
  },
                        partyTwoCol: {
                          flexDirection: 'row',
                        gap: 12,
                        marginBottom: 14,
  },
                        colAge: {
                          flex: 1,
  },
                        colGender: {
                          flex: 1.3,
  },
                        genderPillsRow: {
                          flexDirection: 'row',
                        gap: 6,
  },
                        genderPill: {
                          flex: 1,
                        height: 48,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
  },
                        genderPillActive: {
                          backgroundColor: '#000000',
                        borderColor: '#000000',
  },
                        genderPillText: {
                          fontSize: 13,
                        fontWeight: '500',
                        color: '#374151',
  },
                        genderPillTextActive: {
                          color: '#FFFFFF',
                        fontWeight: '700',
  },
                        contentPadding: {
                          padding: 16,
  },
                        heroCard: {
                          backgroundColor: colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginBottom: 16,
  },
                        heroBadge: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.secondaryBg,
                        alignSelf: 'flex-start',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginBottom: 8,
                        gap: 6,
  },
                        heroBadgeText: {
                          fontSize: 11,
                        fontWeight: '700',
                        color: colors.secondary,
  },
                        heroTitle: {
                          fontSize: 18,
                        fontWeight: '800',
                        color: colors.primary,
                        marginBottom: 6,
  },
                        heroSub: {
                          fontSize: 13,
                        color: colors.textSecondary,
                        lineHeight: 18,
  },
                        sectionHeading: {
                          fontSize: 15,
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: 12,
  },
                        subHeading: {
                          fontSize: 14,
                        fontWeight: '700',
                        color: colors.primary,
                        marginTop: 6,
                        marginBottom: 10,
  },
                        rolesRow: {
                          flexDirection: 'row',
                        gap: 12,
                        marginBottom: 16,
  },
                        roleOption: {
                          flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1.5,
                        borderColor: colors.border,
  },
                        roleOptionActive: {
                          borderColor: colors.primary,
                        backgroundColor: colors.surface,
  },
                        roleIconBox: {
                          width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
  },
                        roleTitle: {
                          fontSize: 14,
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: 4,
  },
                        roleSub: {
                          fontSize: 11,
                        color: colors.textSecondary,
                        lineHeight: 15,
  },
                        perksBox: {
                          backgroundColor: colors.surface,
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        marginBottom: 20,
                        gap: 10,
  },
                        perkItem: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
  },
                        perkText: {
                          fontSize: 12,
                        color: colors.textPrimary,
  },
                        stepBadge: {
                          backgroundColor: colors.secondaryBg,
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 8,
                        alignSelf: 'flex-start',
                        marginBottom: 14,
  },
                        stepBadgeText: {
                          fontSize: 12,
                        fontWeight: '700',
                        color: colors.secondary,
  },
                        formGroup: {
                          marginBottom: 14,
  },
                        rowTwo: {
                          flexDirection: 'row',
                        gap: 10,
  },
                        inputLabel: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: colors.primary,
                        marginBottom: 6,
  },
                        textInput: {
                          backgroundColor: colors.surface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 14,
                        color: colors.primary,
  },
                        chipRow: {
                          flexDirection: 'row',
                        gap: 10,
  },
                        tenureChip: {
                          flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
  },
                        tenureChipActive: {
                          backgroundColor: colors.primary,
                        borderColor: colors.primary,
  },
                        tenureChipText: {
                          fontSize: 12,
                        fontWeight: '600',
                        color: colors.textSecondary,
  },
                        tenureChipTextActive: {
                          color: colors.textWhite,
                        fontWeight: '700',
  },
                        stampPaper: {
                          backgroundColor: '#FAF7EE',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1.5,
                        borderColor: '#C7B299',
                        marginBottom: 20,
  },
                        stampHeader: {
                          borderBottomWidth: 1.5,
                        borderBottomColor: '#C7B299',
                        paddingBottom: 10,
                        marginBottom: 12,
                        alignItems: 'center',
  },
                        stampGovText: {
                          fontSize: 12,
                        fontWeight: '800',
                        color: '#8A6D3B',
                        letterSpacing: 1,
  },
                        stampCertNo: {
                          fontSize: 10,
                        color: '#555',
                        marginTop: 2,
  },
                        stampValue: {
                          fontSize: 13,
                        fontWeight: '800',
                        color: '#8A6D3B',
                        marginTop: 4,
  },
                        legalTitle: {
                          fontSize: 14,
                        fontWeight: '800',
                        textAlign: 'center',
                        color: colors.primary,
                        letterSpacing: 0.5,
  },
                        legalDate: {
                          fontSize: 11,
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginTop: 2,
                        marginBottom: 12,
  },
                        clauseBox: {
                          backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 10,
  },
                        clauseTitle: {
                          fontSize: 11,
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: 4,
  },
                        clauseBody: {
                          fontSize: 11,
                        color: colors.textPrimary,
                        lineHeight: 16,
  },
                        clauseItem: {
                          fontSize: 11,
                        color: colors.textPrimary,
                        lineHeight: 16,
                        marginBottom: 4,
  },
                        signatureRow: {
                          flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: '#C7B299',
                        paddingTop: 10,
  },
                        sigBox: {
                          alignItems: 'center',
  },
                        sigRole: {
                          fontSize: 10,
                        fontWeight: '700',
                        color: colors.primary,
  },
                        sigStatus: {
                          fontSize: 9,
                        color: colors.accent,
                        marginTop: 2,
  },
                        invoiceCard: {
                          backgroundColor: colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginBottom: 16,
  },
                        invoiceTitle: {
                          fontSize: 15,
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight,
                        paddingBottom: 8,
  },
                        invoiceRow: {
                          flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 4,
  },
                        invoiceLabel: {
                          fontSize: 13,
                        color: colors.textSecondary,
  },
                        invoiceVal: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: colors.primary,
  },
                        invoiceTotalRow: {
                          borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                        marginTop: 8,
                        paddingTop: 8,
  },
                        invoiceTotalLabel: {
                          fontSize: 14,
                        fontWeight: '700',
                        color: colors.primary,
  },
                        invoiceTotalVal: {
                          fontSize: 16,
                        fontWeight: '800',
                        color: colors.primary,
  },
                        payCard: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        marginBottom: 10,
  },
                        payCardActive: {
                          borderColor: colors.primary,
  },
                        payRadio: {
                          width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
  },
                        payRadioDot: {
                          width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
  },
                        payTitle: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: colors.primary,
  },
                        orderWrap: {
                          paddingTop: 90,
                        alignItems: 'center',
                        paddingHorizontal: 24,
  },
                        orderTitle: {
                          fontSize: 18,
                        fontWeight: '700',
                        color: colors.primary,
                        marginTop: 18,
  },
                        orderSub: {
                          fontSize: 13,
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginTop: 6,
                        lineHeight: 18,
  },
                        successIconCircle: {
                          width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: colors.secondaryBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        marginTop: 10,
                        marginBottom: 12,
  },
                        successTitle: {
                          fontSize: 22,
                        fontWeight: '800',
                        color: colors.primary,
                        textAlign: 'center',
  },
                        successSub: {
                          fontSize: 13,
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginBottom: 20,
                        lineHeight: 18,
  },
                        statusBox: {
                          backgroundColor: colors.surface,
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                        marginBottom: 20,
                        gap: 10,
  },
                        statusRow: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
  },
                        statusText: {
                          fontSize: 12,
                        color: colors.textPrimary,
                        flex: 1,
  },
                        downloadBtn: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.primary,
                        paddingVertical: 14,
                        borderRadius: 14,
                        gap: 8,
                        marginBottom: 10,
  },
                        downloadBtnText: {
                          color: colors.textWhite,
                        fontSize: 14,
                        fontWeight: '700',
  },
                        shareBtn: {
                          flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.surface,
                        borderWidth: 1.5,
                        borderColor: colors.primary,
                        paddingVertical: 12,
                        borderRadius: 14,
                        gap: 8,
                        marginBottom: 10,
  },
                        shareBtnText: {
                          color: colors.primary,
                        fontSize: 14,
                        fontWeight: '700',
  },
                        homeReturnBtn: {
                          alignItems: 'center',
                        paddingVertical: 12,
                        marginBottom: 20,
  },
                        homeReturnBtnText: {
                          fontSize: 13,
                        fontWeight: '600',
                        color: colors.textSecondary,
  },
                        primaryButton: {
                          backgroundColor: colors.primary,
                        borderRadius: 14,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginBottom: 20,
  },
                        primaryButtonText: {
                          color: colors.textWhite,
                        fontSize: 15,
                        fontWeight: '700',
  },
});
