import React, { useState } from 'react';
import { X, HelpCircle, Send } from 'lucide-react';
import { adminService } from '../../services/api';

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  propertyTitle: string;
  onInfoRequested: () => void;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  isOpen,
  onClose,
  requestId,
  propertyTitle,
  onInfoRequested,
}) => {
  const [missingDocs] = useState<string[]>([
    'Latest Electricity / Water Utility Bill',
    'Encumbrance Certificate (EC)',
    'Approved Building Layout Plan',
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (doc: string) => {
    setSelectedItems((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const handleSend = async () => {
    if (selectedItems.length === 0 && !customNote.trim()) return;
    setIsSubmitting(true);
    try {
      const summary = [
        ...selectedItems,
        customNote.trim() ? `Note: ${customNote.trim()}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      await adminService.updateRequest(
        requestId,
        {
          status: 'needs_info',
          moreInfoNote: summary,
        },
        `Requested additional information/documents: ${summary}`
      );
      onInfoRequested();
      onClose();
    } catch (e) {
      alert('Failed to send request: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Request Information / Documents</h3>
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
              Select Missing Documents to Request
            </label>
            <div className="space-y-2">
              {missingDocs.map((doc) => {
                const checked = selectedItems.includes(doc);
                return (
                  <div
                    key={doc}
                    onClick={() => toggleItem(doc)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      checked
                        ? 'border-orange-500 bg-orange-50/50 text-orange-900 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-xs">{doc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Specific Message for the Owner
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please upload clear scan of the sale deed front page and municipal tax challan."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
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
            disabled={(selectedItems.length === 0 && !customNote.trim()) || isSubmitting}
            onClick={handleSend}
            className="px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
