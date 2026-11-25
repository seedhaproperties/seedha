import React, { useState } from 'react';
import { X, Phone, MessageSquare, CheckCircle2, Copy } from 'lucide-react';
import { adminService } from '../../services/api';

interface QuickContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  propertyTitle: string;
  onContactLogged: () => void;
}

export const QuickContactModal: React.FC<QuickContactModalProps> = ({
  isOpen,
  onClose,
  requestId,
  ownerName = 'Owner',
  ownerPhone = '+91 98480 00000',
  ownerEmail,
  propertyTitle,
  onContactLogged,
}) => {
  const [copied, setCopied] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(ownerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogContact = async (channel: string) => {
    setIsSubmitting(true);
    try {
      await adminService.updateRequest(
        requestId,
        {
          ownerContacted: true,
          status: 'in_review',
        },
        `Contacted ${ownerName} via ${channel}${callNotes ? `: ${callNotes}` : ''}`
      );
      onContactLogged();
      onClose();
    } catch (e) {
      alert('Failed to log contact: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const waText = encodeURIComponent(
    `Hello ${ownerName}, I'm calling from Seedha Properties operations team regarding your property listing submission: "${propertyTitle}". Let us know when it's convenient to discuss the verification visit.`
  );
  const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Contact Owner / Applicant</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{ownerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                <p className="text-base font-bold text-slate-800">{ownerPhone}</p>
              </div>
              <button
                onClick={handleCopyPhone}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg hover:bg-white text-slate-600 flex items-center gap-1 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            {ownerEmail && (
              <div>
                <p className="text-xs text-slate-500 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-slate-700">{ownerEmail}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${ownerPhone}`}
              onClick={() => handleLogContact('Direct Phone Call')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 font-semibold text-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct</span>
            </a>
            <a
              href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleLogContact('WhatsApp')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-700 font-semibold text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Call / Contact Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="e.g. Owner agreed for field visit tomorrow at 11 AM..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleLogContact('Recorded Contact')}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Contacted'}
          </button>
        </div>
      </div>
    </div>
  );
};
