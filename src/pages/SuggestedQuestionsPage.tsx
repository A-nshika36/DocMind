import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  RotateCw,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { DocumentItem } from '../types/index.js';
import { fetchSuggestedQuestions } from '../services/api.js';
import { SuggestedQuestionCard } from '../components/SuggestedQuestionCard.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

interface SuggestedQuestionsPageProps {
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onNavigateToChatWithQuestion: (question: string) => void;
  onNavigate: (tab: string) => void;
}

export const SuggestedQuestionsPage: React.FC<SuggestedQuestionsPageProps> = ({
  selectedDoc,
  documents,
  onSelectDoc,
  onNavigateToChatWithQuestion,
  onNavigate,
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async (docId: string, regenerate = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSuggestedQuestions(docId, regenerate);
      setQuestions(res.questions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate suggested questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      if (selectedDoc.suggested_questions && selectedDoc.suggested_questions.length > 0) {
        setQuestions(selectedDoc.suggested_questions);
      } else {
        loadQuestions(selectedDoc.id, false);
      }
    } else {
      setQuestions([]);
    }
  }, [selectedDoc]);

  if (!selectedDoc) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1E2929]">Select a Document</h3>
        <p className="text-sm text-[#718096] max-w-md mx-auto mt-2 mb-6">
          Pick a document to inspect automatically generated study questions designed to test and deepen your comprehension.
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
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Automatic Study Prompts
            </span>
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
            onClick={() => loadQuestions(selectedDoc.id, true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CBD5E1] hover:border-[#0D7466] hover:bg-[#F7F7F5] text-xs font-semibold text-[#1E2929] transition-colors disabled:opacity-50"
            title="Generate new suggested questions"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Description banner */}
      <div className="p-4 rounded-2xl bg-[#E6F4F1]/60 border border-[#0D7466]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-[#0A5C51]">
          <Sparkles className="w-4 h-4 text-[#0D7466] shrink-0" />
          <span>
            Click any question below to <strong>automatically send it to the AI Chat</strong> and receive an in-depth answer based on this document.
          </span>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          className="text-xs font-bold text-[#0D7466] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Open Chat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Loading State as required: Creating suggested questions... */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center shadow-xs">
          <LoadingSpinner message="Creating suggested questions..." size="lg" />
          <p className="text-xs text-[#718096] mt-2">
            Analyzing your text to discover key academic concepts and formulate study questions.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-red-800 text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => loadQuestions(selectedDoc.id, true)}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Questions List */}
      {!isLoading && questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, idx) => (
            <SuggestedQuestionCard
              key={idx}
              question={q}
              index={idx}
              onClick={(clickedQuestion) => {
                onNavigateToChatWithQuestion(clickedQuestion);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
