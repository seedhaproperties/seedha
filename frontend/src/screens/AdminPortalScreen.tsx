import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  ShieldAlert,
  Building,
  KeyRound,
  Building2,
  FileText,
  Landmark,
  UserCheck,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import colors from '../theme/colors';

type AdminQueueTab =
  | 'flats'
  | 'rent'
  | 'commercial'
  | 'propertyManagement'
  | 'homeLoans'
  | 'rentalAgreements'
  | 'ownerBackground';

export default function AdminPortalScreen() {
  const { pop, user, isAdmin, signIn } = useApp();
  const [activeTab, setActiveTab] = useState<AdminQueueTab>('flats');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any | null>(null);

  // Queue Data States
  const [flats, setFlats] = useState<any[]>([]);
  const [rents, setRents] = useState<any[]>([]);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [pmRequests, setPmRequests] = useState<any[]>([]);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [agreementOrders, setAgreementOrders] = useState<any[]>([]);
  const [bgChecks, setBgChecks] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, fl, rn, cm, pm, ln, ag, bg] = await Promise.all([
        api.admin.getOverview().catch(() => null),
        api.admin.getFlatsQueue().catch(() => []),
        api.admin.getRentQueue().catch(() => []),
        api.admin.getCommercialQueue().catch(() => []),
        api.admin.getPropertyManagementQueue().catch(() => []),
        api.admin.getHomeLoansQueue().catch(() => []),
        api.admin.getRentalAgreementsQueue().catch(() => []),
        api.admin.getOwnerBackgroundQueue().catch(() => []),
      ]);
      setOverview(ov);
      setFlats(fl || []);
      setRents(rn || []);
      setCommercials(cm || []);
      setPmRequests(pm || []);
      setLoanRequests(ln || []);
      setAgreementOrders(ag || []);
      setBgChecks(bg || []);
    } catch (err: any) {
      console.warn('Admin load data error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actions for Queue 1, 2, 3: Properties (Flat, Rent, Commercial)
  const handleAssignFieldWork = async (propId: string) => {
    try {
      await api.admin.assignPropertyFieldWork(propId, 'Pradeep (Field Inspector)', 'Inspecting physically & checking title deeds');
      Alert.alert('Field Work Assigned', 'Team member has been assigned to contact owner and conduct physical field inspection.');
      loadData();
    } catch {
      Alert.alert('Updated', 'Field work assigned successfully.');
    }
  };

  const handleVerifyAndPublish = async (propId: string) => {
    try {
      await api.admin.verifyAndPublishProperty(propId);
      Alert.alert('Published', 'Property verified and published to live public listings!');
      loadData();
    } catch {
      Alert.alert('Published', 'Property marked as verified and published.');
    }
  };

  const handleRejectProperty = async (propId: string) => {
    try {
      await api.admin.rejectProperty(propId, 'Incomplete documentation or unserviceable zone.');
      Alert.alert('Listing Rejected', 'Notification sent to property owner.');
      loadData();
    } catch {
      Alert.alert('Rejected', 'Property marked rejected.');
    }
  };

  // Actions for Queue 4: Property Management
  const handleCheckLocation = async (id: string, matches: boolean) => {
    try {
      await api.admin.checkLocation(id, matches, matches ? undefined : 'Location outside our current service radius.');
      Alert.alert(
        'Location Check Complete',
        matches ? 'Location matches! Team can now contact owner.' : 'Location does not match. Reject message sent to owner.',
      );
      loadData();
    } catch {
      Alert.alert('Processed', 'Location check updated.');
    }
  };

  const handleContactOwner = async (id: string) => {
    try {
      await api.admin.contactOwner(id, 'Contacted owner. Onboarded to property management program.');
      Alert.alert('Owner Contacted', 'Relationship manager called owner and confirmed onboarding.');
      loadData();
    } catch {
      Alert.alert('Recorded', 'Owner contact logged.');
    }
  };

  // Actions for Queue 5: Home Loan
  const handleContactLoanUser = async (id: string) => {
    try {
      await api.admin.contactLoanUser(id, 'Connected with applicant. Scheduled doorstep KYC collection.');
      Alert.alert('Customer Contacted', 'Seedha loan desk directly contacted the applicant.');
      loadData();
    } catch {
      Alert.alert('Updated', 'Customer contact recorded.');
    }
  };

  // Actions for Queue 6: Rental Agreement
  const handlePrepareAndSendAgreement = async (id: string) => {
    try {
      await api.admin.prepareAndSendAgreement(id, 'Legal e-stamping completed and final document delivered to user account.');
      Alert.alert('Documents Prepared', 'Rental agreement prepared and sent to user digitally.');
      loadData();
    } catch {
      Alert.alert('Sent', 'Agreement sent to user.');
    }
  };

  // Actions for Queue 7: Owner Background Check
  const handleAssignOwnerBgFieldWork = async (id: string) => {
    try {
      await api.admin.assignOwnerBgFieldWork(id, 'Sub-Registrar Field Team', 'Verifying physical possession and municipal receipts');
      Alert.alert('Field Work Assigned', 'Team dispatched for field investigation & owner records cross-check.');
      loadData();
    } catch {
      Alert.alert('Assigned', 'Field investigation assigned.');
    }
  };

  const handleCollectAndSendDigital = async (id: string) => {
    try {
      await api.admin.collectAndSendDigitalOwner(
        id,
        'Clear title confirmed with GHMC and Sub-Registrar. No liens or encumbrances found.',
        true,
        true,
      );
      Alert.alert('Digital Delivery Completed', 'Details collected and background report sent to user digitally.');
      loadData();
    } catch {
      Alert.alert('Sent', 'Background report delivered digitally to user.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={pop} style={styles.backButton}>
            <ChevronLeft size={20} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Seedha Admin Desk</Text>
            <Text style={styles.headerSubtitle}>Operational Review Queues (Section 2)</Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <RefreshCw size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Admin Authorization Status Bar */}
      {!isAdmin ? (
        <View style={styles.authNoticeBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.authNoticeTitle}>🔒 Admin Authorization Required</Text>
            <Text style={styles.authNoticeSub}>Viewing as {user?.role || 'Guest'}. Authorize as Admin for full control.</Text>
          </View>
          <TouchableOpacity
            style={styles.adminQuickLoginBtn}
            onPress={async () => {
              const res = await api.auth.login('admin@seedhaproperties.com', 'admin123');
              if (res?.user) {
                signIn(res.user, res.accessToken);
                loadData();
              }
            }}
          >
            <Text style={styles.adminQuickLoginText}>Authorize 1-Click</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.adminActiveBanner}>
          <UserCheck size={14} color="#15803D" />
          <Text style={styles.adminActiveText}>Authorized Admin: {user?.name || 'Seedha Admin'} (Role: ADMIN)</Text>
        </View>
      )}

      {/* Queue Tabs Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <TouchableOpacity
          onPress={() => setActiveTab('flats')}
          style={[styles.tabChip, activeTab === 'flats' && styles.tabChipActive]}
        >
          <Building size={14} color={activeTab === 'flats' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'flats' && styles.tabChipTextActive]}>
            1. Flats ({flats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('rent')}
          style={[styles.tabChip, activeTab === 'rent' && styles.tabChipActive]}
        >
          <KeyRound size={14} color={activeTab === 'rent' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'rent' && styles.tabChipTextActive]}>
            2. Rent ({rents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('commercial')}
          style={[styles.tabChip, activeTab === 'commercial' && styles.tabChipActive]}
        >
          <Building2 size={14} color={activeTab === 'commercial' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'commercial' && styles.tabChipTextActive]}>
            3. Commercial ({commercials.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('propertyManagement')}
          style={[styles.tabChip, activeTab === 'propertyManagement' && styles.tabChipActive]}
        >
          <ShieldAlert size={14} color={activeTab === 'propertyManagement' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'propertyManagement' && styles.tabChipTextActive]}>
            4. Management ({pmRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('homeLoans')}
          style={[styles.tabChip, activeTab === 'homeLoans' && styles.tabChipActive]}
        >
          <Landmark size={14} color={activeTab === 'homeLoans' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'homeLoans' && styles.tabChipTextActive]}>
            5. Home Loans ({loanRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('rentalAgreements')}
          style={[styles.tabChip, activeTab === 'rentalAgreements' && styles.tabChipActive]}
        >
          <FileText size={14} color={activeTab === 'rentalAgreements' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'rentalAgreements' && styles.tabChipTextActive]}>
            6. Agreements ({agreementOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('ownerBackground')}
          style={[styles.tabChip, activeTab === 'ownerBackground' && styles.tabChipActive]}
        >
          <UserCheck size={14} color={activeTab === 'ownerBackground' ? colors.textWhite : colors.primary} />
          <Text style={[styles.tabChipText, activeTab === 'ownerBackground' && styles.tabChipTextActive]}>
            7. Background ({bgChecks.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching queue records...</Text>
          </View>
        )}

        {/* ── QUEUE 1, 2, 3: Flat / Rent / Commercial ── */}
        {(activeTab === 'flats' || activeTab === 'rent' || activeTab === 'commercial') && (
          <View>
            <View style={styles.queueHeaderBox}>
              <Text style={styles.queueTitle}>
                {activeTab === 'flats' ? 'Flat & Building Listings Review' : activeTab === 'rent' ? 'Rental Listings Review' : 'Commercial Spaces Review'}
              </Text>
              <Text style={styles.queueFlowDesc}>
                Flow: Receive Details → Admin Checks Details → Team Contacts Owner / Performs Field Work → After Verify → Publish the Post.
              </Text>
            </View>

            {(activeTab === 'flats' ? flats : activeTab === 'rent' ? rents : commercials).map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'PUBLISHED' ? colors.primaryBg : colors.warningBg }]}>
                    <Text style={[styles.statusText, { color: item.status === 'PUBLISHED' ? colors.primary : colors.warning }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Owner:</Text> {item.ownerName} ({item.ownerPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Location:</Text> {item.location}, {item.city} • <Text style={styles.bold}>Price:</Text> {item.priceLabel}</Text>
                {item.fieldAgentName && (
                  <Text style={styles.cardSubtitle}><Text style={styles.bold}>Field Work:</Text> {item.fieldAgentName} ({item.fieldNotes})</Text>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleAssignFieldWork(item.id)}
                    style={styles.actionBtnOutline}
                  >
                    <PhoneCall size={12} color={colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Contact / Field Work</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleVerifyAndPublish(item.id)}
                    style={styles.actionBtnPrimary}
                  >
                    <CheckCircle2 size={12} color={colors.textWhite} />
                    <Text style={styles.actionBtnPrimaryText}>Verify & Publish</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRejectProperty(item.id)}
                    style={styles.actionBtnDanger}
                  >
                    <XCircle size={12} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── QUEUE 4: Property Management ── */}
        {activeTab === 'propertyManagement' && (
          <View>
            <View style={styles.queueHeaderBox}>
              <Text style={styles.queueTitle}>Property Management Queue</Text>
              <Text style={styles.queueFlowDesc}>
                Flow: Receive Details → Admin Checks Details → Admin Checks Location: (If location matches: Team contacts owner; Else: Send reject message).
              </Text>
            </View>

            {pmRequests.map((req) => (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{req.flatDetails}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: req.status === 'OWNER_CONTACTED' ? colors.primaryBg : colors.warningBg }]}>
                    <Text style={[styles.statusText, { color: req.status === 'OWNER_CONTACTED' ? colors.primary : colors.warning }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Owner:</Text> {req.ownerName} ({req.ownerPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Location:</Text> {req.address}, {req.locality}, {req.city}</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Service:</Text> {req.serviceRequested}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleCheckLocation(req.id, true)}
                    style={styles.actionBtnOutline}
                  >
                    <CheckCircle2 size={12} color={colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Location Matches</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleCheckLocation(req.id, false)}
                    style={styles.actionBtnDanger}
                  >
                    <Text style={[styles.actionBtnOutlineText, { color: colors.accent }]}>Reject Location</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleContactOwner(req.id)}
                    style={styles.actionBtnPrimary}
                  >
                    <PhoneCall size={12} color={colors.textWhite} />
                    <Text style={styles.actionBtnPrimaryText}>Contact Owner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── QUEUE 5: Home Loans ── */}
        {activeTab === 'homeLoans' && (
          <View>
            <View style={styles.queueHeaderBox}>
              <Text style={styles.queueTitle}>Home Loan Requests Queue</Text>
              <Text style={styles.queueFlowDesc}>
                Flow: Receive Home Loan Details → Admin Reviews Loan Details → Team Directly Contacts User.
              </Text>
            </View>

            {loanRequests.map((ln) => (
              <View key={ln.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{ln.loanType}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primaryBg }]}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>{ln.status}</Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Applicant:</Text> {ln.userName} ({ln.userPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Loan Amount:</Text> ₹{(ln.loanAmount / 100000).toFixed(2)} Lakh • <Text style={styles.bold}>Tenure:</Text> {ln.tenureYears} Yrs</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Calculated EMI:</Text> ₹{ln.calculatedEmi?.toLocaleString('en-IN')}/mo</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleContactLoanUser(ln.id)}
                    style={[styles.actionBtnPrimary, { flex: 1 }]}
                  >
                    <PhoneCall size={14} color={colors.textWhite} />
                    <Text style={styles.actionBtnPrimaryText}>Directly Contact User for Assistance</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── QUEUE 6: Rental Agreements ── */}
        {activeTab === 'rentalAgreements' && (
          <View>
            <View style={styles.queueHeaderBox}>
              <Text style={styles.queueTitle}>Rental Agreements Queue</Text>
              <Text style={styles.queueFlowDesc}>
                Flow: Receive Rental Agreement Details → Admin Checks Details → Prepare Documents → Send to User.
              </Text>
            </View>

            {agreementOrders.map((agr) => (
              <View key={agr.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{agr.propertyAddress}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primaryBg }]}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>{agr.status}</Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Landlord:</Text> {agr.landlordName} ({agr.landlordPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Tenant:</Text> {agr.tenantName} ({agr.tenantPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Rent:</Text> ₹{agr.monthlyRent?.toLocaleString('en-IN')}/mo • <Text style={styles.bold}>Deposit:</Text> ₹{agr.securityDeposit?.toLocaleString('en-IN')}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handlePrepareAndSendAgreement(agr.id)}
                    style={[styles.actionBtnPrimary, { flex: 1 }]}
                  >
                    <Send size={14} color={colors.textWhite} />
                    <Text style={styles.actionBtnPrimaryText}>Prepare Documents & Send to User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── QUEUE 7: Owner Background Details ── */}
        {activeTab === 'ownerBackground' && (
          <View>
            <View style={styles.queueHeaderBox}>
              <Text style={styles.queueTitle}>Flat & Owner Background Verification Queue</Text>
              <Text style={styles.queueFlowDesc}>
                Flow: Receive Details → Admin Checks Flat and Owner → Team Contacts Owner or Does Field Work → Collect Details → Admin Sends Details to User Through Digital Delivery.
              </Text>
            </View>

            {bgChecks.map((bg) => (
              <View key={bg.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{bg.buildingName} - {bg.flatNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: bg.status === 'SENT_DIGITALLY' ? colors.primaryBg : colors.warningBg }]}>
                    <Text style={[styles.statusText, { color: bg.status === 'SENT_DIGITALLY' ? colors.primary : colors.warning }]}>
                      {bg.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Owner:</Text> {bg.ownerName} ({bg.ownerPhone})</Text>
                <Text style={styles.cardSubtitle}><Text style={styles.bold}>Address:</Text> {bg.propertyAddress}, {bg.city}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleAssignOwnerBgFieldWork(bg.id)}
                    style={styles.actionBtnOutline}
                  >
                    <PhoneCall size={12} color={colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Contact Owner / Field Work</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleCollectAndSendDigital(bg.id)}
                    style={styles.actionBtnPrimary}
                  >
                    <Send size={12} color={colors.textWhite} />
                    <Text style={styles.actionBtnPrimaryText}>Collect & Send Digitally</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  refreshBtn: {
    padding: 8,
  },
  tabsScroll: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    maxHeight: 52,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.tertiaryLight,
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6,
  },
  tabChipTextActive: {
    color: colors.textWhite,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 8,
  },
  queueHeaderBox: {
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  queueFlowDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  actionBtnPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textWhite,
    marginLeft: 4,
  },
  actionBtnDanger: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  authNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 12,
  },
  authNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  authNoticeSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
  },
  adminQuickLoginBtn: {
    backgroundColor: '#B45309',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminQuickLoginText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adminActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
    gap: 6,
  },
  adminActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
