import React from 'react';
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

export const ReportsPage: React.FC = () => {
  const requests = adminService.getRequestsSync();

  const total = requests.length;
  const verified = requests.filter((r) => r.status === 'verified' || r.status === 'published').length;
  const rejected = requests.filter((r) => r.status === 'rejected').length;
  const inProgress = requests.filter((r) => r.status === 'in_review' || r.status === 'assigned' || r.status === 'field_visit').length;

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
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Flat / Building</td>
                <td className="py-3.5 px-6">12</td>
                <td className="py-3.5 px-6 text-emerald-600">8</td>
                <td className="py-3.5 px-6 text-rose-600">1</td>
                <td className="py-3.5 px-6 font-mono">11.4h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">96.8%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Rent</td>
                <td className="py-3.5 px-6">18</td>
                <td className="py-3.5 px-6 text-emerald-600">15</td>
                <td className="py-3.5 px-6 text-rose-600">2</td>
                <td className="py-3.5 px-6 font-mono">8.2h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">99.1%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Commercial</td>
                <td className="py-3.5 px-6">6</td>
                <td className="py-3.5 px-6 text-emerald-600">4</td>
                <td className="py-3.5 px-6 text-rose-600">1</td>
                <td className="py-3.5 px-6 font-mono">18.6h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">94.2%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Property Management</td>
                <td className="py-3.5 px-6">9</td>
                <td className="py-3.5 px-6 text-emerald-600">6</td>
                <td className="py-3.5 px-6 text-rose-600">2</td>
                <td className="py-3.5 px-6 font-mono">4.1h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">98.5%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Home Loan</td>
                <td className="py-3.5 px-6">14</td>
                <td className="py-3.5 px-6 text-emerald-600">10</td>
                <td className="py-3.5 px-6 text-rose-600">1</td>
                <td className="py-3.5 px-6 font-mono">22.4h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">92.0%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Rental Agreements</td>
                <td className="py-3.5 px-6">25</td>
                <td className="py-3.5 px-6 text-emerald-600">24</td>
                <td className="py-3.5 px-6 text-rose-600">0</td>
                <td className="py-3.5 px-6 font-mono">2.8h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">99.8%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Owner BG Check</td>
                <td className="py-3.5 px-6">11</td>
                <td className="py-3.5 px-6 text-emerald-600">9</td>
                <td className="py-3.5 px-6 text-rose-600">1</td>
                <td className="py-3.5 px-6 font-mono">16.0h</td>
                <td className="py-3.5 px-6 text-emerald-600 font-bold">95.4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
