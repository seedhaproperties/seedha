import React from 'react';
import { ModuleType } from '../../types';
import {
  Building2,
  Key,
  Briefcase,
  Wrench,
  BadgePercent,
  FileText,
  UserCheck,
  Home,
} from 'lucide-react';

interface ModuleBadgeProps {
  module: ModuleType;
  showIcon?: boolean;
}

const MODULE_DATA: Record<
  ModuleType,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }
> = {
  flat_building: {
    label: 'Buy / Sell Property',
    icon: Building2,
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
  },
  buy_sell: {
    label: 'Buy / Sell Property',
    icon: Building2,
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
  },
  rent: {
    label: 'Rent',
    icon: Key,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  commercial: {
    label: 'Commercial',
    icon: Briefcase,
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
  },
  pg_hostel: {
    label: 'PG & Hostel',
    icon: Home,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  property_management: {
    label: 'Property Mgmt',
    icon: Wrench,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  home_loan: {
    label: 'Home Loan',
    icon: BadgePercent,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  rental_agreements: {
    label: 'Rental Agreement',
    icon: FileText,
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
  },
  owner_background: {
    label: 'Owner BG Check',
    icon: UserCheck,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
};

export const ModuleBadge: React.FC<ModuleBadgeProps> = ({ module, showIcon = true }) => {
  const data = MODULE_DATA[module] || {
    label: module,
    icon: Building2,
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200',
  };
  const Icon = data.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium ${data.bg} ${data.color}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {data.label}
    </span>
  );
};
