import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SlaCountdownBadgeProps {
  minutesRemaining?: number;
  status: string;
}

export const SlaCountdownBadge: React.FC<SlaCountdownBadgeProps> = ({
  minutesRemaining = 120,
  status,
}) => {
  const normStatus = (status || '').toLowerCase();

  if (normStatus === 'published' || normStatus === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
        <CheckCircle2 className="w-3 h-3" />
        SLA Met
      </span>
    );
  }

  if (normStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        Closed
      </span>
    );
  }

  if (minutesRemaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-semibold animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        SLA Breached
      </span>
    );
  }

  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;

  const isUrgent = minutesRemaining <= 60;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
        isUrgent
          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <Clock className="w-3 h-3" />
      {timeStr}
    </span>
  );
};
