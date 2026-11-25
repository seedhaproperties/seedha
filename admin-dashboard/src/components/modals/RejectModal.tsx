import React, { useState } from 'react';
import { X, Ban, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { RejectionTemplate } from '../../types';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  propertyTitle: string;
  onRejected: () => void;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  requestId,
  propertyTitle,
  onRejected,
}) => {
  const templates: RejectionTemplate[] = adminService.getRejectionTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]?.label || templates[0]?.title || ''
  );
  const [reason, setReason] = useState<string>(
    templates[0]?.template || templates[0]?.body || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTemplateChange = (label: string) => {
    setSelectedTemplate(label);
    const found = templates.find((t: RejectionTemplate) => (t.label || t.title) === label);
    if (found) {
      setReason(found.template || found.body || '');
    }
  };

  const handleConfirmReject = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await adminService.updateRequest(
        requestId,
        {
          status: 'rejected',
          rejectionReason: reason.trim(),
        },
        `Rejected listing: ${selectedTemplate || 'Custom Reason'}`
      );
      onRejected();
      onClose();
    } catch (e) {
      alert('Failed to reject: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Reject Property Request</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{propertyTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Common Reason
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {templates.map((tpl: RejectionTemplate) => {
                const label = tpl.label || tpl.title;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(label)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      selectedTemplate === label
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Rejection Notice Sent to Owner / Applicant
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-mono"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              Rejecting will mark this request as closed and notify the user with the reason
              specified above.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || isSubmitting}
            onClick={handleConfirmReject}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};
