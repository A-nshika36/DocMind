import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  BookOpen,
  ListChecks,
  Lightbulb,
  Key,
  RotateCw,
  Sparkles,
  FileCheck,
  FolderOpen,
} from 'lucide-react';
import { DocumentItem, StructuredSummary } from '../types/index.js';
import { fetchDocumentSummary } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

interface SummaryPageProps {
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onNavigate: (tab: string) => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  selectedDoc,
  documents,
  onSelectDoc,
  onNavigate,
}) => {
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async (docId: string, regenerate = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDocumentSummary(docId, regenerate);
      setSummary(response.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary for this document.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      if (selectedDoc.summary) {
        setSummary(selectedDoc.summary);
      } else {
        loadSummary(selectedDoc.id, false);
      }
    } else {
      setSummary(null);
    }
  }, [selectedDoc]);

  // If no document is selected
  if (!selectedDoc) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
          <FileSearch className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1E2929]">Select a Document for Summary</h3>
        <p className="text-sm text-[#718096] max-w-md mx-auto mt-2 mb-6">
          Choose a document from your library to generate a structured AI summary with key points, core concepts, and definitions.
        </p>

        {documents.length > 0 ? (
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-xs font-bold text-[#718096] uppercase tracking-wider block mb-2">
              Select one of your documents:
            </span>
            {documents.slice(0, 5).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="w-full p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0D7466] hover:bg-[#F0FDF4] text-left text-sm font-semibold text-[#1E2929] flex items-center justify-between transition-all"
              >
                <span className="truncate">{doc.file_name}</span>
                <span className="text-xs text-[#0D7466] font-bold">Select</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('upload')}
            className="px-6 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            Upload a Document
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Document Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center shrink-0">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0D7466] uppercase tracking-wider">
                Document Summary
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
              <span className="text-xs text-[#718096]">{selectedDoc.file_type.toUpperCase()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E2929] truncate" title={selectedDoc.file_name}>
              {selectedDoc.file_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {documents.length > 1 && (
            <select
              value={selectedDoc.id}
              onChange={(e) => {
                const found = documents.find((d) => d.id === e.target.value);
                if (found) onSelectDoc(found);
              }}
              className="px-3 py-2 rounded-xl bg-[#F7F7F5] border border-[#CBD5E1] text-xs font-medium text-[#1E2929] outline-none"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.file_name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => loadSummary(selectedDoc.id, true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] hover:border-[#0D7466] hover:bg-[#F7F7F5] text-xs font-semibold text-[#1E2929] transition-colors disabled:opacity-50"
            title="Regenerate summary"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Loading state as required: Analyzing your document... */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center shadow-xs">
          <LoadingSpinner message="Analyzing your document..." size="lg" />
          <p className="text-xs text-[#718096] mt-2">
            Extracting key points, concepts, and terminology based strictly on your document.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-red-800 text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => loadSummary(selectedDoc.id, true)}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Structured Summary Display */}
      {summary && !isLoading && (
        <div className="space-y-6">
          {/* 1. Overview */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2.5 mb-3 text-[#0D7466]">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-lg font-bold text-[#1E2929]">Overview</h2>
            </div>
            <p className="text-sm sm:text-base text-[#2D3748] leading-relaxed">
              {summary.overview}
            </p>
          </section>

          {/* 2. Key Points */}
          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 text-[#0D7466]">
                <ListChecks className="w-5 h-5" />
                <h2 className="text-lg font-bold text-[#1E2929]">Key Points</h2>
              </div>
              <ul className="space-y-2.5">
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#2D3748] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#E6F4F1] text-[#0A5C51] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. Important Concepts */}
          {summary.importantConcepts && summary.importantConcepts.length > 0 && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 text-[#0D7466]">
                <Lightbulb className="w-5 h-5" />
                <h2 className="text-lg font-bold text-[#1E2929]">Important Concepts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.importantConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E2E8F0] hover:border-[#0D7466]/40 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-[#1E2929] mb-1">
                      {item.term}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Important Terms */}
          {summary.importantTerms && summary.importantTerms.length > 0 && (
            <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4 text-[#0D7466]">
                <Key className="w-5 h-5" />
                <h2 className="text-lg font-bold text-[#1E2929]">Important Terms</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.importantTerms.map((termItem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E2E8F0]"
                  >
                    <span className="text-xs font-bold text-[#0D7466] uppercase tracking-wide block mb-1">
                      {termItem.term}
                    </span>
                    <p className="text-xs text-[#4A5568] leading-snug">
                      {termItem.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Conclusion */}
          {summary.conclusion && (
            <section className="bg-[#E6F4F1]/50 rounded-2xl p-6 sm:p-7 border border-[#0D7466]/20 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-2 text-[#0A5C51]">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-bold text-[#1E2929]">Conclusion</h2>
              </div>
              <p className="text-sm sm:text-base text-[#1E2929] leading-relaxed font-medium">
                {summary.conclusion}
              </p>
            </section>
          )}

          {/* Action next steps */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-[#718096]">
              All summary points are derived strictly from {selectedDoc.file_name}.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('chat')}
                className="px-4 py-2 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Ask Questions about this Document
              </button>
              <button
                onClick={() => onNavigate('mcq')}
                className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#0D7466] text-xs font-semibold text-[#1E2929] transition-colors"
              >
                Practice MCQs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
