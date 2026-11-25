import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { adminService } from '../services/api';
import { PropertyRequest } from '../types';

export const ReportsPage: React.FC = () => {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [reqs, rep] = await Promise.all([
        adminService.getRequests(),
        adminService.getReports(),
      ]);
      setRequests(reqs);
      setReportData(rep);
      setLoading(false);
    }
    load();
  }, []);

  const total = reportData?.summary?.totalProperties || requests.length;
  const verified = reportData?.summary?.verifiedProperties || requests.filter((r) => r.status === 'verified' || r.status === 'published').length;
  const rejected = reportData?.summary?.rejectedProperties || requests.filter((r) => r.status === 'rejected').length;
  const passRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Operations & Verification Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Turnaround times, verification throughput, and vertical performance metrics.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Throughput
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{total} Cases</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">All 7 business verticals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Clearance Pass Rate
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{passRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{verified} listings published / verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Avg Turnaround Time
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-2">14.2 Hours</p>
          <p className="text-xs text-slate-500 mt-1">Target SLA: &lt; 24.0 Hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Rejection Ratio
          </span>
          <p className="text-2xl font-bold text-rose-700 mt-2">
            {total > 0 ? Math.round((rejected / total) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{rejected} fraudulent/mismatched</p>
        </div>
      </div>

      {/* Vertical Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Vertical Breakdown & SLAs</h3>
          <span className="text-xs font-mono text-slate-400">Past 30 Days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Module Vertical</th>
                <th className="py-3 px-6">Submissions</th>
                <th className="py-3 px-6">Verified</th>
                <th className="py-3 px-6">Rejected</th>
                <th className="py-3 px-6">Avg SLA</th>
                <th className="py-3 px-6">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {[
                { key: 'flat_building', label: 'Flat / Building', avgSla: '11.4h' },
                { key: 'rent', label: 'Rent', avgSla: '8.2h' },
                { key: 'commercial', label: 'Commercial', avgSla: '18.6h' },
                { key: 'pg_hostel', label: 'PG & Hostel', avgSla: '12.0h' },
                { key: 'property_management', label: 'Property Management', avgSla: '4.1h' },
                { key: 'home_loan', label: 'Home Loan', avgSla: '22.4h' },
                { key: 'rental_agreements', label: 'Rental Agreements', avgSla: '2.8h' },
                { key: 'owner_background', label: 'Owner BG Check', avgSla: '16.0h' },
              ].map((v) => {
                const sub = requests.filter((r) => r.module === v.key).length;
                const ver = requests.filter(
                  (r) => r.module === v.key && (r.status === 'verified' || r.status === 'published')
                ).length;
                const rej = requests.filter((r) => r.module === v.key && r.status === 'rejected').length;
                const compliance = sub > 0 ? Math.round(((sub - rej) / sub) * 100) : 100;

                return (
                  <tr key={v.key}>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{v.label}</td>
                    <td className="py-3.5 px-6">{sub}</td>
                    <td className="py-3.5 px-6 text-emerald-600">{ver}</td>
                    <td className="py-3.5 px-6 text-rose-600">{rej}</td>
                    <td className="py-3.5 px-6 font-mono">{v.avgSla}</td>
                    <td className="py-3.5 px-6 text-emerald-600 font-bold">{compliance}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
