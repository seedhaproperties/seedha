import React, { useState } from 'react';
import { X, CheckSquare, MapPin } from 'lucide-react';
import { PropertyRequest } from '../../types';
import { adminService } from '../../services/api';

interface FieldVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PropertyRequest;
  onVerified: () => void;
}

export const FieldVisitModal: React.FC<FieldVisitModalProps> = ({
  isOpen,
  onClose,
  request,
  onVerified,
}) => {
  const [checklist, setChecklist] = useState<Array<{ item: string; completed: boolean }>>([
    { item: 'Physical building/site existence verified on-ground', completed: true },
    { item: 'Owner identity confirmed with Aadhaar / PAN card', completed: true },
    { item: 'High-res geo-tagged property photos captured', completed: true },
    { item: 'Furnishing, amenities and dimensions cross-checked', completed: true },
  ]);
  const [verificationNotes, setVerificationNotes] = useState(
    'Field agent completed physical inspection. Property matches specifications provided in submission.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (idx: number) => {
    setChecklist((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, completed: !c.completed } : c))
    );
  };

  const allChecked = checklist.every((c) => c.completed);
  const agentName = request.assignedTo?.name || request.assignedToName || 'Field Ops';

  const handleCompleteVerification = async () => {
    setIsSubmitting(true);
    try {
      await adminService.updateRequest(
        request.id,
        {
          status: 'verified',
          fieldVisit: {
            ...request.fieldVisit,
            status: 'COMPLETED',
            checklist,
            notes: verificationNotes,
          },
        },
        `Field visit completed and verified by ${agentName}`
      );
      onVerified();
      onClose();
    } catch (e) {
      alert('Failed to complete verification: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Field Visit Checklist</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{request.title}</p>
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
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{request.locality}, {request.city}</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Agent: {agentName}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Physical Inspection Requirements
            </label>
            <div className="space-y-2">
              {checklist.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleItem(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    c.completed
                      ? 'border-teal-500 bg-teal-50/50 text-teal-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={c.completed}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-medium leading-relaxed">{c.item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Verification Notes & Observations
            </label>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
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
            disabled={!allChecked || isSubmitting}
            onClick={handleCompleteVerification}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {isSubmitting ? 'Verifying...' : 'Mark as Verified'}
          </button>
        </div>
      </div>
    </div>
  );
};
