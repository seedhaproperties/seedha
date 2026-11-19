import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Check,
  RotateCcw,
  Smartphone,
  CreditCard,
  Landmark,
  Shield,
  Lock,
  Download,
  X,
  Plus,
  CheckCircle2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  amountLabel: string;
  status: 'Paid' | 'Pending' | 'Refunded';
  paidFor: string;
  paidTo: string;
  dateTime: string;
  paymentMethod: string;
  referenceId: string;
  baseAmount: string;
  gstAmount: string;
  totalAmount: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'bank';
  title: string;
  subtitle: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Rental agreement draft',
    subtitle: '12 Nov 2026 · UPI',
    amount: 599,
    amountLabel: '₹599',
    status: 'Paid',
    paidFor: 'Rental agreement draft',
    paidTo: 'Seedha Properties',
    dateTime: '12 Nov 2026, 11:42 AM',
    paymentMethod: 'UPI',
    referenceId: 'SP-RA-200418',
    baseAmount: '₹508',
    gstAmount: '₹91',
    totalAmount: '₹599',
  },
  {
    id: 'tx-2',
    title: 'Verified owner & property details',
    subtitle: '24 Oct 2026 · Visa •• 4421',
    amount: 799,
    amountLabel: '₹799',
    status: 'Paid',
    paidFor: 'Verified owner & property details',
    paidTo: 'Seedha Properties',
    dateTime: '24 Oct 2026, 3:15 PM',
    paymentMethod: 'Visa •• 4421',
    referenceId: 'SP-VO-189320',
    baseAmount: '₹677',
    gstAmount: '₹122',
    totalAmount: '₹799',
  },
  {
    id: 'tx-3',
    title: 'Property verification report',
    subtitle: '18 Oct 2026 · UPI',
    amount: 799,
    amountLabel: '₹799',
    status: 'Refunded',
    paidFor: 'Property verification report',
    paidTo: 'Seedha Properties',
    dateTime: '18 Oct 2026, 10:20 AM',
    paymentMethod: 'UPI',
    referenceId: 'SP-VR-176542',
    baseAmount: '₹677',
    gstAmount: '₹122',
    totalAmount: '₹799',
  },
  {
    id: 'tx-4',
    title: 'Token amount - Site visit',
    subtitle: '14 Oct 2026 · Net banking',
    amount: 5000,
    amountLabel: '₹5,000',
    status: 'Pending',
    paidFor: 'Token amount - Site visit',
    paidTo: 'Seedha Properties Escrow',
    dateTime: '14 Oct 2026, 5:30 PM',
    paymentMethod: 'Net banking (HDFC)',
    referenceId: 'SP-SV-165901',
    baseAmount: '₹5,000',
    gstAmount: '₹0',
    totalAmount: '₹5,000',
  },
  {
    id: 'tx-5',
    title: 'Home loan processing fee',
    subtitle: '2 Oct 2026 · Visa •• 4421',
    amount: 2500,
    amountLabel: '₹2,500',
    status: 'Paid',
    paidFor: 'Home loan processing fee',
    paidTo: 'Seedha Properties Banking Desk',
    dateTime: '2 Oct 2026, 1:00 PM',
    paymentMethod: 'Visa •• 4421',
    referenceId: 'SP-HL-152003',
    baseAmount: '₹2,119',
    gstAmount: '₹381',
    totalAmount: '₹2,500',
  },
];

const INITIAL_SAVED_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'upi',
    title: 'UPI',
    subtitle: 'aarav@oksbi',
  },
  {
    id: 'pm-2',
    type: 'card',
    title: 'Visa •• 4421',
    subtitle: 'Expires 08/28',
  },
];

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra',
  'Punjab National Bank',
];

export default function PaymentsScreen() {
  const { pop, setTab } = useApp();
  const insets = useSafeAreaInsets();

  // Filters: 'All' | 'Paid' | 'Pending' | 'Refunded'
  const [activeFilter, setActiveFilter] = useState<'All' | 'Paid' | 'Pending' | 'Refunded'>('All');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Saved Payment Methods State
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>(INITIAL_SAVED_METHODS);

  // Add Payment Method Modal State
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [addMethodTab, setAddMethodTab] = useState<'upi' | 'card' | 'bank'>('upi');

  // UPI Form State
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isDefaultUpi, setIsDefaultUpi] = useState(false);

  // Card Form State
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardHolderInput, setCardHolderInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardCvvInput, setCardCvvInput] = useState('');
  const [isDefaultCard, setIsDefaultCard] = useState(true);

  // Bank Form State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isDefaultBank, setIsDefaultBank] = useState(true);

  // Filtering transactions
  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'Paid') return t.status === 'Paid';
    if (activeFilter === 'Pending') return t.status === 'Pending';
    if (activeFilter === 'Refunded') return t.status === 'Refunded';
    return true;
  });

  const handleRemoveMethod = (id: string, title: string) => {
    Alert.alert('Remove Payment Method', `Remove "${title}" from your account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setSavedMethods((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const handleSaveMethod = () => {
    if (addMethodTab === 'upi') {
      if (!upiIdInput.trim()) {
        Alert.alert('Required', 'Please enter a valid UPI ID.');
        return;
      }
      setSavedMethods((prev) => [
        ...prev,
        {
          id: `pm-${Date.now()}`,
          type: 'upi',
          title: 'UPI',
          subtitle: upiIdInput.trim(),
        },
      ]);
    } else if (addMethodTab === 'card') {
      if (!cardNumberInput.trim()) {
        Alert.alert('Required', 'Please enter a card number.');
        return;
      }
      const last4 = cardNumberInput.replace(/\s+/g, '').slice(-4) || '1234';
      setSavedMethods((prev) => [
        ...prev,
        {
          id: `pm-${Date.now()}`,
          type: 'card',
          title: `Card •• ${last4}`,
          subtitle: `Expires ${cardExpiryInput || '12/28'}`,
        },
      ]);
    } else if (addMethodTab === 'bank') {
      setSavedMethods((prev) => [
        ...prev,
        {
          id: `pm-${Date.now()}`,
          type: 'bank',
          title: selectedBank,
          subtitle: 'Net Banking',
        },
      ]);
    }

    setShowAddMethodModal(false);
    Alert.alert('Saved', 'New payment method has been added successfully.');
    // Reset forms
    setUpiIdInput('');
    setCardNumberInput('');
    setCardHolderInput('');
    setCardExpiryInput('');
    setCardCvvInput('');
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
            <Text style={styles.pageTitle}>Payments & Transactions</Text>
            <Text style={styles.subtitle}>Invoices, receipts & history</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Paid Hero Dark Card */}
        <View style={styles.totalPaidCard}>
          <Text style={styles.totalPaidLabel}>Total paid</Text>
          <Text style={styles.totalPaidAmount}>₹3,898</Text>

          <View style={styles.totalStatsRow}>
            <View style={styles.statPill}>
              <Check size={12} color="#CBD5E1" strokeWidth={2.4} />
              <Text style={styles.statPillText}>3 payments</Text>
            </View>

            <View style={styles.statPill}>
              <RotateCcw size={11} color="#CBD5E1" strokeWidth={2.2} />
              <Text style={styles.statPillText}>1 refund</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterPillsRow}>
          {(['All', 'Paid', 'Pending', 'Refunded'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {filteredTransactions.map((tx) => {
            const isPaid = tx.status === 'Paid';
            const isPending = tx.status === 'Pending';
            const isRefunded = tx.status === 'Refunded';

            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.txCard}
                onPress={() => setSelectedTransaction(tx)}
                activeOpacity={0.75}
              >
                <View style={styles.txInfoCol}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                </View>

                <View style={styles.txAmountCol}>
                  <Text style={styles.txAmount}>{tx.amountLabel}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      isPaid && styles.statusPillPaid,
                      isPending && styles.statusPillPending,
                      isRefunded && styles.statusPillRefunded,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isPaid && styles.statusTextPaid,
                        isPending && styles.statusTextPending,
                        isRefunded && styles.statusTextRefunded,
                      ]}
                    >
                      {tx.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Saved payment methods Section */}
        <View style={styles.savedSection}>
          <Text style={styles.sectionHeading}>Saved payment methods</Text>

          <View style={styles.methodsList}>
            {savedMethods.map((m) => (
              <View key={m.id} style={styles.methodCard}>
                <View style={styles.methodIconBox}>
                  {m.type === 'upi' ? (
                    <Smartphone size={18} color="#64748B" strokeWidth={2.2} />
                  ) : m.type === 'card' ? (
                    <CreditCard size={18} color="#64748B" strokeWidth={2.2} />
                  ) : (
                    <Landmark size={18} color="#64748B" strokeWidth={2.2} />
                  )}
                </View>

                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>{m.title}</Text>
                  <Text style={styles.methodSub}>{m.subtitle}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleRemoveMethod(m.id, m.title)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* + Add payment method button */}
            <TouchableOpacity
              style={styles.addMethodBtn}
              onPress={() => setShowAddMethodModal(true)}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#1E293B" strokeWidth={2.4} />
              <Text style={styles.addMethodText}>Add payment method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL 1: Transaction details (Image 2)                    */}
      {/* ========================================================= */}
      <Modal
        visible={Boolean(selectedTransaction)}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction details</Text>
              <TouchableOpacity
                onPress={() => setSelectedTransaction(null)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Amount */}
                <View style={styles.txHeroSection}>
                  <Text style={styles.txHeroAmount}>{selectedTransaction.amountLabel}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      selectedTransaction.status === 'Paid' && styles.statusPillPaid,
                      selectedTransaction.status === 'Pending' && styles.statusPillPending,
                      selectedTransaction.status === 'Refunded' && styles.statusPillRefunded,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        selectedTransaction.status === 'Paid' && styles.statusTextPaid,
                        selectedTransaction.status === 'Pending' && styles.statusTextPending,
                        selectedTransaction.status === 'Refunded' && styles.statusTextRefunded,
                      ]}
                    >
                      {selectedTransaction.status}
                    </Text>
                  </View>
                </View>

                {/* Details Table */}
                <View style={styles.detailsTable}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Paid for</Text>
                    <Text style={styles.detailsVal}>{selectedTransaction.paidFor}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Paid to</Text>
                    <Text style={styles.detailsVal}>{selectedTransaction.paidTo}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Date & time</Text>
                    <Text style={styles.detailsVal}>{selectedTransaction.dateTime}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Payment method</Text>
                    <Text style={styles.detailsVal}>{selectedTransaction.paymentMethod}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Reference ID</Text>
                    <Text style={styles.detailsVal}>{selectedTransaction.referenceId}</Text>
                  </View>
                </View>

                {/* Amount breakdown */}
                <View style={styles.breakdownBox}>
                  <Text style={styles.breakdownHeading}>Amount breakdown</Text>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Base amount</Text>
                    <Text style={styles.breakdownVal}>{selectedTransaction.baseAmount}</Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>GST (18%)</Text>
                    <Text style={styles.breakdownVal}>{selectedTransaction.gstAmount}</Text>
                  </View>

                  <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                    <Text style={styles.breakdownTotalLabel}>Total</Text>
                    <Text style={styles.breakdownTotalVal}>{selectedTransaction.totalAmount}</Text>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.timelineBox}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={styles.timelineText}>Payment initiated</Text>
                  </View>

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                    </View>
                    <Text style={styles.timelineText}>Payment confirmed</Text>
                  </View>
                </View>

                {/* Download Invoice Button */}
                <TouchableOpacity
                  style={styles.downloadInvoiceBtn}
                  onPress={() => {
                    Alert.alert('Invoice Download', `Invoice ${selectedTransaction.referenceId} downloaded to device.`);
                  }}
                  activeOpacity={0.85}
                >
                  <Download size={15} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.downloadInvoiceText}>Download invoice</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: Add Payment Method (Images 3, 4, 5)              */}
      {/* ========================================================= */}
      <Modal
        visible={showAddMethodModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setShowAddMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '92%', paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Payment Method</Text>
                <Text style={styles.modalSubtitle}>Securely save a way to pay</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddMethodModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* 3 Tabs Row: UPI, Card, Net Banking */}
            <View style={styles.addTabsRow}>
              <TouchableOpacity
                style={[styles.addTabBtn, addMethodTab === 'upi' && styles.addTabBtnActive]}
                onPress={() => setAddMethodTab('upi')}
                activeOpacity={0.85}
              >
                <Smartphone
                  size={15}
                  color={addMethodTab === 'upi' ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[styles.addTabText, addMethodTab === 'upi' && styles.addTabTextActive]}
                >
                  UPI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addTabBtn, addMethodTab === 'card' && styles.addTabBtnActive]}
                onPress={() => setAddMethodTab('card')}
                activeOpacity={0.85}
              >
                <CreditCard
                  size={15}
                  color={addMethodTab === 'card' ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[styles.addTabText, addMethodTab === 'card' && styles.addTabTextActive]}
                >
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addTabBtn, addMethodTab === 'bank' && styles.addTabBtnActive]}
                onPress={() => setAddMethodTab('bank')}
                activeOpacity={0.85}
              >
                <Landmark
                  size={15}
                  color={addMethodTab === 'bank' ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[styles.addTabText, addMethodTab === 'bank' && styles.addTabTextActive]}
                >
                  Net banking
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* TAB 1: UPI FORM (Image 3) */}
              {addMethodTab === 'upi' && (
                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>UPI ID</Text>
                  <TextInput
                    style={styles.formInput}
                    value={upiIdInput}
                    onChangeText={setUpiIdInput}
                    placeholder="yourname@bank"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />

                  {/* Handle Chips */}
                  <View style={styles.chipsRow}>
                    {['@okhdfc', '@okaxis', '@ybl', '@paytm'].map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={styles.chipBtn}
                        onPress={() => {
                          const base = upiIdInput.split('@')[0] || 'aarav';
                          setUpiIdInput(`${base}${h}`);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.chipBtnText}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Default Method Toggle */}
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Make this my default method</Text>
                    <Switch
                      value={isDefaultUpi}
                      onValueChange={setIsDefaultUpi}
                      trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* Security Notice */}
                  <View style={styles.securityRow}>
                    <Shield size={14} color="#10B981" strokeWidth={2.2} />
                    <Text style={styles.securityNote}>
                      Your details are encrypted and processed by a PCI-DSS compliant gateway. We never store your CVV.
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalBtnsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowAddMethodModal(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveMethod}
                      activeOpacity={0.85}
                    >
                      <Lock size={13} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.saveBtnText}>Save method</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 2: CARD FORM (Image 4) */}
              {addMethodTab === 'card' && (
                <View style={styles.formContainer}>
                  {/* Card Preview Widget */}
                  <View style={styles.cardPreview}>
                    <Text style={styles.cardPreviewLabel}>Card preview</Text>
                    <Text style={styles.cardPreviewNumber}>
                      {cardNumberInput || '•••• •••• •••• ••••'}
                    </Text>
                    <View style={styles.cardPreviewBottom}>
                      <Text style={styles.cardPreviewHolder}>
                        {cardHolderInput.toUpperCase() || 'CARDHOLDER NAME'}
                      </Text>
                      <Text style={styles.cardPreviewExpiry}>
                        {cardExpiryInput || 'MM/YY'}
                      </Text>
                    </View>
                  </View>

                  {/* Inputs */}
                  <Text style={styles.formLabel}>Card number</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cardNumberInput}
                    onChangeText={setCardNumberInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />

                  <Text style={styles.formLabel}>Name on card</Text>
                  <TextInput
                    style={styles.formInput}
                    value={cardHolderInput}
                    onChangeText={setCardHolderInput}
                    placeholder="As printed on card"
                    placeholderTextColor="#94A3B8"
                  />

                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Expiry</Text>
                      <TextInput
                        style={styles.formInput}
                        value={cardExpiryInput}
                        onChangeText={setCardExpiryInput}
                        placeholder="MM/YY"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>CVV</Text>
                      <TextInput
                        style={styles.formInput}
                        value={cardCvvInput}
                        onChangeText={setCardCvvInput}
                        placeholder="•••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry
                        maxLength={4}
                      />
                    </View>
                  </View>

                  {/* Default Method Toggle */}
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Make this my default method</Text>
                    <Switch
                      value={isDefaultCard}
                      onValueChange={setIsDefaultCard}
                      trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* Security Notice */}
                  <View style={styles.securityRow}>
                    <Shield size={14} color="#10B981" strokeWidth={2.2} />
                    <Text style={styles.securityNote}>
                      Your details are encrypted and processed by a PCI-DSS compliant gateway. We never store your CVV.
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalBtnsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowAddMethodModal(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveMethod}
                      activeOpacity={0.85}
                    >
                      <Lock size={13} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.saveBtnText}>Save method</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 3: NET BANKING FORM (Image 5) */}
              {addMethodTab === 'bank' && (
                <View style={styles.formContainer}>
                  {/* Bank Radio Selection List */}
                  <View style={styles.banksList}>
                    {POPULAR_BANKS.map((b) => {
                      const isSelected = selectedBank === b;
                      return (
                        <TouchableOpacity
                          key={b}
                          style={[styles.bankItem, isSelected && styles.bankItemActive]}
                          onPress={() => setSelectedBank(b)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.bankIconWrapper}>
                            <Landmark size={16} color="#64748B" strokeWidth={2} />
                          </View>
                          <Text style={styles.bankName}>{b}</Text>
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Default Method Toggle */}
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Make this my default method</Text>
                    <Switch
                      value={isDefaultBank}
                      onValueChange={setIsDefaultBank}
                      trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* Security Notice */}
                  <View style={styles.securityRow}>
                    <Shield size={14} color="#10B981" strokeWidth={2.2} />
                    <Text style={styles.securityNote}>
                      Your details are encrypted and processed by a PCI-DSS compliant gateway. We never store your CVV.
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalBtnsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowAddMethodModal(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveMethod}
                      activeOpacity={0.85}
                    >
                      <Lock size={13} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.saveBtnText}>Save method</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
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
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  totalPaidCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  totalPaidLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  totalPaidAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  totalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  txInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  txSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  statusPillPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillRefunded: {
    backgroundColor: '#EDE9FE',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPaid: {
    color: '#10B981',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextRefunded: {
    color: '#8B5CF6',
  },
  savedSection: {
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
    marginBottom: 14,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  methodIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  methodSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  addMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
    gap: 6,
  },
  addMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
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
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txHeroSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  txHeroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  detailsTable: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 12,
    gap: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailsVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  breakdownBox: {
    paddingVertical: 14,
    gap: 8,
  },
  breakdownHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  breakdownTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  breakdownTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  timelineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginVertical: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  downloadInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    marginTop: 10,
  },
  downloadInvoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  addTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  addTabBtnActive: {
    backgroundColor: '#0F172A',
  },
  addTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  addTabTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    paddingBottom: 10,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  chipBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  securityNote: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    borderRadius: 14,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardPreview: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 18,
    height: 140,
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPreviewLabel: {
    fontSize: 10,
    color: '#93C5FD',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardPreviewNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewHolder: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DBEAFE',
  },
  cardPreviewExpiry: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DBEAFE',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  banksList: {
    gap: 8,
    marginTop: 6,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bankItemActive: {
    borderColor: '#0F172A',
  },
  bankIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bankName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#0F172A',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
  },
});
