import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Globe,
  AlertTriangle,
  Building2,
  Key,
  Briefcase,
  Wrench,
  BadgePercent,
  FileText,
  UserCheck,
  Home,
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { adminService } from '../services/api';
import { PropertyRequest, ModuleType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModuleBadge } from '../components/common/ModuleBadge';
import { SlaCountdownBadge } from '../components/common/SlaCountdownBadge';

export const DashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const data = await adminService.getRequests();
      const met = await adminService.getMetrics();
      setRequests(data);
      setMetrics(met);
    }
    loadData();
  }, []);

  const urgentRequests = requests
    .filter((r) => r.status !== 'published' && r.status !== 'rejected')
    .sort((a, b) => (a.slaMinutesLeft ?? 100) - (b.slaMinutesLeft ?? 100))
    .slice(0, 5);

  const MODULE_CARDS: Array<{
    key: ModuleType;
    label: string;
    subtitle: string;
    workflow: string;
    icon: React.FC<{ className?: string }>;
    color: string;
  }> = [
    {
      key: 'flat_building',
      label: 'Buy / Sell Property',
      subtitle: 'Resale & new apartment listings',
      workflow: 'Check → Field Visit → Verify → Publish',
      icon: Building2,
      color: 'from-sky-500 to-blue-600',
    },
    {
      key: 'rent',
      label: 'Rent',
      subtitle: 'Residential rental units & flats',
      workflow: 'Check → Field Visit → Verify → Publish',
      icon: Key,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      key: 'commercial',
      label: 'Commercial',
      subtitle: 'Offices, retail stores & warehouses',
      workflow: 'Check → Field Visit → Verify → Publish',
      icon: Briefcase,
      color: 'from-violet-500 to-purple-600',
    },
    {
      key: 'pg_hostel',
      label: 'PG & Hostel',
      subtitle: 'Beds, shared rooms, food & hostel facilities',
      workflow: 'Check → Room & Amenities Check → Verify → Publish',
      icon: Home,
      color: 'from-amber-500 to-orange-600',
    },
    {
      key: 'property_management',
      label: 'Property Management',
      subtitle: 'Owner property care & tenant search',
      workflow: 'Check → Location Check → Radius Match/Mismatch',
      icon: Wrench,
      color: 'from-amber-500 to-orange-600',
    },
    {
      key: 'home_loan',
      label: 'Home Loan',
      subtitle: 'Borrower advisory & bank submissions',
      workflow: 'Lead → Contacted → Docs → Bank → Disbursed',
      icon: BadgePercent,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      key: 'rental_agreements',
      label: 'Rental Agreements',
      subtitle: 'Digital stamp papers & legal signing',
      workflow: 'Draft → Review → E-Sign → Delivered',
      icon: FileText,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      key: 'owner_background',
      label: 'Owner Background Verification',
      subtitle: 'Identity, litigation & ownership proof',
      workflow: 'Digital Check → Physical Visit → Clear/Flagged',
      icon: UserCheck,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operations Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time pipeline across Seedha Properties business verticals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Inbox className="w-4 h-4" />
            <span>Open All Requests</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.totalRequests !== undefined ? metrics.totalRequests : requests.length}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Database Synced</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              New Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {metrics.newRequests !== undefined
              ? metrics.newRequests
              : requests.filter((r) => r.status === 'new').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Awaiting triage & assignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Under Review / Field
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {metrics.inReview !== undefined
              ? metrics.inReview
              : requests.filter(
                  (r) =>
                    r.status === 'in_review' ||
                    r.status === 'assigned' ||
                    r.status === 'field_visit'
                ).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Active field visits & docs check</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Live Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {metrics.published !== undefined
              ? metrics.published
              : requests.filter((r) => r.status === 'published').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Live in Seedha App</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              SLA Urgent (&lt;60m)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">
            {metrics.slaAlerts !== undefined
              ? metrics.slaAlerts
              : requests.filter(
                  (r) =>
                    (r.slaMinutesLeft ?? 100) <= 60 &&
                    r.status !== 'published' &&
                    r.status !== 'rejected'
                ).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requires immediate action</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Business Vertical Pipelines</h2>
            <p className="text-xs text-slate-500">
              Select any vertical to inspect active submissions and workflow queues.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MODULE_CARDS.map((mod) => {
            const Icon = mod.icon;
            const count = requests.filter((r) => r.module === mod.key).length;
            const pending = requests.filter(
              (r) => r.module === mod.key && r.status !== 'published' && r.status !== 'rejected'
            ).length;

            return (
              <div
                key={mod.key}
                onClick={() => navigate(`/requests?module=${mod.key}`)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {count} total
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {mod.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{mod.subtitle}</p>

                  <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-mono">
                    {mod.workflow}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className={pending > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                    {pending} in active pipeline
                  </span>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA Urgent Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Priority SLA Queue</h3>
              <p className="text-xs text-slate-500">
                Requests approaching SLA deadline requiring verification or triage.
              </p>
            </div>
          </div>
          <Link
            to="/requests"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">ID & Module</th>
                <th className="py-3 px-6">Property / Title</th>
                <th className="py-3 px-6">Owner / Applicant</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">SLA Countdown</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {urgentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-slate-900 block">
                      {req.code || req.id}
                    </span>
                    <ModuleBadge module={req.module} showIcon={false} />
                  </td>
                  <td className="py-3.5 px-6">
                    <p className="font-semibold text-slate-800 truncate max-w-xs">{req.title}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{req.locality}, {req.city}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <p className="font-medium text-slate-800">{req.ownerOrUser?.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{req.ownerOrUser?.phone}</p>
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <StatusBadge status={req.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <SlaCountdownBadge
                      minutesRemaining={req.slaMinutesLeft}
                      status={req.status}
                    />
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap text-right">
                    <Link
                      to={`/requests/${req.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
