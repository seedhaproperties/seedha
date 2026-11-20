import React from 'react';
import { X, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  if (!isOpen || !document) return null;

  const title = document.title || document.name;
  const fileType = document.fileType || document.type || 'application/pdf';
  const fileSize = document.fileSize || document.size || '1.4 MB';
  const fileUrl = document.fileUrl || document.url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000';

  const isImage = fileType.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {fileType} • {fileSize}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100 flex items-center justify-center">
          {isImage ? (
            <img
              src={fileUrl}
              alt={title}
              className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">{title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  PDF / Scanned Legal Certificate Document
                </p>
                {document.summary && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {document.summary}
                  </p>
                )}
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-700 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Verified & Watermarked</span>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Original Document</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Uploaded: {document.uploadedAt || 'Recent'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
