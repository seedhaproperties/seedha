import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  UserPlus,
  Ban,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Building2,
  Globe,
  FileText,
  AlertTriangle,
  HelpCircle,
  Eye,
  CheckSquare,
  Navigation,
} from 'lucide-react';
import { adminService } from '../services/api';
import { PropertyRequest, DocumentItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModuleBadge } from '../components/common/ModuleBadge';
import { SlaCountdownBadge } from '../components/common/SlaCountdownBadge';
import { MODULE_META } from '../data/mockData';
import { AssignMemberModal } from '../components/modals/AssignMemberModal';
import { QuickContactModal } from '../components/modals/QuickContactModal';
import { RejectModal } from '../components/modals/RejectModal';
import { FieldVisitModal } from '../components/modals/FieldVisitModal';
import { VerifyPublishModal } from '../components/modals/VerifyPublishModal';
import { LocationCheckModal } from '../components/modals/LocationCheckModal';
import { RequestInfoModal } from '../components/modals/RequestInfoModal';
import { DocumentViewerModal } from '../components/modals/DocumentViewerModal';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<PropertyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Modals
  const [assignOpen, setAssignOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fieldVisitOpen, setFieldVisitOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [locationCheckOpen, setLocationCheckOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const data = await adminService.getRequestById(id);
    setRequest(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">The request ID {id} does not exist.</p>
        <Link
          to="/requests"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    );
  }

  const moduleMeta = MODULE_META[request.module];
  const photos = request.photos?.length ? request.photos : request.images || [];
  const ownerName = request.ownerName || request.ownerOrUser?.name || 'Owner';
  const ownerPhone = request.ownerPhone || request.ownerOrUser?.phone || '+91 98480 00000';
  const ownerEmail = request.ownerEmail || request.ownerOrUser?.email || '';
  const agentName = request.assignedTo?.name || request.assignedToName;

  // Advance loan stage shortcut
  const handleAdvanceLoanStage = async (newStage: any) => {
    await adminService.updateRequest(
      request.id,
      {
        homeLoan: {
          ...request.homeLoan!,
          stage: newStage,
        },
      },
      `Home loan application stage updated to: ${newStage}`
    );
    loadData();
  };

  // Advance agreement stage shortcut
  const handleAdvanceAgreementStage = async (newStage: any) => {
    await adminService.updateRequest(
      request.id,
      {
        rentalAgreement: {
          ...request.rentalAgreement!,
          stage: newStage,
        },
        status: newStage === 'delivered' ? 'published' : 'in_review',
      },
      `Rental agreement status updated to: ${newStage}`
    );
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-900">{request.code || request.id}</span>
              <ModuleBadge module={request.module} />
              <StatusBadge status={request.status} />
              <SlaCountdownBadge
                minutesRemaining={request.slaMinutesLeft}
                status={request.status}
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{request.title}</h1>
          </div>
        </div>

        {/* Global Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setContactOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Owner</span>
          </button>

          <button
            onClick={() => setAssignOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{request.assignedTo ? 'Reassign' : 'Assign Staff'}</span>
          </button>

          <button
            onClick={() => setRequestInfoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Request Info</span>
          </button>

          {request.status !== 'published' && (
            <button
              onClick={() => setPublishOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Listing</span>
            </button>
          )}

          {request.status !== 'rejected' && request.status !== 'published' && (
            <button
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Specs, Images, Workflow Box, Documents, Audit Trail) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module-Specific Workflow Engine Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Module Workflow: {moduleMeta.label}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{moduleMeta.flowSummary}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-mono text-slate-700">
                Step Engine
              </span>
            </div>

            {/* Workflow controls by module */}
            {(request.module === 'flat_building' ||
              request.module === 'buy_sell' ||
              request.module === 'rent' ||
              request.module === 'commercial' ||
              request.module === 'pg_hostel') && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    1. Submission Received
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      request.assignedTo || request.assignedToId
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    2. Staff Assigned
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      request.status === 'verified' || request.status === 'published'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    3. Field Verified
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-semibold ${
                      request.status === 'published'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    4. Published Live
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {request.status !== 'verified' && request.status !== 'published' && (
                    <button
                      onClick={() => setFieldVisitOpen(true)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Execute Field Visit Checklist</span>
                    </button>
                  )}
                  {request.status !== 'published' && (
                    <button
                      onClick={() => setPublishOpen(true)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Approve & Publish Listing</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 4: Property Management */}
            {request.module === 'property_management' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Location Verification</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {request.locationCheck
                        ? `Status: ${request.locationCheck.status.toUpperCase()} (${request.locationCheck.distanceKm} km from ${request.locationCheck.nearestHub})`
                        : 'Location check pending'}
                    </p>
                  </div>
                  <button
                    onClick={() => setLocationCheckOpen(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Run Service Radius Check</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5: Home Loan */}
            {request.module === 'home_loan' && request.homeLoan && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-slate-500 block">Requested Amount</span>
                      <strong className="text-slate-800 text-sm">
                        {request.homeLoan.loanAmount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Monthly Income</span>
                      <strong className="text-slate-800 text-sm">
                        {request.homeLoan.monthlyIncome}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">CIBIL Score</span>
                      <strong className="text-emerald-700 text-sm">
                        {request.homeLoan.cibilScore}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Current Stage</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {request.homeLoan.stage}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-blue-200/60">
                    <span className="text-xs font-semibold text-slate-600">Advance Stage:</span>
                    {[
                      'contacted',
                      'docs_collected',
                      'bank_submitted',
                      'approved',
                      'rejected',
                    ].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleAdvanceLoanStage(st)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                          request.homeLoan?.stage === st
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6: Rental Agreements */}
            {request.module === 'rental_agreements' && request.rentalAgreement && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-slate-500 block">Monthly Rent</span>
                      <strong className="text-slate-800 text-sm">
                        {request.rentalAgreement.monthlyRent}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Deposit Amount</span>
                      <strong className="text-slate-800 text-sm">
                        {request.rentalAgreement.securityDeposit}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration</span>
                      <strong className="text-slate-800 text-sm">
                        {request.rentalAgreement.durationMonths} Months
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Agreement State</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                        {request.rentalAgreement.stage}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-teal-200/60">
                    <span className="text-xs font-semibold text-slate-600">Update State:</span>
                    {['draft', 'review', 'esign_pending', 'delivered'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleAdvanceAgreementStage(st)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                          request.rentalAgreement?.stage === st
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7: Owner Background Check */}
            {request.module === 'owner_background' && request.ownerBackground && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <div className="space-y-2 text-xs">
                    {request.ownerBackground.checks?.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-medium text-slate-800">{c.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Overall Result: <strong>{request.ownerBackground.result.toUpperCase()}</strong>
                    </span>
                    <button
                      onClick={() => setPublishOpen(true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Issue Verified Clearance
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                Property Visuals & High-Res Inspection Media ({photos.length})
              </h3>
              <div className="space-y-3">
                <div className="h-72 w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src={photos[activePhotoIdx]}
                    alt="Active property view"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Property Specs Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Property Specifications & Description
            </h3>

            {request.address && (
              <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {request.address}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Price / Value</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {request.priceDisplay}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                  {request.locality}, {request.city}
                </span>
              </div>
              {request.areaSqFt && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Built-up Area</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {request.areaSqFt} sq.ft
                  </span>
                </div>
              )}
              {request.configLabel && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Configuration</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                    {request.configLabel}
                  </span>
                </div>
              )}
              {request.furnishing && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Furnishing</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {request.furnishing}
                  </span>
                </div>
              )}
              {request.availability && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Availability</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {request.availability}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Documents Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Submitted Verification Documents ({request.documents?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect title deeds, encumbrance certificates, ID proofs, and bills.
                </p>
              </div>
            </div>

            {(!request.documents || request.documents.length === 0) ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No documents uploaded yet by owner</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.name || doc.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {doc.type || doc.fileType} • {doc.size || doc.fileSize || '1.2 MB'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Inspect Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail & Event History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Operational Audit Trail ({request.auditLog?.length || 0})
            </h3>
            <div className="space-y-4">
              {request.auditLog?.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{log.action}</p>
                    {(log.detail || log.details) && <p className="text-slate-500 mt-0.5">{log.detail || log.details}</p>}
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(log.timestamp).toLocaleString('en-IN')} • {log.actor || log.performedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Owner Profile, Field Agent Card, Quick Operations) */}
        <div className="space-y-6">
          {/* Owner / Applicant Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Owner / Submitter
              </h3>
              {request.ownerContacted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Contacted
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center">
                {ownerName.charAt(0)}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{ownerName}</p>
                <p className="text-xs text-slate-500 font-mono">{ownerPhone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${ownerPhone}`}
                onClick={() => setContactOpen(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Owner</span>
              </a>
              <button
                onClick={() => setContactOpen(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Assigned Staff Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Operations Staff
              </h3>
              <button
                onClick={() => setAssignOpen(true)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                {agentName ? 'Change' : 'Assign'}
              </button>
            </div>

            {agentName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center">
                    {agentName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{agentName}</p>
                    <p className="text-xs text-purple-700 font-medium">{request.assignedTo?.role || 'Field Officer'}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <p>Zone: <strong className="text-slate-700">{request.assignedTo?.zone || 'Hyderabad'}</strong></p>
                  <p>Contact: <strong className="text-slate-700 font-mono">{request.assignedTo?.phone || '+91 98480 12345'}</strong></p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-2">No agent assigned yet</p>
                <button
                  onClick={() => setAssignOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
                >
                  Assign Field Agent
                </button>
              </div>
            )}
          </div>

          {/* Fast Decision Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Decision & Action
            </h3>

            {request.status !== 'published' && (
              <button
                onClick={() => setPublishOpen(true)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>Approve & Publish to Seedha</span>
              </button>
            )}

            {request.status !== 'verified' && request.status !== 'published' && (
              <button
                onClick={() => setFieldVisitOpen(true)}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Verify Field Visit</span>
              </button>
            )}

            <button
              onClick={() => setRequestInfoOpen(true)}
              className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Request Missing Info</span>
            </button>

            {request.status !== 'rejected' && (
              <button
                onClick={() => setRejectOpen(true)}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                <span>Reject Submission</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignMemberModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        requestId={request.id}
        propertyTitle={request.title}
        currentAssigneeId={request.assignedTo?.id || request.assignedToId}
        onAssigned={loadData}
      />

      <QuickContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        requestId={request.id}
        ownerName={ownerName}
        ownerPhone={ownerPhone}
        ownerEmail={ownerEmail}
        propertyTitle={request.title}
        onContactLogged={loadData}
      />

      <RejectModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        requestId={request.id}
        propertyTitle={request.title}
        onRejected={() => {
          loadData();
          navigate('/requests');
        }}
      />

      <FieldVisitModal
        isOpen={fieldVisitOpen}
        onClose={() => setFieldVisitOpen(false)}
        request={request}
        onVerified={loadData}
      />

      <VerifyPublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        request={request}
        onPublished={loadData}
      />

      <LocationCheckModal
        isOpen={locationCheckOpen}
        onClose={() => setLocationCheckOpen(false)}
        request={request}
        onLocationChecked={loadData}
      />

      <RequestInfoModal
        isOpen={requestInfoOpen}
        onClose={() => setRequestInfoOpen(false)}
        requestId={request.id}
        propertyTitle={request.title}
        onInfoRequested={loadData}
      />

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
      />
    </div>
  );
};
