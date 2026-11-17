import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Phone, User, Mail, Lock, ShieldCheck, CheckCircle2, Check } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import SeedhaLogo from '../../components/SeedhaLogo';
import { api } from '../../services/api';
import { startGoogleSignIn } from '../../services/googleAuth';

function IndiaFlag({ width = 22, height = 15 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 20" style={{ borderRadius: 2, overflow: 'hidden' }}>
      <Path d="M0 0h30v6.67H0z" fill="#FF9933" />
      <Path d="M0 6.67h30v6.67H0z" fill="#FFFFFF" />
      <Path d="M0 13.34h30v6.67H0z" fill="#138808" />
      <Circle cx="15" cy="10" r="2.5" fill="none" stroke="#000080" strokeWidth="0.6" />
      <Circle cx="15" cy="10" r="0.6" fill="#000080" />
    </Svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.83 1.46-.61.71-1.15 1.87-1.01 2.98 1.08.08 2.19-.53 2.85-1.34z" />
    </Svg>
  );
}

export default function MobileLoginScreen() {
  const { currentScreen, cancelAuth, completeAuth, pendingAction, isAuthenticated, setTab } = useApp();
  const initialMode = currentScreen.name === 'signup' ? 'signup' : 'signin';
  const actionName =
    typeof currentScreen.params?.actionName === 'string'
      ? currentScreen.params.actionName
      : typeof pendingAction?.actionName === 'string'
        ? pendingAction.actionName
        : null;
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [fullName, setFullName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [phone, setPhone] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(26);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<any[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (step !== 'otp') return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  // Strip browser focus outline / black rectangular box on web inputs
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'seedha-clean-inputs';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          input, textarea, select {
            outline: none !important;
            outline-style: none !important;
            outline-width: 0 !important;
            box-shadow: none !important;
            border-style: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          input:focus, textarea:focus, select:focus {
            outline: none !important;
            outline-style: none !important;
            outline-width: 0 !important;
            box-shadow: none !important;
            border-style: none !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setIsPhoneVerified(false);
    if (errorMessage) setErrorMessage(null);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async (inputTarget?: string) => {
    let target = inputTarget;

    if (!target) {
      if (authMethod === 'phone') {
        if (phone.length !== 10) {
          setErrorMessage('Please enter a valid 10-digit mobile number');
          return;
        }
        target = `+91${phone}`;
      } else {
        const cleanEmail = email.trim().toLowerCase();
        if (!isEmailValid) {
          setErrorMessage('Please enter a valid email address');
          return;
        }
        target = cleanEmail;
      }
    }

    if (mode === 'signup' && !isPhoneVerified && !fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await api.auth.sendOtp(target);
      setLoading(false);
      setStep('otp');
      setCountdown(26);
      setCanResend(false);
      setInfoMessage(
        res?.message || (target.includes('@') ? `Code sent to ${target}` : `Code sent to ${target}`)
      );
    } catch (err: any) {
      console.warn('[MobileLogin] sendOtp error:', err.message);
      setLoading(false);
      setErrorMessage(err.message || 'Unable to send verification code. Please check your network and try again.');
    }
  };

  const handleResendOtp = async () => {
    const fullIdentifier = authMethod === 'email' ? email.trim().toLowerCase() : `+91${phone}`;
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      await api.auth.resendOtp(fullIdentifier);
      setLoading(false);
      setCountdown(30);
      setCanResend(false);
      setInfoMessage('A new verification code has been sent.');
    } catch (err: any) {
      console.warn('[MobileLogin] resendOtp error:', err.message);
      setLoading(false);
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
    }
  };

  const handleCompleteSignup = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters)');
      return;
    }
    if (authMethod === 'phone' && phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (authMethod === 'email' && !isEmailValid) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await api.auth.completeSignup({
        name: fullName.trim(),
        phone: phone ? `+91${phone}` : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
      });
      setLoading(false);
      if (res?.user && (res.accessToken || res.token)) {
        completeAuth(res.user, res.accessToken || res.token);
        setTab('home');
      } else {
        setErrorMessage('Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      console.warn('[MobileLogin] completeSignup error:', err.message);
      setLoading(false);
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    }
  };

  const handleAppleButtonPress = () => {
    setErrorMessage('Apple Sign-In is only supported on Apple iOS devices with FaceID/TouchID. Please log in with your mobile number.');
  };

  const handleGoogleButtonPress = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      const result = await startGoogleSignIn();

      if (result.canceled) {
        setGoogleLoading(false);
        return;
      }

      if (result.success && (result.code || result.idToken || result.accessToken)) {
        // Exchange authorization code (PKCE) or verify tokens via backend
        const res = await api.auth.googleLogin({
          code: result.code,
          codeVerifier: result.codeVerifier,
          redirectUri: result.redirectUri,
          idToken: result.idToken,
          accessToken: result.accessToken,
        });
        setGoogleLoading(false);
        if (res?.user && (res.accessToken || res.token)) {
          completeAuth(res.user, res.accessToken || res.token);
          setTab('home');
        } else {
          setErrorMessage('Google authentication could not be completed.');
        }
        return;
      }

      setGoogleLoading(false);
      const msg = result.error || 'Google Sign-In is currently unavailable. Please log in with your mobile number.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web' && result.error) {
        Alert.alert('Notice', msg);
      }
    } catch (err: any) {
      setGoogleLoading(false);
      const msg = err.message || 'Failed to start Google Sign-In. Please log in with your mobile number.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Notice', msg);
      }
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      pasted.forEach((ch, idx) => {
        if (index + idx < 6) next[index + idx] = ch;
      });
      setOtpDigits(next);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean.slice(-1);
    setOtpDigits(next);
    if (errorMessage) setErrorMessage(null);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const otpCode = otpDigits.join('');
  const maskedPhone = phone.length >= 4 ? `+91 ••••• ${phone.slice(-4)}` : (phone ? `+91 ${phone}` : '+91 Mobile');
  const emailParts = email.trim().split('@');
  const maskedEmail =
    emailParts.length === 2
      ? `${emailParts[0].slice(0, 2)}••••@${emailParts[1]}`
      : email;
  const maskedTarget = authMethod === 'email' ? maskedEmail : maskedPhone;

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const fullIdentifier = authMethod === 'email' ? email.trim().toLowerCase() : `+91${phone}`;

    try {
      const res = await api.auth.verifyOtp(
        fullIdentifier,
        otpCode,
        mode === 'signup' && fullName.trim() ? fullName.trim() : undefined
      );
      setLoading(false);

      // Requirement 2: New user redirected to Signup after OTP verification
      if (res?.isNewUser) {
        setIsPhoneVerified(true);
        setMode('signup');
        setStep('phone');
        setInfoMessage(
          authMethod === 'email'
            ? 'Email verified! Please enter your name to complete registration.'
            : 'Mobile number verified! Please enter your name to complete registration.'
        );
        return;
      }

      // Requirement 3: Existing user logs in directly
      if (res?.user && (res.accessToken || res.token)) {
        completeAuth(
          fullName.trim() ? { ...res.user, name: fullName.trim() } : res.user,
          res.accessToken || res.token
        );
        setTab('home');
      } else {
        setErrorMessage('Verification failed. Invalid response received from server.');
      }
    } catch (err: any) {
      console.warn('[MobileLogin] verifyOtp error:', err.message);
      setLoading(false);
      setErrorMessage(err.message || 'Invalid verification code. Please check and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row: Back Button */}
          <View style={styles.topBar}>
            {step === 'otp' ? (
              <TouchableOpacity
                onPress={() => setStep('phone')}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <ChevronLeft size={22} color="#0F172A" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : isAuthenticated ? (
              <TouchableOpacity
                onPress={cancelAuth}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <ChevronLeft size={22} color="#0F172A" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Logo - only on Phone Sign In / Sign Up step */}
          {step === 'phone' && (
            <View style={styles.logoWrap}>
              <SeedhaLogo size="md" />
            </View>
          )}

          {/* Step 1: Phone / Social Login matching image */}
          {step === 'phone' ? (
            <View style={styles.formContent}>
              {/* Info banner (e.g. redirected after OTP verification to enter name) */}
              {infoMessage && (
                <View style={styles.infoBanner}>
                  <CheckCircle2 size={16} color="#059669" strokeWidth={2.2} />
                  <Text style={styles.infoBannerText}>{infoMessage}</Text>
                </View>
              )}

              {/* Headings */}
              <Text style={styles.heading}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </Text>
              <Text style={styles.subHeading}>
                {mode === 'signin'
                  ? 'Sign in to continue your property journey.'
                  : 'Join Seedha Properties and make your property journey easier.'}
              </Text>

              {/* Full Name Field (only on Create your account) */}
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.nameInputRow,
                      isNameFocused && styles.inputRowActive,
                    ]}
                  >
                    <User size={18} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                    <TextInput
                      style={[
                        styles.nameTextInput,
                        Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0, outline: 'none', boxShadow: 'none' } as any),
                      ]}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94A3B8"
                      value={fullName}
                      onChangeText={(text) => {
                        setFullName(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      autoFocus={mode === 'signup'}
                    />
                  </View>
                </View>
              )}

              {/* Toggle Switcher: Mobile OTP vs Email OTP */}
              <View style={styles.methodToggleWrap}>
                <TouchableOpacity
                  style={[
                    styles.methodToggleBtn,
                    authMethod === 'phone' && styles.methodToggleBtnActive,
                  ]}
                  onPress={() => {
                    setAuthMethod('phone');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Phone
                    size={15}
                    color={authMethod === 'phone' ? '#0F172A' : '#64748B'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.methodToggleText,
                      authMethod === 'phone' && styles.methodToggleTextActive,
                    ]}
                  >
                    Mobile OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodToggleBtn,
                    authMethod === 'email' && styles.methodToggleBtnActive,
                  ]}
                  onPress={() => {
                    setAuthMethod('email');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Mail
                    size={15}
                    color={authMethod === 'email' ? '#0F172A' : '#64748B'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.methodToggleText,
                      authMethod === 'email' && styles.methodToggleTextActive,
                    ]}
                  >
                    Email OTP
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Label */}
              <Text style={styles.inputLabel}>
                {authMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
              </Text>

              {/* Input Field: Phone or Email */}
              {authMethod === 'phone' ? (
                <View
                  style={[
                    styles.phoneInputRow,
                    phone.length === 10 && styles.phoneInputRowActive,
                  ]}
                >
                  {/* Flag + Country Code */}
                  <View style={styles.countryWrap}>
                    <IndiaFlag width={22} height={15} />
                    <Text style={styles.countryCode}>+91</Text>
                  </View>

                  {/* Vertical Divider */}
                  <View style={styles.inputDivider} />

                  {/* Phone Input */}
                  <TextInput
                    style={[
                      styles.phoneInput,
                      Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0, outline: 'none', boxShadow: 'none' } as any),
                    ]}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    autoFocus={false}
                  />

                  {/* Green Valid Checkmark Circle (matching screenshot) */}
                  {phone.length === 10 && (
                    <View style={styles.validCheckCircle}>
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={[
                    styles.phoneInputRow,
                    isEmailValid && styles.phoneInputRowActive,
                  ]}
                >
                  <View style={styles.emailIconWrap}>
                    <Mail size={18} color="#64748B" strokeWidth={2} />
                  </View>

                  {/* Vertical Divider */}
                  <View style={styles.inputDivider} />

                  {/* Email Input */}
                  <TextInput
                    style={[
                      styles.phoneInput,
                      Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0, outline: 'none', boxShadow: 'none' } as any),
                    ]}
                    placeholder="Enter your email address"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setIsPhoneVerified(false);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    autoFocus={false}
                  />

                  {/* Green Valid Checkmark Circle */}
                  {isEmailValid && (
                    <View style={styles.validCheckCircle}>
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
              )}

              {/* Helper text on Signup */}
              {mode === 'signup' && (
                <Text style={styles.phoneHelperText}>
                  {authMethod === 'phone'
                    ? "We'll send a verification code to this mobile number"
                    : "We'll send a verification code to this email address"}
                </Text>
              )}

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

              {/* Action Button: Send OTP / Continue / Create Account */}
              <TouchableOpacity
                onPress={() => {
                  if (mode === 'signup' && isPhoneVerified) {
                    handleCompleteSignup();
                  } else {
                    handleSendOtp();
                  }
                }}
                disabled={loading || googleLoading}
                style={styles.continueBtn}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueBtnText}>
                    {mode === 'signup'
                      ? isPhoneVerified
                        ? 'Create Account'
                        : 'Send OTP'
                      : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider: or sign up with / or continue with */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {mode === 'signup' ? 'or sign up with' : 'or continue with'}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={handleGoogleButtonPress}
                disabled={loading || googleLoading}
                activeOpacity={0.85}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <>
                    <GoogleIcon size={20} />
                    <Text style={styles.socialBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, styles.socialBtnApple]}
                onPress={handleAppleButtonPress}
                activeOpacity={0.85}
              >
                <AppleIcon size={20} />
                <Text style={styles.socialBtnText}>Continue with Apple</Text>
              </TouchableOpacity>

              {/* Footer Toggle: Already have an account? Log In / Don't have an account? Create Account */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleQuestion}>
                  {mode === 'signup'
                    ? 'Already have an account? '
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
                    setErrorMessage(null);
                    setInfoMessage(null);
                    setIsPhoneVerified(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleAction}>
                    {mode === 'signup' ? 'Log In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Terms and Privacy Disclaimer (only on signin) */}
              {mode === 'signin' && (
                <Text style={styles.disclaimerText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.disclaimerLink}>Terms & Conditions</Text> and{' '}
                  <Text style={styles.disclaimerLink}>Privacy Policy</Text>
                </Text>
              )}
            </View>
          ) : (
            /* Step 2: OTP Verification matching image */
            <View style={styles.verifyContainer}>
              {/* Phone / Email Icon Box */}
              <View style={styles.phoneIconBox}>
                {authMethod === 'email' ? (
                  <Mail size={24} color="#000000" strokeWidth={2} />
                ) : (
                  <Phone size={24} color="#000000" strokeWidth={2} />
                )}
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.verifyHeading}>
                {authMethod === 'email' ? 'Verify your email' : 'Verify your number'}
              </Text>
              <Text style={styles.verifySubHeading}>
                Enter the 6-digit code sent to {maskedTarget}
              </Text>

              {/* 6 Digit Inputs */}
              <View style={styles.digitsRow}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el: any) => {
                      if (el) otpInputRefs.current[idx] = el;
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleDigitChange(idx, text)}
                    onKeyPress={(e) => handleKeyPress(idx, e)}
                    style={[
                      styles.digitBox,
                      digit ? styles.digitBoxFilled : null,
                      Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0, outline: 'none', boxShadow: 'none' } as any),
                    ]}
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

              {/* Verify & Continue Button */}
              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={loading}
                style={styles.continueBtn}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.continueBtnText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              {/* Footer matching image: Didn't receive the code? Resend in 00:26 Change Number */}
              <View style={styles.verifyFooter}>
                <Text style={styles.didNotReceiveText}>Didn't receive the code?</Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    style={styles.resendActionBtn}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={13} color="#0F172A" strokeWidth={2.2} />
                    <Text style={styles.resendActionText}>Resend Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendCountdownText}>
                    Resend in 00:{String(countdown).padStart(2, '0')}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setStep('phone');
                    setOtpDigits(['', '', '', '', '', '']);
                    setErrorMessage(null);
                  }}
                  style={styles.changeNumberBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeNumberText}>
                    {authMethod === 'email' ? 'Change Email' : 'Change Number'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appleContainer: {
    paddingTop: 8,
  },
  appleBadgeBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appleHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appleSubHeading: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 28,
  },
  appleAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  appleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appleAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appleAccountInfo: {
    flex: 1,
  },
  appleAccountName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  appleAccountEmail: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 3,
  },
  hideEmailCard: {
    backgroundColor: '#EEF2F6',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  hideEmailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hideEmailTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  hideEmailDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 8,
    marginLeft: 28,
  },
  differentAppleBtn: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  differentAppleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  securityBannerText: {
    fontSize: 12.5,
    color: '#15803D',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoWrap: {
    marginTop: 4,
    marginBottom: 28,
  },
  formContent: {
    marginTop: 0,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 32,
  },
  methodToggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    marginTop: 4,
  },
  methodToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 7,
  },
  methodToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  methodToggleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  methodToggleTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  emailIconWrap: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  nameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  inputRowActive: {
    borderColor: '#000000',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  nameTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: 56,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? ({
        outlineWidth: 0,
        outlineStyle: 'none',
        outlineColor: 'transparent',
        boxShadow: 'none',
      } as any)
      : {}),
  },
  phoneHelperText: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  phoneInputRowActive: {
    borderColor: '#000000',
    borderWidth: 1.5,
  },
  validCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  countryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: 56,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? ({
        outlineWidth: 0,
        outlineStyle: 'none',
        outlineColor: 'transparent',
        boxShadow: 'none',
      } as any)
      : {}),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#065F46',
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12.5,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12.5,
    color: '#059669',
    marginTop: 8,
    fontWeight: '500',
  },
  continueBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 26,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginHorizontal: 14,
    fontWeight: '500',
  },
  socialBtn: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  socialBtnApple: {
    marginBottom: 44,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  toggleQuestion: {
    fontSize: 14,
    color: '#64748B',
  },
  toggleAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  disclaimerLink: {
    color: '#0F172A',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  verifyContainer: {
    paddingTop: 8,
  },
  phoneIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  verifyHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  verifySubHeading: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 36,
  },
  phoneSentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  boldPhone: {
    fontWeight: '700',
    color: '#0F172A',
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 13.5,
    color: '#2563EB',
    fontWeight: '600',
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
  },
  digitBox: {
    flex: 1,
    minWidth: 0,
    maxWidth: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 3,
    ...(Platform.OS === 'web'
      ? ({
        outlineWidth: 0,
        outlineStyle: 'none',
        outlineColor: 'transparent',
        boxShadow: 'none',
      } as any)
      : {}),
  },
  digitBoxFilled: {
    borderColor: '#000000',
    borderWidth: 1.5,
  },
  verifyFooter: {
    marginTop: 28,
    alignItems: 'center',
  },
  didNotReceiveText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  resendCountdownText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 18,
  },
  changeNumberBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendNote: {
    fontSize: 13,
    color: '#64748B',
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
