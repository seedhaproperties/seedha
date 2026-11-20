import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Building,
  Users,
  Bell,
  BarChart3,
  Settings,
  Building2,
  Key,
  Briefcase,
  Wrench,
  BadgePercent,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';

const MAIN_NAV = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Requests & Inbox', path: '/requests', icon: Inbox, badgeKey: 'newRequests' },
  { name: 'Live Listings', path: '/listings', icon: Building },
  { name: 'Team & Agents', path: '/team', icon: Users },
  { name: 'Alerts & SLA', path: '/notifications', icon: Bell, badgeKey: 'slaAlerts' },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Settings & Zones', path: '/settings', icon: Settings },
];

const MODULE_LINKS = [
  { name: 'Flat / Building', module: 'flat_building', icon: Building2 },
  { name: 'Rent', module: 'rent', icon: Key },
  { name: 'Commercial', module: 'commercial', icon: Briefcase },
  { name: 'Property Mgmt', module: 'property_management', icon: Wrench },
  { name: 'Home Loan', module: 'home_loan', icon: BadgePercent },
  { name: 'Rental Agreements', module: 'rental_agreements', icon: FileText },
  { name: 'Owner Verification', module: 'owner_background', icon: UserCheck },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const requests = adminService.getRequestsSync();
  const pendingCount = requests.filter(
    (r) => r.status === 'new' || r.status === 'in_review' || r.status === 'assigned'
  ).length;
  const notifications = adminService.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 font-bold">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>Seedha</span>
              <span className="text-emerald-400">Ops</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Real Estate Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Core Nav */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations
          </p>
          <nav className="space-y-1">
            {MAIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400 font-semibold border-l-4 border-emerald-500 pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badgeKey === 'newRequests' && pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {pendingCount}
                    </span>
                  )}
                  {item.badgeKey === 'slaAlerts' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* 7 Business Modules */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              7 Business Modules
            </p>
          </div>
          <nav className="space-y-0.5">
            {MODULE_LINKS.map((mod) => {
              const Icon = mod.icon;
              const isSelected =
                location.pathname === '/requests' &&
                location.search.includes(`module=${mod.module}`);

              const count = requests.filter((r) => r.module === mod.module && r.status !== 'rejected' && r.status !== 'published').length;

              return (
                <NavLink
                  key={mod.module}
                  to={`/requests?module=${mod.module}`}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{mod.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      {count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick SLA Status */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              SLA Health
            </span>
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-slate-300 font-medium">98.4% On-Time Verification</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full w-[98%]" />
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-700/50 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{user?.name || 'Admin Ops'}</p>
            <p className="text-[10px] text-emerald-400 truncate font-mono">
              {user?.role || 'SUPER_ADMIN'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
