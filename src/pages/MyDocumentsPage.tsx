import React, { useState } from 'react';
import {
  FileText,
  Search,
  Upload,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { DocumentItem } from '../types/index.js';
import { DocumentCard } from '../components/DocumentCard.js';
import { Modal } from '../components/Modal.js';
import { deleteDocumentById } from '../services/api.js';

interface MyDocumentsPageProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDoc: (doc: DocumentItem) => void;
  onNavigate: (tab: string) => void;
  onRefreshDocuments: () => void;
}

export const MyDocumentsPage: React.FC<MyDocumentsPageProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onNavigate,
  onRefreshDocuments,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredDocuments = documents.filter((doc) =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDocumentById(docToDelete.id);
      setDocToDelete(null);
      onRefreshDocuments();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2929]">My Documents</h1>
          <p className="text-sm text-[#718096] mt-0.5">
            Manage your uploaded study files ({documents.length})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all"
          />
        </div>
      )}

      {/* Document Grid or Empty State */}
      {documents.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1E2929]">No documents yet</h3>
          <p className="text-sm text-[#718096] max-w-sm mx-auto mt-1 mb-6">
            Upload your first PDF or TXT document to generate summaries, chat with your notes, and practice MCQs.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="px-5 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            Upload Document
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <p className="text-sm text-[#718096]">
            No documents matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isActive={selectedDoc?.id === doc.id}
              onSelect={(selected) => {
                onSelectDoc(selected);
              }}
              onSummary={(selected) => {
                onSelectDoc(selected);
                onNavigate('summary');
              }}
              onAskQuestions={(selected) => {
                onSelectDoc(selected);
                onNavigate('chat');
              }}
              onGenerateMCQs={(selected) => {
                onSelectDoc(selected);
                onNavigate('mcq');
              }}
              onDelete={(selected) => {
                setDocToDelete(selected);
              }}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Are you sure you want to delete this document?</p>
              <p className="text-xs text-red-700 mt-1">
                "{docToDelete?.file_name}" and its associated Q&A chat history and MCQs will be permanently removed.
              </p>
            </div>
          </div>

          {deleteError && (
            <p className="text-xs text-red-600 font-medium">{deleteError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDocToDelete(null)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-sm font-medium text-[#4A5568] hover:bg-[#F7F7F5]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
