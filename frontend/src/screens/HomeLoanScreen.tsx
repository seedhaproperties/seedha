import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  PanResponder,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingUp,
  Building2,
  Landmark,
  Building,
  Home,
  Percent,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

type Step = 'landing' | 'basic' | 'income' | 'results' | 'lenders' | 'apply';

const lenders = [
  {
    name: 'SBI Home Loans',
    rate: '8.40%',
    emi: '₹43,000/mo',
    maxLoan: '1.5 Cr',
    badge: 'Lowest Rate',
    iconType: 'sbi',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    name: 'HDFC Bank',
    rate: '8.50%',
    emi: '₹43,450/mo',
    maxLoan: '1.2 Cr',
    badge: null,
    iconType: 'hdfc',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    name: 'ICICI Bank',
    rate: '8.60%',
    emi: '₹43,900/mo',
    maxLoan: '1.0 Cr',
    badge: null,
    iconType: 'icici',
    iconBg: '#F1F5F9',
    iconColor: '#475569',
  },
  {
    name: 'Axis Bank',
    rate: '8.75%',
    emi: '₹44,500/mo',
    maxLoan: '90 L',
    badge: null,
    iconType: 'axis',
    iconBg: '#FEF9C3',
    iconColor: '#CA8A04',
  },
  {
    name: 'LIC HFL',
    rate: '8.35%',
    emi: '₹42,800/mo',
    maxLoan: '80 L',
    badge: null,
    iconType: 'lic',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
];

interface SliderProps {
  label: string;
  valueText: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

const CustomSlider: React.FC<SliderProps> = ({
  label,
  valueText,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackLayoutRef = useRef<{ pageX: number; width: number }>({ pageX: 0, width: 0 });

  // Keep track of latest props & state in refs for PanResponder callbacks
  const latestProps = useRef({ min, max, step, onChange, value });
  latestProps.current = { min, max, step, onChange, value };

  const currentRatio = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handlePositionChange = (clientX: number) => {
    const { pageX, width } = trackLayoutRef.current;
    const w = width > 0 ? width : trackWidth;
    if (w <= 0) return;

    const offsetX = clientX - pageX;
    const ratio = Math.max(0, Math.min(1, offsetX / w));
    const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
    let rawVal = curMin + ratio * (curMax - curMin);
    if (curStep > 0) {
      rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
    }
    const clamped = Math.max(curMin, Math.min(curMax, rawVal));
    curOnChange(clamped);
  };

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.measure((_x, _y, width, _height, pageX) => {
        if (width > 0) {
          trackLayoutRef.current = { pageX, width };
          setTrackWidth(width);
        }
      });
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        measureTrack();
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        } else if (evt.nativeEvent.locationX !== undefined && trackWidth > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
          const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
          let rawVal = curMin + ratio * (curMax - curMin);
          if (curStep > 0) rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
          curOnChange(Math.max(curMin, Math.min(curMax, rawVal)));
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        } else if (evt.nativeEvent.locationX !== undefined && trackWidth > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
          const { min: curMin, max: curMax, step: curStep, onChange: curOnChange } = latestProps.current;
          let rawVal = curMin + ratio * (curMax - curMin);
          if (curStep > 0) rawVal = Math.round((rawVal - curMin) / curStep) * curStep + curMin;
          curOnChange(Math.max(curMin, Math.min(curMax, rawVal)));
        }
      },
      onPanResponderRelease: (evt) => {
        if (evt.nativeEvent.pageX !== undefined && trackLayoutRef.current.pageX > 0) {
          handlePositionChange(evt.nativeEvent.pageX);
        }
      },
    })
  ).current;

  // Web input slider support for smooth mouse dragging & accessibility on React Native Web
  if (Platform.OS === 'web') {
    return (
      <View style={sliderStyles.rowContainer}>
        <View style={sliderStyles.topRow}>
          <Text style={sliderStyles.label}>{label}</Text>
          <Text style={sliderStyles.valueText}>{valueText}</Text>
        </View>
        <View style={sliderStyles.webSliderWrapper}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e: any) => onChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: 24,
              cursor: 'pointer',
              accentColor: '#000000',
              background: 'transparent',
              outline: 'none',
              margin: 0,
            } as any}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={sliderStyles.rowContainer}>
      <View style={sliderStyles.topRow}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={sliderStyles.valueText}>{valueText}</Text>
      </View>
      <View
        ref={trackRef}
        style={sliderStyles.touchableArea}
        onLayout={() => measureTrack()}
        {...panResponder.panHandlers}
      >
        <View style={sliderStyles.trackBackground}>
          <View
            style={[
              sliderStyles.trackActive,
              { width: `${Math.round(currentRatio * 100)}%` },
            ]}
          />
        </View>
        <View
          style={[
            sliderStyles.thumb,
            {
              left: `${Math.round(currentRatio * 100)}%`,
              marginLeft: -7,
            },
          ]}
        />
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  rowContainer: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  webSliderWrapper: {
    height: 24,
    justifyContent: 'center',
  },
  touchableArea: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  trackActive: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: 9,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default function HomeLoanScreen() {
  const { pop } = useApp();
  const [step, setStep] = useState<Step>('landing');

  // Slider interactive states
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // 50 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 Years

  const [form, setForm] = useState({
    name: '',
    phone: '',
    employment: 'Salaried', // 'Salaried' | 'Self-Employed' | 'Business'
    income: '',
    existingEmis: '',
    loanAmount: '50,00,000',
    propertyValue: '70,00,000',
    downPayment: '20,00,000',
    tenure: '20yr', // '10yr' | '15yr' | '20yr' | '25yr' | '30yr'
    panCard: '',
    aadhaarNumber: '',
    propertyAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // Formatting helpers
  const formatIndianCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const calculateMonthlyEMI = (principal: number, annualRate: number, years: number) => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const r = annualRate / 12 / 100;
    const n = years * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const currentEmi = calculateMonthlyEMI(loanAmount, interestRate, tenureYears);

  const handleBackNavigation = () => {
    if (step === 'landing') {
      pop();
    } else if (step === 'basic') {
      setStep('landing');
    } else if (step === 'income') {
      setStep('basic');
    } else if (step === 'results') {
      setStep('income');
    } else if (step === 'lenders') {
      setStep('results');
    } else if (step === 'apply') {
      setStep('lenders');
    } else {
      setStep('landing');
    }
  };

  const renderLenderIcon = (type: string, color: string) => {
    switch (type) {
      case 'sbi':
        return <Landmark size={22} color={color} strokeWidth={2.2} />;
      case 'hdfc':
        return <Building size={22} color={color} strokeWidth={2.2} />;
      case 'icici':
        return <Building2 size={22} color={color} strokeWidth={2.2} />;
      case 'axis':
        return <Percent size={22} color={color} strokeWidth={2.2} />;
      case 'lic':
        return <Home size={22} color={color} strokeWidth={2.2} />;
      default:
        return <Building2 size={22} color={color} strokeWidth={2.2} />;
    }
  };

  if (applied) {
    const displayLoanAmount = form.loanAmount ? `₹${form.loanAmount}` : '₹50,00,000';
    const displayTenure = form.tenure
      ? `${form.tenure.replace('yr', '')} Years`
      : '20 Years';
    const displayEmi = '₹43,391/mo';

    return (
      <View style={styles.successScreenContainer}>
        {/* Soft Green Circle with Checkmark Icon */}
        <View style={styles.successCircleOuter}>
          <View style={styles.successCircleInner}>
            <Check size={26} color="#16A34A" strokeWidth={3} />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.successMainTitle}>Application Submitted!</Text>
        <Text style={styles.successMainSub}>
          Our loan advisor will contact you within 2 hours{'\n'}to guide you through the next steps.
        </Text>

        {/* Loan Details Summary Card */}
        <View style={styles.successDetailsCard}>
          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Loan Amount</Text>
            <Text style={styles.successDetailValue}>{displayLoanAmount}</Text>
          </View>

          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Tenure</Text>
            <Text style={styles.successDetailValue}>{displayTenure}</Text>
          </View>

          <View style={styles.successDetailRow}>
            <Text style={styles.successDetailLabel}>Est. EMI</Text>
            <Text style={styles.successDetailValue}>{displayEmi}</Text>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          onPress={pop}
          style={styles.backHomeButtonFigma}
          activeOpacity={0.88}
        >
          <Text style={styles.backHomeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackNavigation}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {step === 'basic' || step === 'income' || step === 'results'
              ? 'Check Eligibility'
              : step === 'apply'
              ? 'Home Loan Application'
              : 'Home Loan'}
          </Text>
          {step === 'basic' && (
            <Text style={styles.headerSubtitle}>Basic Details</Text>
          )}
          {step === 'income' && (
            <Text style={styles.headerSubtitle}>Income Details</Text>
          )}
          {step === 'results' && (
            <Text style={styles.headerSubtitle}>Results Details</Text>
          )}
          {step === 'lenders' && (
            <Text style={styles.headerSubtitle}>Lenders Details</Text>
          )}
          {step === 'apply' && (
            <Text style={styles.headerSubtitle}>Apply Details</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'landing' && (
          <View style={styles.landingContent}>
            {/* Dark Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroDarkAccent} />
              <View style={styles.heroGlowOverlay} />
              <Text style={styles.heroTitle}>Get the Best Home Loan Rates</Text>
              <Text style={styles.heroSub}>Starting from 8.35% p.a.</Text>
            </View>

            {/* Check Eligibility Card */}
            <TouchableOpacity
              onPress={() => setStep('basic')}
              style={styles.actionCard}
              activeOpacity={0.85}
            >
              <View style={styles.blueIconContainer}>
                <TrendingUp size={20} color="#2563EB" strokeWidth={2.2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Check Eligibility</Text>
                <Text style={styles.actionSubtitle}>2-min assessment</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            {/* Compare Lenders Card */}
            <TouchableOpacity
              onPress={() => setStep('lenders')}
              style={styles.actionCard}
              activeOpacity={0.85}
            >
              <View style={styles.purpleIconContainer}>
                <Building2 size={20} color="#7C3AED" strokeWidth={2.2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Compare Lenders</Text>
                <Text style={styles.actionSubtitle}>10+ banks & NBFCs</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            {/* Quick EMI Calculator Card */}
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorTitle}>Quick EMI Calculator</Text>

              {/* Loan Amount Slider */}
              <CustomSlider
                label="Loan Amount"
                valueText={formatIndianCurrency(loanAmount)}
                value={loanAmount}
                min={500000}
                max={20000000}
                step={50000}
                onChange={setLoanAmount}
              />

              {/* Interest Rate Slider */}
              <CustomSlider
                label="Interest Rate"
                valueText={`${interestRate.toFixed(2)}% p.a.`}
                value={interestRate}
                min={7.0}
                max={15.0}
                step={0.05}
                onChange={setInterestRate}
              />

              {/* Tenure Slider */}
              <CustomSlider
                label="Tenure"
                valueText={`${tenureYears} Years`}
                value={tenureYears}
                min={1}
                max={30}
                step={1}
                onChange={setTenureYears}
              />

              {/* Monthly EMI Result Box */}
              <View style={styles.emiResultBox}>
                <Text style={styles.emiResultLabel}>Monthly EMI</Text>
                <Text style={styles.emiResultValue}>{formatIndianCurrency(currentEmi)}</Text>
              </View>
            </View>
          </View>
        )}

        {step === 'basic' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Basic Information</Text>

            {/* Full Name Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Full Name</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              />
            </View>

            {/* Mobile Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Mobile Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm((f) => ({ ...f, phone: text }))}
              />
            </View>

            {/* Employment Type Pills */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Employment Type</Text>
              <View style={styles.optionsRow}>
                {(['Salaried', 'Self-Employed', 'Business'] as const).map((type) => {
                  const isSelected = form.employment === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chipButton,
                        isSelected && styles.chipButtonSelected,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, employment: type }))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          isSelected && styles.chipButtonTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Monthly Income Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Monthly Income (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="80,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.income}
                onChangeText={(text) => setForm((f) => ({ ...f, income: text }))}
              />
            </View>

            {/* Existing EMIs Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Existing EMIs (₹/month)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.existingEmis}
                onChangeText={(text) => setForm((f) => ({ ...f, existingEmis: text }))}
              />
            </View>
          </View>
        )}

        {step === 'income' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Loan Requirements</Text>

            {/* Loan Amount Required Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Loan Amount Required (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="50,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.loanAmount}
                onChangeText={(text) => setForm((f) => ({ ...f, loanAmount: text }))}
              />
            </View>

            {/* Property Value Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Property Value (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="70,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.propertyValue}
                onChangeText={(text) => setForm((f) => ({ ...f, propertyValue: text }))}
              />
            </View>

            {/* Down Payment Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Down Payment (₹)</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="20,00,000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.downPayment}
                onChangeText={(text) => setForm((f) => ({ ...f, downPayment: text }))}
              />
            </View>

            {/* Preferred Tenure Pills */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Preferred Tenure</Text>
              <View style={styles.optionsRow}>
                {(['10yr', '15yr', '20yr', '25yr', '30yr'] as const).map((tenure) => {
                  const isSelected = form.tenure === tenure;
                  return (
                    <TouchableOpacity
                      key={tenure}
                      style={[
                        styles.chipButton,
                        isSelected && styles.chipButtonSelected,
                      ]}
                      onPress={() => setForm((f) => ({ ...f, tenure }))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          isSelected && styles.chipButtonTextSelected,
                        ]}
                      >
                        {tenure}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {step === 'results' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Your Eligibility</Text>

            {/* Eligibility Result Card */}
            <View style={styles.resultsCard}>
              <View style={styles.resultsTopSection}>
                <Text style={styles.resultsPrimaryLabel}>Eligible Loan Amount</Text>
                <Text style={styles.resultsPrimaryValue}>₹5,070 L</Text>
              </View>

              <View style={styles.resultsColumnsRow}>
                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Est. EMI</Text>
                  <Text style={styles.resultsColValue}>₹43,391/mo</Text>
                </View>

                <View style={styles.resultsColSeparator} />

                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Best Rate</Text>
                  <Text style={styles.resultsColValue}>8.35% p.a.</Text>
                </View>

                <View style={styles.resultsColSeparator} />

                <View style={styles.resultsCol}>
                  <Text style={styles.resultsColLabel}>Tenure</Text>
                  <Text style={styles.resultsColValue}>20 yrs</Text>
                </View>
              </View>
            </View>

            {/* Compare Lenders Outline Button */}
            <TouchableOpacity
              style={styles.compareLendersButton}
              onPress={() => setStep('lenders')}
              activeOpacity={0.85}
            >
              <Text style={styles.compareLendersButtonText}>Compare Lenders</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'lenders' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Compare Loan Offers</Text>
            <View style={styles.lendersContainer}>
              {lenders.map((l) => (
                <View key={l.name} style={styles.lenderFigmaCard}>
                  {/* Top Row: Icon + Name/Badge on Left, Rate/Per Annum on Right */}
                  <View style={styles.lenderHeaderRow}>
                    <View style={styles.lenderBrandCol}>
                      <View style={[styles.lenderIconContainer, { backgroundColor: l.iconBg }]}>
                        {renderLenderIcon(l.iconType, l.iconColor)}
                      </View>
                      <View style={styles.lenderNameContainer}>
                        <Text style={styles.lenderBrandName}>{l.name}</Text>
                        {l.badge && (
                          <View style={styles.lenderBadge}>
                            <Text style={styles.lenderBadgeText}>{l.badge}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.lenderRateCol}>
                      <Text style={styles.lenderRateText}>{l.rate}</Text>
                      <Text style={styles.lenderPerAnnumText}>per annum</Text>
                    </View>
                  </View>

                  {/* Bottom Row: EMI + Max Loan on Left, Apply Button on Right */}
                  <View style={styles.lenderBottomRow}>
                    <View style={styles.lenderStatsRow}>
                      <View style={styles.lenderStatBlock}>
                        <Text style={styles.lenderStatLabel}>EMI</Text>
                        <Text style={styles.lenderStatValue}>{l.emi}</Text>
                      </View>
                      <View style={styles.lenderStatBlock}>
                        <Text style={styles.lenderStatLabel}>Max Loan</Text>
                        <Text style={styles.lenderStatValue}>{l.maxLoan}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setStep('apply')}
                      style={styles.lenderApplyButton}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.lenderApplyText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 'apply' && (
          <View style={styles.formContainer}>
            <Text style={styles.formSectionHeader}>Complete Application</Text>

            {/* Green Pre-Approved Banner */}
            <View style={styles.preApprovedBanner}>
              <Text style={styles.preApprovedBannerText}>
                ✓ You’re pre-approved based on your profile.{'\n'}Complete the application to proceed.
              </Text>
            </View>

            {/* Full Name Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Full Name</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="ex: Rahul"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(text) => setForm((f) => ({ ...f, name: text }))}
              />
            </View>

            {/* PAN Card Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>PAN Card Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="ABCDE1234F"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={form.panCard}
                onChangeText={(text) => setForm((f) => ({ ...f, panCard: text }))}
              />
            </View>

            {/* Aadhaar Number Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Aadhaar Number</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.aadhaarNumber}
                onChangeText={(text) => setForm((f) => ({ ...f, aadhaarNumber: text }))}
              />
            </View>

            {/* Property Address Field */}
            <View style={styles.formFieldBlock}>
              <Text style={styles.fieldLabelText}>Property Address</Text>
              <TextInput
                style={styles.fieldInputBox}
                placeholder="Enter full address"
                placeholderTextColor="#94A3B8"
                value={form.propertyAddress}
                onChangeText={(text) => setForm((f) => ({ ...f, propertyAddress: text }))}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'landing') {
              setStep('basic');
            } else if (step === 'basic') {
              setStep('income');
            } else if (step === 'income') {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setStep('results');
              }, 600);
            } else if (step === 'results') {
              setStep('lenders');
            } else if (step === 'lenders') {
              setStep('apply');
            } else if (step === 'apply') {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setApplied(true);
              }, 1000);
            } else {
              setStep('basic');
            }
          }}
          disabled={loading}
          style={styles.primaryActionButton}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryActionButtonText}>
              {step === 'landing'
                ? 'Check Eligibility'
                : step === 'apply'
                ? 'Submit Application'
                : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Soft light gray matching the reference canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '400',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  landingContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  // Hero Dark Card
  heroCard: {
    backgroundColor: '#090A0F',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroDarkAccent: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1E2230',
    opacity: 0.6,
  },
  heroGlowOverlay: {
    position: 'absolute',
    bottom: -60,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#161924',
    opacity: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 25,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 6,
  },
  // Action Cards (Check Eligibility & Compare Lenders)
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  blueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  // Calculator Card
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 18,
  },
  emiResultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emiResultLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emiResultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Sticky Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    backgroundColor: 'transparent',
  },
  primaryActionButton: {
    backgroundColor: '#000000',
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Shared Form Container & Input Styling (Figma Design)
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  formSectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  formFieldBlock: {
    marginBottom: 18,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  fieldInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 54,
    fontSize: 15,
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipButtonSelected: {
    backgroundColor: '#000000',
  },
  chipButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  chipButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Results Details Styling (Figma Design)
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  resultsTopSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  resultsPrimaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  resultsPrimaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  resultsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  resultsCol: {
    flex: 1,
    alignItems: 'center',
  },
  resultsColSeparator: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
  },
  resultsColLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  resultsColValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  compareLendersButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  compareLendersButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Lenders Figma Design Styling
  lendersContainer: {
    gap: 14,
  },
  lenderFigmaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  lenderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  lenderBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lenderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderNameContainer: {
    marginLeft: 12,
  },
  lenderBrandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  lenderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  lenderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lenderRateCol: {
    alignItems: 'flex-end',
  },
  lenderRateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  lenderPerAnnumText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  lenderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  lenderStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  lenderStatBlock: {
    justifyContent: 'center',
  },
  lenderStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  lenderStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lenderApplyButton: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingHorizontal: 22,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderApplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Application Screen Figma Styling
  preApprovedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  preApprovedBannerText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Success Screen Figma Styling
  successScreenContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successCircleOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCircleInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successMainSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successDetailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  successDetailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  backHomeButtonFigma: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
