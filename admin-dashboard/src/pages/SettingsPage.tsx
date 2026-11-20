import React from 'react';
import { MapPin } from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RejectionTemplate } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const serviceAreas = adminService.getServiceAreas();
  const rejectionTemplates = adminService.getRejectionTemplates();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Zones</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure operations hubs, SLA thresholds, service radius boundaries, and templates.
        </p>
      </div>

      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Admin Profile & Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Logged in Admin</span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block">{user?.name}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Email Address</span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block">{user?.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Access Role</span>
            <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Active Service Hubs & Radius Limits
            </h3>
            <p className="text-xs text-slate-500">
              Used by Property Management module to validate property eligibility.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceAreas.map((area) => {
            const hub = area.hubName || area.name;
            const radius = area.serviceRadiusKm || 15;
            return (
              <div
                key={area.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{hub}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{area.zone || 'Central Operations'}</p>
                  <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
                    Max Radius: {radius} km
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  ACTIVE
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Templates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-2">Rejection Notice Templates</h3>
        <p className="text-xs text-slate-500 mb-4">
          Standardized notices sent to users when a listing or request cannot be accepted.
        </p>

        <div className="space-y-3">
          {rejectionTemplates.map((t: RejectionTemplate) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
            >
              <span className="font-bold text-slate-800 block text-xs">{t.label || t.title}</span>
              <p className="text-slate-600 font-mono text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                "{t.template || t.body}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
