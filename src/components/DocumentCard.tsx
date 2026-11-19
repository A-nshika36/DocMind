import React from 'react';
import {
  FileText,
  FileCode,
  Calendar,
  FileSearch,
  MessageSquare,
  CheckSquare,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { DocumentItem } from '../types/index.js';

interface DocumentCardProps {
  document: DocumentItem;
  isActive?: boolean;
  onSelect: (doc: DocumentItem) => void;
  onSummary: (doc: DocumentItem) => void;
  onAskQuestions: (doc: DocumentItem) => void;
  onGenerateMCQs: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isActive = false,
  onSelect,
  onSummary,
  onAskQuestions,
  onGenerateMCQs,
  onDelete,
}) => {
  const isPdf = document.file_type === 'pdf';

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={`bg-[#FFFFFF] rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
        isActive
          ? 'border-[#0D7466] ring-2 ring-[#0D7466]/20 shadow-xs'
          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                isPdf
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              {isPdf ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => onSelect(document)}
                className="text-base font-bold text-[#1E2929] hover:text-[#0D7466] cursor-pointer truncate transition-colors"
                title={document.file_name}
              >
                {document.file_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#718096]">
                <span className="uppercase font-semibold px-2 py-0.5 rounded-md bg-[#F7F7F5] border border-[#E2E8F0]">
                  {document.file_type}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-[#A0AEC0]" />
                  {formatFileSize(document.file_size)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#A0AEC0]" />
                  {formatDate(document.uploaded_at)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(document)}
            className="p-1.5 rounded-lg text-[#A0AEC0] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            title="Delete document"
            aria-label="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Word count & readiness badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {document.word_count > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-[#F7F7F5] text-[#4A5568] border border-[#E2E8F0]">
              ~{document.word_count.toLocaleString()} words extracted
            </span>
          )}
          {document.has_summary && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Summary Ready
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons row */}
      <div className="px-5 py-3.5 bg-[#FBFBFA] border-t border-[#E2E8F0] grid grid-cols-3 gap-2">
        <button
          onClick={() => onSummary(document)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold text-[#0A5C51] bg-[#E6F4F1] hover:bg-[#D4EFEA] transition-colors"
          title="View AI Summary"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => onAskQuestions(document)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold text-[#1E2929] bg-white border border-[#CBD5E1] hover:border-[#0D7466] hover:text-[#0D7466] transition-colors shadow-2xs"
          title="Ask Questions with AI"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask Q&A</span>
        </button>

        <button
          onClick={() => onGenerateMCQs(document)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold text-white bg-[#0D7466] hover:bg-[#0A5C51] transition-colors shadow-2xs"
          title="Practice MCQs"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>MCQs</span>
        </button>
      </div>
    </div>
  );
};
