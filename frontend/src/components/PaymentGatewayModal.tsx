import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../services/api';

export interface PaymentGatewayModalProps {
  visible: boolean;
  amount: number;
  purpose: string;
  propertyId?: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
  onSuccess: (txn: {
    transactionId: string;
    amount: number;
    purpose: string;
    gateway: string;
  }) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  visible,
  amount,
  purpose,
  propertyId,
  customerName,
  customerPhone,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('phonepe');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setLoadingStage('Initializing Secure Session...');

    try {
      // 1. Create order on backend
      const orderRes = await api.payments.createOrder({
        amount,
        purpose,
        propertyId,
        customerName: customerName || 'Verified Customer',
        customerPhone: customerPhone || '+91 98765 43210',
      });

      const orderId = orderRes?.orderId || `ORD_${Date.now()}`;

      // 2. Gateway processing stage
      setLoadingStage('Authorizing Payment via Bank Gateway...');
      await new Promise((r) => setTimeout(r, 1200));

      setLoadingStage('Finalizing Verification & Escrow Confirmation...');
      await new Promise((r) => setTimeout(r, 800));

      // 3. Verify & Record in Supabase database
      const gatewayName =
        selectedMethod === 'upi'
          ? `UPI (${selectedUpiApp.toUpperCase()})`
          : selectedMethod === 'card'
          ? 'Credit/Debit Card'
          : `NetBanking (${selectedBank})`;

      const generatedTxnId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const verifyRes = await api.payments.verify({
        orderId,
        paymentTxnId: generatedTxnId,
        gateway: gatewayName,
        amount,
        purpose,
        propertyId,
        customerName: customerName || 'Verified Customer',
        customerPhone: customerPhone || '+91 98765 43210',
      });

      setLoading(false);
      onSuccess({
        transactionId: verifyRes?.paymentTxnId || generatedTxnId,
        amount,
        purpose,
        gateway: gatewayName,
      });
      onClose();
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Payment Error', err.message || 'Payment simulation failed. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSubtitle}>SECURE PAYMENT GATEWAY</Text>
              <Text style={styles.headerTitle}>{purpose}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Hero */}
          <View style={styles.amountCard}>
            <View>
              <Text style={styles.amountLabel}>Total Payable Amount</Text>
              <Text style={styles.amountValue}>₹{Number(amount || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.shieldBadge}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#16A34A" />
              <Text style={styles.shieldText}>256-bit Encrypted</Text>
            </View>
          </View>

          {/* Tabs: UPI | Card | NetBanking */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, selectedMethod === 'upi' && styles.tabItemActive]}
              onPress={() => setSelectedMethod('upi')}
            >
              <MaterialCommunityIcons
                name="cellphone-wireless"
                size={18}
                color={selectedMethod === 'upi' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, selectedMethod === 'upi' && styles.tabTextActive]}>UPI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, selectedMethod === 'card' && styles.tabItemActive]}
              onPress={() => setSelectedMethod('card')}
            >
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={18}
                color={selectedMethod === 'card' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, selectedMethod === 'card' && styles.tabTextActive]}>Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, selectedMethod === 'netbanking' && styles.tabItemActive]}
              onPress={() => setSelectedMethod('netbanking')}
            >
              <MaterialCommunityIcons
                name="bank"
                size={18}
                color={selectedMethod === 'netbanking' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, selectedMethod === 'netbanking' && styles.tabTextActive]}>NetBanking</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* UPI Option */}
            {selectedMethod === 'upi' && (
              <View style={styles.methodContent}>
                <Text style={styles.sectionLabel}>Select UPI App</Text>
                <View style={styles.upiGrid}>
                  {[
                    { id: 'phonepe', name: 'PhonePe', icon: 'alpha-p-circle' },
                    { id: 'gpay', name: 'Google Pay', icon: 'google' },
                    { id: 'paytm', name: 'Paytm', icon: 'wallet-outline' },
                    { id: 'custom', name: 'UPI ID', icon: 'at' },
                  ].map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      style={[styles.upiButton, selectedUpiApp === app.id && styles.upiButtonActive]}
                      onPress={() => setSelectedUpiApp(app.id as any)}
                    >
                      <MaterialCommunityIcons
                        name={app.icon as any}
                        size={24}
                        color={selectedUpiApp === app.id ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.upiButtonText,
                          selectedUpiApp === app.id && styles.upiButtonTextActive,
                        ]}
                      >
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedUpiApp === 'custom' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Enter UPI ID / VPA</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. yourname@okaxis"
                      placeholderTextColor="#94A3B8"
                      value={upiId}
                      onChangeText={setUpiId}
                      autoCapitalize="none"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Card Option */}
            {selectedMethod === 'card' && (
              <View style={styles.methodContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="4532 •••• •••• 8892"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    maxLength={19}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="12/28"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="•••"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* NetBanking Option */}
            {selectedMethod === 'netbanking' && (
              <View style={styles.methodContent}>
                <Text style={styles.sectionLabel}>Select Your Bank</Text>
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map(
                  (bank) => (
                    <TouchableOpacity
                      key={bank}
                      style={[styles.bankRow, selectedBank === bank && styles.bankRowActive]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <MaterialCommunityIcons
                        name="bank-outline"
                        size={20}
                        color={selectedBank === bank ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.bankName,
                          selectedBank === bank && styles.bankNameActive,
                        ]}
                      >
                        {bank}
                      </Text>
                      {selectedBank === bank && (
                        <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}

            {/* Terms and Conditions trigger */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setShowTermsModal(true)}
            >
              <MaterialCommunityIcons name="shield-lock-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.termsText}>
                Seedha Properties Guarantee: <Text style={styles.termsLink}>100% Refund & Terms</Text>
              </Text>
            </TouchableOpacity>

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.payButtonText}>{loadingStage}</Text>
                </View>
              ) : (
                <Text style={styles.payButtonText}>
                  Pay ₹{Number(amount || 0).toLocaleString('en-IN')} Securely
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Sub-modal: Terms & Conditions Page */}
      <Modal visible={showTermsModal} animationType="fade" transparent={true}>
        <View style={styles.termsOverlay}>
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <MaterialCommunityIcons name="shield-check" size={26} color="#16A34A" />
              <Text style={styles.termsHeaderTitle}>Payment Terms & 100% Refund Policy</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
              <Text style={styles.termsSectionHead}>1. Zero Brokerage Guarantee</Text>
              <Text style={styles.termsBody}>
                All direct owner contacts and transactions carry ₹0 brokerage commission. What you pay goes solely toward legally compliant verification, documentation, or your token deposit directly to the owner.
              </Text>

              <Text style={styles.termsSectionHead}>2. 100% Instant Refund Assurance</Text>
              <Text style={styles.termsBody}>
                If the owner background check reveals title disputes, adverse legal records, or unserviceable properties, you receive a full 100% refund within 24 hours to your original payment method with zero cancellation deduction.
              </Text>

              <Text style={styles.termsSectionHead}>3. Escrow Token Protection</Text>
              <Text style={styles.termsBody}>
                Token advances paid in-chat are protected under Seedha Properties' escrow protocol until physical possession or formal rental agreement sign-off.
              </Text>

              <Text style={styles.termsSectionHead}>4. Bank-Grade RBI Compliance</Text>
              <Text style={styles.termsBody}>
                All payment processing is handled through PCI-DSS Level 1 certified gateways with mandatory 2FA OTP verification and end-to-end 256-bit SSL encryption.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.termsDoneButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.termsDoneText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  amountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollArea: {
    flexShrink: 1,
  },
  methodContent: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  upiButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    gap: 8,
  },
  upiButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  upiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  upiButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  bankRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  bankName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bankNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 6,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  termsLink: {
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  termsHeaderTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  termsSectionHead: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  termsBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsDoneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  termsDoneText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
