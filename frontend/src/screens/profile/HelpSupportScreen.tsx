import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
  ChevronDown,
  ChevronUp,
  Search,
  Phone,
  MessageSquare,
  Mail,
  Headphones,
  Plus,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

export interface SupportTicket {
  id: string;
  ticketNo: string;
  subject: string;
  status: 'In progress' | 'Resolved';
}

const FAQS = [
  {
    q: 'How do I post a property?',
    a: 'Tap the + button in the bottom bar, choose Sell or Rent, fill in the details, add photos and submit for review.',
  },
  {
    q: 'How does property verification work?',
    a: 'Our field agents conduct a physical visit and cross-verify land revenue records within 24-48 hours.',
  },
  {
    q: 'How can I reschedule a site visit?',
    a: 'Go to My Activity > Visits, tap Reschedule on the upcoming visit card, and pick a new convenient time slot.',
  },
  {
    q: 'When do I get my rental agreement?',
    a: 'Once both parties digitally sign via Aadhaar e-Sign, the legally stamped agreement PDF is generated instantly.',
  },
  {
    q: 'How do refunds work?',
    a: 'Refunds for token advances or cancelled visits are processed back to your original source account within 3-5 business days.',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 't-1',
    ticketNo: 'TK-2041',
    subject: 'Payment not reflecting',
    status: 'In progress',
  },
  {
    id: 't-2',
    ticketNo: 'TK-1988',
    subject: 'Update PAN details',
    status: 'Resolved',
  },
];

export default function HelpSupportScreen() {
  const { pop, push, setTab } = useApp();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0); // First FAQ open by default
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  // Raise Ticket Modal State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim()) {
      Alert.alert('Required', 'Please enter a ticket subject.');
      return;
    }
    const newTk: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNo: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject.trim(),
      status: 'In progress',
    };
    setTickets((prev) => [newTk, ...prev]);
    setShowRaiseModal(false);
    setTicketSubject('');
    setTicketDetails('');
    Alert.alert('Ticket Raised', `Your ticket ${newTk.ticketNo} has been submitted to Concierge desk.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
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
            <Text style={styles.pageTitle}>Help & Support</Text>
            <Text style={styles.subtitle}>Concierge desk, FAQ & tickets</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 3 Contact Channels */}
        <View style={styles.channelsRow}>
          {/* Call */}
          <TouchableOpacity
            style={styles.channelCard}
            onPress={() => Alert.alert('Concierge Desk', 'Connecting you to toll-free concierge: 1800-200-4000')}
            activeOpacity={0.8}
          >
            <View style={styles.channelIconBox}>
              <Phone size={17} color="#1E293B" strokeWidth={2.2} />
            </View>
            <Text style={styles.channelTitle}>Call</Text>
            <Text style={styles.channelSub}>Concierge desk</Text>
          </TouchableOpacity>

          {/* Chat */}
          <TouchableOpacity
            style={styles.channelCard}
            onPress={() => push({ name: 'chat' })}
            activeOpacity={0.8}
          >
            <View style={styles.channelIconBox}>
              <MessageSquare size={17} color="#1E293B" strokeWidth={2.2} />
            </View>
            <Text style={styles.channelTitle}>Chat</Text>
            <Text style={styles.channelSub}>Typically 2 min</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={styles.channelCard}
            onPress={() => Alert.alert('Email Support', 'Opening mail client to support@seedha.com')}
            activeOpacity={0.8}
          >
            <View style={styles.channelIconBox}>
              <Mail size={17} color="#1E293B" strokeWidth={2.2} />
            </View>
            <Text style={styles.channelTitle}>Email</Text>
            <Text style={styles.channelSub}>support@seedha.com</Text>
          </TouchableOpacity>
        </View>

        {/* Frequently Asked Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Frequently asked</Text>

          <View style={styles.faqList}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;

              return (
                <View key={idx} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqHeaderRow}
                    onPress={() => setExpandedFaq(isOpen ? null : idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    {isOpen ? (
                      <ChevronUp size={16} color="#64748B" strokeWidth={2.2} />
                    ) : (
                      <ChevronDown size={16} color="#64748B" strokeWidth={2.2} />
                    )}
                  </TouchableOpacity>

                  {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* Your Tickets Section */}
        <View style={styles.sectionCard}>
          <View style={styles.ticketsHeaderRow}>
            <Text style={styles.sectionHeading}>Your tickets</Text>
            <TouchableOpacity onPress={() => setShowRaiseModal(true)} activeOpacity={0.8}>
              <Text style={styles.raiseTicketText}>Raise ticket</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ticketsList}>
            {tickets.map((t) => (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketIconBox}>
                  <Headphones size={17} color="#64748B" strokeWidth={2.2} />
                </View>

                <View style={styles.ticketInfoCol}>
                  <Text style={styles.ticketSubject}>{t.subject}</Text>
                  <Text style={styles.ticketNo}>{t.ticketNo}</Text>
                </View>

                <View
                  style={[
                    styles.ticketBadge,
                    t.status === 'Resolved' ? styles.badgeResolved : styles.badgeInProgress,
                  ]}
                >
                  <Text
                    style={[
                      styles.ticketBadgeText,
                      t.status === 'Resolved' ? styles.textResolved : styles.textInProgress,
                    ]}
                  >
                    {t.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL: Raise a ticket (Screen 2 of Image 2)               */}
      {/* ========================================================= */}
      <Modal
        visible={showRaiseModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setShowRaiseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raise a ticket</Text>
              <TouchableOpacity
                onPress={() => setShowRaiseModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.inputBox}
              value={ticketSubject}
              onChangeText={setTicketSubject}
              placeholder="What do you need help with?"
              placeholderTextColor="#94A3B8"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Details</Text>
            <TextInput
              style={[styles.inputBox, styles.textArea]}
              value={ticketDetails}
              onChangeText={setTicketDetails}
              placeholder="Describe the issue"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              Attach screenshots (optional, up to 4)
            </Text>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => Alert.alert('Attachment', 'Select screenshot from gallery.')}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#64748B" strokeWidth={2.4} />
              <Text style={styles.attachBtnText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitTicket}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Submit ticket</Text>
            </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0,
  },
  channelsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  channelCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  channelIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  channelSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 10,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 8,
  },
  ticketsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  raiseTicketText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  ticketsList: {
    gap: 10,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  ticketIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketInfoCol: {
    flex: 1,
    marginLeft: 10,
  },
  ticketSubject: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  ticketNo: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ticketBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeInProgress: {
    backgroundColor: '#FEF3C7',
  },
  badgeResolved: {
    backgroundColor: '#DCFCE7',
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textInProgress: {
    color: '#D97706',
  },
  textResolved: {
    color: '#10B981',
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: '#1E293B',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: '#F8FAFC',
    marginTop: 4,
  },
  attachBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
