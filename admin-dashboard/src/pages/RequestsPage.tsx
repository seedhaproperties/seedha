import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  Phone,
  Ban,
  CheckCircle2,
  MapPin,
  ArrowRight,
  RefreshCw,
  Building2,
  Key,
  Briefcase,
  Wrench,
  BadgePercent,
  FileText,
  UserCheck,
} from 'lucide-react';
import { adminService } from '../services/api';
import { PropertyRequest, ModuleType, GlobalStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModuleBadge } from '../components/common/ModuleBadge';
import { SlaCountdownBadge } from '../components/common/SlaCountdownBadge';
import { AssignMemberModal } from '../components/modals/AssignMemberModal';
import { QuickContactModal } from '../components/modals/QuickContactModal';
import { RejectModal } from '../components/modals/RejectModal';

const TABS: Array<{ key: ModuleType | 'all'; label: string; icon?: React.FC<{ className?: string }> }> = [
  { key: 'all', label: 'All Verticals' },
  { key: 'flat_building', label: 'Flat / Building', icon: Building2 },
  { key: 'rent', label: 'Rent', icon: Key },
  { key: 'commercial', label: 'Commercial', icon: Briefcase },
  { key: 'property_management', label: 'Property Mgmt', icon: Wrench },
  { key: 'home_loan', label: 'Home Loan', icon: BadgePercent },
  { key: 'rental_agreements', label: 'Rental Agreement', icon: FileText },
  { key: 'owner_background', label: 'Owner BG Check', icon: UserCheck },
];

const STATUS_FILTERS: Array<{ key: GlobalStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All Statuses' },
  { key: 'new', label: 'New' },
  { key: 'in_review', label: 'In Review' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'field_visit', label: 'Field Visit' },
  { key: 'verified', label: 'Verified' },
  { key: 'published', label: 'Published' },
  { key: 'needs_info', label: 'Needs Info' },
  { key: 'rejected', label: 'Rejected' },
];

export const RequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentModule = (searchParams.get('module') as ModuleType | 'all') || 'all';
  const currentStatus = (searchParams.get('status') as GlobalStatus | 'all') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Modal states
  const [assignModal, setAssignModal] = useState<{ open: boolean; request: PropertyRequest | null }>({
    open: false,
    request: null,
  });
  const [contactModal, setContactModal] = useState<{ open: boolean; request: PropertyRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; request: PropertyRequest | null }>({
    open: false,
    request: null,
  });

  const loadRequests = async () => {
    setLoading(true);
    const data = await adminService.getRequests({
      module: currentModule,
      status: currentStatus,
      search: searchQuery,
    });
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [currentModule, currentStatus, searchQuery]);

  const handleTabChange = (mod: ModuleType | 'all') => {
    const params = new URLSearchParams(searchParams);
    if (mod === 'all') {
      params.delete('module');
    } else {
      params.set('module', mod);
    }
    setSearchParams(params);
  };

  const handleStatusChange = (st: GlobalStatus | 'all') => {
    const params = new URLSearchParams(searchParams);
    if (st === 'all') {
      params.delete('status');
    } else {
      params.set('status', st);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Requests & Submissions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, verify, contact owners, assign field work, and publish listings.
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Module Horizontal Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 pb-px min-w-max">
          {TABS.map((tab) => {
            const isSelected = currentModule === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                  isSelected
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Status:</span>
          <div className="flex items-center gap-1.5">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.key}
                onClick={() => handleStatusChange(sf.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  currentStatus === sf.key
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search request or locality..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">ID & Module</th>
                <th className="py-3 px-6">Property / Request Details</th>
                <th className="py-3 px-6">Owner / Contact</th>
                <th className="py-3 px-6">Assigned Staff</th>
                <th className="py-3 px-6">Status & SLA</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-base font-medium">No requests found matching filters</p>
                    <p className="text-xs mt-1">Try resetting the status filter or search query</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID & Module */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-900 block mb-1">
                        {req.code || req.id}
                      </span>
                      <ModuleBadge module={req.module} />
                    </td>

                    {/* Details */}
                    <td className="py-4 px-6">
                      <Link
                        to={`/requests/${req.id}`}
                        className="font-bold text-slate-900 hover:text-emerald-600 block line-clamp-1 transition-colors"
                      >
                        {req.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{req.locality}, {req.city}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{req.priceDisplay}</span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">
                            {req.ownerName || req.ownerOrUser?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {req.ownerPhone || req.ownerOrUser?.phone}
                          </p>
                        </div>
                        {req.ownerContacted && (
                          <span
                            title="Owner has been contacted"
                            className="p-1 rounded-full bg-emerald-100 text-emerald-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {req.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center">
                            {req.assignedTo.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {req.assignedTo.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{req.assignedTo.role}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignModal({ open: true, request: req })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Assign</span>
                        </button>
                      )}
                    </td>

                    {/* Status & SLA */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={req.status} size="sm" />
                        <div>
                          <SlaCountdownBadge
                            minutesRemaining={req.slaMinutesLeft}
                            status={req.status}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setContactModal({ open: true, request: req })}
                          title="Contact Owner / Applicant"
                          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAssignModal({ open: true, request: req })}
                          title="Assign Staff"
                          className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        {req.status !== 'rejected' && req.status !== 'published' && (
                          <button
                            onClick={() => setRejectModal({ open: true, request: req })}
                            title="Reject"
                            className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/requests/${req.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {requests.length} requests in this view</span>
          <span className="font-mono text-[11px]">Synced with Seedha Cloud DB</span>
        </div>
      </div>

      {/* Modals */}
      {assignModal.request && (
        <AssignMemberModal
          isOpen={assignModal.open}
          onClose={() => setAssignModal({ open: false, request: null })}
          requestId={assignModal.request.id}
          propertyTitle={assignModal.request.title}
          currentAssigneeId={assignModal.request.assignedTo?.id || assignModal.request.assignedToId}
          onAssigned={loadRequests}
        />
      )}

      {contactModal.request && (
        <QuickContactModal
          isOpen={contactModal.open}
          onClose={() => setContactModal({ open: false, request: null })}
          requestId={contactModal.request.id}
          ownerName={contactModal.request.ownerName || contactModal.request.ownerOrUser?.name}
          ownerPhone={contactModal.request.ownerPhone || contactModal.request.ownerOrUser?.phone}
          ownerEmail={contactModal.request.ownerEmail || contactModal.request.ownerOrUser?.email}
          propertyTitle={contactModal.request.title}
          onContactLogged={loadRequests}
        />
      )}

      {rejectModal.request && (
        <RejectModal
          isOpen={rejectModal.open}
          onClose={() => setRejectModal({ open: false, request: null })}
          requestId={rejectModal.request.id}
          propertyTitle={rejectModal.request.title}
          onRejected={loadRequests}
        />
      )}
    </div>
  );
};
