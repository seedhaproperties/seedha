import React, { useState } from 'react';
import { X, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { PropertyRequest } from '../../types';
import { adminService } from '../../services/api';

interface VerifyPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PropertyRequest;
  onPublished: () => void;
}

export const VerifyPublishModal: React.FC<VerifyPublishModalProps> = ({
  isOpen,
  onClose,
  request,
  onPublished,
}) => {
  const [publishNotes, setPublishNotes] = useState(
    'All title documents and physical field visit parameters verified successfully. Approved for public listing on Seedha Properties platform.'
  );
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await adminService.updateRequest(
        request.id,
        {
          status: 'published',
          postPublishState: 'live',
        },
        `Approved & Published to live platform by Admin Ops${featured ? ' (Featured)' : ''}`
      );
      onPublished();
      onClose();
    } catch (e) {
      alert('Failed to publish: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Publish to Live Portal</h3>
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
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Seedha Guarantee Badge Applied</span>
            </div>
            <p className="text-xs text-emerald-700">
              This property has passed physical verification and owner identity clearance. Once published, it will be instantly searchable in the user mobile app.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Publication Remarks
            </label>
            <textarea
              rows={3}
              value={publishNotes}
              onChange={(e) => setPublishNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mark as Featured Listing (Homepage Banner Slot)</span>
            </div>
          </label>
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
            disabled={isSubmitting}
            onClick={handlePublish}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
