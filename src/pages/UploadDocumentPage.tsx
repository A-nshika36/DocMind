import React from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { FileUploader } from '../components/FileUploader.js';
import { DocumentItem } from '../types/index.js';

interface UploadDocumentPageProps {
  onUploadSuccess: (doc: DocumentItem) => void;
  onNavigateToDoc: (doc: DocumentItem) => void;
  onNavigate: (tab: string) => void;
}

export const UploadDocumentPage: React.FC<UploadDocumentPageProps> = ({
  onUploadSuccess,
  onNavigateToDoc,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2929]">Upload Document</h1>
          <p className="text-sm text-[#718096] mt-0.5">
            Add a study document to extract summaries, answer questions, and practice MCQs.
          </p>
        </div>
        <button
          onClick={() => onNavigate('my-documents')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#4A5568] hover:bg-[#F7F7F5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>
      </div>

      <FileUploader
        onUploadSuccess={onUploadSuccess}
        onNavigateToDoc={(doc) => {
          onNavigateToDoc(doc);
        }}
      />
    </div>
  );
};
