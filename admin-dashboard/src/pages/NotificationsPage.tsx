import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { adminService } from '../services/api';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = async () => {
    const list = await adminService.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = (id: string) => {
    adminService.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    adminService.markAllNotificationsRead();
    loadNotifications();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Alerts & SLA Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System warnings, SLA deadline notices, and field agent completion updates.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
        {notifications.map((n) => {
          const isUrgent = n.type === 'SLA_BREACH' || n.type === 'URGENT';
          return (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.read ? 'bg-slate-50/80' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUrgent
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {isUrgent ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    {new Date(n.timestamp || Date.now()).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
