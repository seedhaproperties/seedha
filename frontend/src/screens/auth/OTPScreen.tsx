import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RefreshCw, Phone } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function OTPScreen() {
  const { currentScreen, push, pop, completeAuth, signIn } = useApp();
  const { phone = '', mode = 'login' } = (currentScreen.params ?? {}) as { phone: string; mode: string };

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(26);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<any[]>([]);

  const last4 = phone && phone.length >= 4 ? phone.slice(-4) : '6758';
  const maskedPhone = `+91 ****${last4}`;
  const otp = digits.join('');

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c: number) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const next = [...digits];
      pasted.forEach((ch, idx) => {
        if (i + idx < 6) next[i + idx] = ch;
      });
      setDigits(next);
      const nextFocus = Math.min(i + pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...digits];
    next[i] = clean.slice(-1);
    setDigits(next);
    if (clean && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyPress = (i: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (completeAuth) {
        completeAuth({
          id: `usr_${phone || 'verified'}`,
          name: mode === 'signup' ? 'New Property User' : 'Verified User',
          phone: `+91 ${phone || '9876543210'}`,
          email: `user_${(phone || '5678').slice(-4)}@seedhaproperties.com`,
          city: 'Hyderabad',
          role: 'USER',
        });
      } else if (signIn) {
        signIn({ name: 'Verified User', phone });
      } else {
        pop();
      }
    }, 800);
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
          {/* Top Row: Circular Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={pop} style={styles.backButton} activeOpacity={0.8}>
              <ChevronLeft size={22} color="#0F172A" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Verification Container */}
          <View style={styles.verifyContainer}>
            {/* Soft Grey Phone Handset Box */}
            <View style={styles.phoneIconBox}>
              <Phone size={24} color="#0F172A" strokeWidth={2.2} />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.verifyHeading}>Verify your number</Text>
            <Text style={styles.verifySubHeading}>
              Enter the 6-digit code sent to {maskedPhone}
            </Text>

            {/* 6 Digit Input Boxes */}
            <View style={styles.digitsRow}>
              {digits.map((d: string, i: number) => (
                <TextInput
                  key={i}
                  ref={(el: any) => {
                    if (el) inputRefs.current[i] = el;
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={d}
                  onChangeText={(text: string) => handleChange(i, text)}
                  onKeyPress={(e) => handleKeyPress(i, e)}
                  style={[
                    styles.digitBox,
                    d ? styles.digitBoxFilled : null,
                    Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0, outline: 'none', boxShadow: 'none' } as any),
                  ]}
                  autoFocus={i === 0}
                />
              ))}
            </View>

            {/* Action Button: Verify & Continue */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              style={styles.verifyBtn}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            {/* Footer matching image: Didn't receive the code? Resend in 00:26 Change Number */}
            <View style={styles.verifyFooter}>
              <Text style={styles.didNotReceiveText}>Didn't receive the code?</Text>
              {canResend ? (
                <TouchableOpacity
                  onPress={() => {
                    setCountdown(30);
                    setCanResend(false);
                  }}
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
                onPress={pop}
                style={styles.changeNumberBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.changeNumberText}>Change Number</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 8,
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
    marginBottom: 20,
  },
  verifyHeading: {
    fontSize: 28,
    fontWeight: '700',
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
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  digitBox: {
    flex: 1,
    minWidth: 42,
    maxWidth: 48,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
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
  digitBoxFilled: {
    borderColor: '#0F172A',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  verifyBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifyFooter: {
    marginTop: 36,
    alignItems: 'center',
  },
  didNotReceiveText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  resendCountdownText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
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
  changeNumberBtn: {
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
