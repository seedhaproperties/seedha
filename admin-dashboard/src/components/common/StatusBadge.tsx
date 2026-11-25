import React from 'react';
import { GlobalStatus } from '../../types';

interface StatusBadgeProps {
  status: GlobalStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  new: {
    label: 'New Request',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  in_review: {
    label: 'In Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  assigned: {
    label: 'Assigned',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  field_visit: {
    label: 'Field Visit',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200',
  },
  verified: {
    label: 'Verified',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    border: 'border-teal-200',
  },
  published: {
    label: 'Published',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
  needs_info: {
    label: 'Needs Info',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalizedKey = (status || 'new').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    border: 'border-slate-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
