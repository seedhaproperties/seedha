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
  Upload,
  CheckCircle2,
  Fingerprint,
  Building2,
  FileText,
  Download,
  X,
  Clock,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'KYC' | 'Property' | 'Agreement';
  meta: string;
  status: 'Verified' | 'Pending';
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Aadhaar Card',
    category: 'KYC',
    meta: 'Updated 12 Jan 2026',
    status: 'Verified',
  },
  {
    id: 'doc-2',
    name: 'PAN Card',
    category: 'KYC',
    meta: 'Updated 12 Jan 2026',
    status: 'Verified',
  },
  {
    id: 'doc-3',
    name: 'Sale Deed - Madhurawada flat',
    category: 'Property',
    meta: 'PDF · 2.4 MB',
    status: 'Verified',
  },
  {
    id: 'doc-4',
    name: 'Property Tax Receipt 2026',
    category: 'Property',
    meta: 'PDF · 480 KB',
    status: 'Pending',
  },
  {
    id: 'doc-5',
    name: 'Rental Agreement - B-1204',
    category: 'Agreement',
    meta: 'Signed 1 Apr 2026',
    status: 'Verified',
  },
  {
    id: 'doc-6',
    name: 'Rental Agreement - Plot 18',
    category: 'Agreement',
    meta: 'Draft',
    status: 'Pending',
  },
];

export default function MyDocumentsScreen() {
  const { pop, setTab } = useApp();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<'All' | 'KYC' | 'Property' | 'Agreements'>('All');
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCS);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docNameInput, setDocNameInput] = useState('');
  const [docTypeInput, setDocTypeInput] = useState<'KYC' | 'Property' | 'Agreement'>('Property');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    if (activeFilter === 'KYC') return d.category === 'KYC';
    if (activeFilter === 'Property') return d.category === 'Property';
    if (activeFilter === 'Agreements') return d.category === 'Agreement';
    return true;
  });

  const handleDownload = (doc: DocumentItem) => {
    Alert.alert('Download Started', `Downloading "${doc.name}" securely to your device.`);
  };

  const handleSaveDocument = () => {
    if (!docNameInput.trim()) {
      Alert.alert('Required', 'Please enter a document name.');
      return;
    }
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: docNameInput.trim(),
      category: docTypeInput,
      meta: uploadedFileName ? `PDF · 1.2 MB` : 'PDF · Uploaded today',
      status: 'Pending',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);
    setDocNameInput('');
    setUploadedFileName(null);
    Alert.alert('Success', 'Document uploaded and sent for verification.');
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
            <Text style={styles.pageTitle}>My Documents</Text>
            <Text style={styles.subtitle}>KYC vault, deeds & agreements</Text>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => setShowUploadModal(true)}
            activeOpacity={0.85}
          >
            <Upload size={14} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* KYC Verified Banner */}
        <View style={styles.kycBanner}>
          <View style={styles.kycIconWrapper}>
            <CheckCircle2 size={18} color="#10B981" strokeWidth={2.4} />
          </View>
          <View style={styles.kycTextCol}>
            <Text style={styles.kycTitle}>KYC verified</Text>
            <Text style={styles.kycSubtitle}>Your identity documents are verified and stored securely.</Text>
          </View>
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterPillsRow}>
          {(['All', 'KYC', 'Property', 'Agreements'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const count = filter === 'All' ? documents.length : documents.filter((d) => (filter === 'Agreements' ? d.category === 'Agreement' : d.category === filter)).length;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter} {filter === 'All' ? count : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Documents List */}
        <View style={styles.docsList}>
          {filteredDocs.map((doc) => {
            const isVerified = doc.status === 'Verified';

            return (
              <View key={doc.id} style={styles.docCard}>
                {/* Icon box */}
                <View style={styles.docIconBox}>
                  {doc.category === 'KYC' ? (
                    <Fingerprint size={19} color="#64748B" strokeWidth={2} />
                  ) : doc.category === 'Property' ? (
                    <Building2 size={19} color="#64748B" strokeWidth={2} />
                  ) : (
                    <FileText size={19} color="#64748B" strokeWidth={2} />
                  )}
                </View>

                {/* Details */}
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.docMeta}>{doc.meta}</Text>
                  <View style={styles.statusRow}>
                    <Text
                      style={[
                        styles.statusText,
                        isVerified ? styles.statusVerified : styles.statusPending,
                      ]}
                    >
                      {doc.status}
                    </Text>
                  </View>
                </View>

                {/* Download button */}
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() => handleDownload(doc)}
                  activeOpacity={0.75}
                >
                  <Download size={16} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL: Upload document (Screen 2)                         */}
      {/* ========================================================= */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload document</Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <X size={18} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Document name */}
            <Text style={styles.inputLabel}>Document name</Text>
            <TextInput
              style={styles.inputBox}
              value={docNameInput}
              onChangeText={setDocNameInput}
              placeholder="e.g. Sale deed, Aadhaar card"
              placeholderTextColor="#94A3B8"
            />

            {/* Document type */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Document type</Text>
            <View style={styles.typeSelectorRow}>
              {(['KYC', 'Property', 'Agreement'] as const).map((t) => {
                const isSelected = docTypeInput === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typePill, isSelected && styles.typePillActive]}
                    onPress={() => setDocTypeInput(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* File Dropzone */}
            <TouchableOpacity
              style={styles.dropzoneBox}
              onPress={() => setUploadedFileName('Document_Copy.pdf')}
              activeOpacity={0.8}
            >
              <View style={styles.dropzoneIconBox}>
                <Upload size={18} color="#64748B" strokeWidth={2.2} />
              </View>
              <Text style={styles.dropzoneTitle}>
                {uploadedFileName || 'Choose a file'}
              </Text>
              <Text style={styles.dropzoneSub}>PDF, JPG or PNG up to 10 MB</Text>
            </TouchableOpacity>

            {/* Save document Button */}
            <TouchableOpacity
              style={styles.saveDocBtn}
              onPress={handleSaveDocument}
              activeOpacity={0.85}
            >
              <Text style={styles.saveDocBtnText}>Save document</Text>
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  kycIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycTextCol: {
    flex: 1,
  },
  kycTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  kycSubtitle: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
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
  docsList: {
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  docIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  docMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusRow: {
    marginTop: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusVerified: {
    color: '#10B981',
  },
  statusPending: {
    color: '#D97706',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
  },
  typePillActive: {
    backgroundColor: '#0F172A',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  dropzoneBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
  },
  dropzoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dropzoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropzoneSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  saveDocBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveDocBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
