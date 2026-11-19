import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  RotateCw,
  Plus,
} from 'lucide-react';
import { DocumentItem, MCQItem, MCQAttemptResult } from '../types/index.js';
import {
  generateMCQsApi,
  fetchDocumentMCQs,
  submitMCQAttemptApi,
} from '../services/api.js';
import { MCQPracticeCard } from '../components/MCQPracticeCard.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

interface MCQPracticePageProps {
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onNavigate: (tab: string) => void;
}

export const MCQPracticePage: React.FC<MCQPracticePageProps> = ({
  selectedDoc,
  documents,
  onSelectDoc,
  onNavigate,
}) => {
  const [mcqs, setMcqs] = useState<MCQItem[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing questions for this document if any
  const loadExistingMCQs = async (docId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchDocumentMCQs(docId);
      setMcqs(res.mcqs || []);
      if (!res.mcqs || res.mcqs.length === 0) {
        setShowGeneratorModal(true);
      } else {
        setShowGeneratorModal(false);
      }
    } catch (err: any) {
      console.error('Failed to load MCQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      loadExistingMCQs(selectedDoc.id);
    } else {
      setMcqs([]);
    }
  }, [selectedDoc]);

  // Handle MCQ generation as required: Loading state "Generating MCQs..."
  const handleGenerate = async () => {
    if (!selectedDoc) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await generateMCQsApi(selectedDoc.id, questionCount, difficulty);
      setMcqs(res.mcqs || []);
      setShowGeneratorModal(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while generating MCQs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit practice attempt
  const handleSubmitAttempt = async (
    answers: Record<string, string>
  ): Promise<MCQAttemptResult | null> => {
    if (!selectedDoc) return null;
    try {
      const res = await submitMCQAttemptApi(selectedDoc.id, answers);
      return res.result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit practice attempt.');
      return null;
    }
  };

  if (!selectedDoc) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1E2929]">Select a Document for MCQs</h3>
        <p className="text-sm text-[#718096] max-w-md mx-auto mt-2 mb-6">
          Choose a study file to generate customized multiple-choice practice quizzes and test your knowledge.
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
          <div className="w-11 h-11 rounded-2xl bg-[#0D7466] text-white flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#0D7466] uppercase tracking-wider">
              MCQ Practice Arena
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
            onClick={() => setShowGeneratorModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New MCQs</span>
          </button>
        </div>
      </div>

      {/* Generator Configuration Panel / Modal */}
      {showGeneratorModal && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0D7466]/40 shadow-md max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1E2929]">Generate Practice MCQs</h2>
            <p className="text-xs text-[#718096] mt-1">
              Select questions count and difficulty level based on "{selectedDoc.file_name}"
            </p>
          </div>

          <div className="space-y-6">
            {/* Number of Questions: 5, 10, 15, 20 */}
            <div>
              <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                      questionCount === num
                        ? 'bg-[#0D7466] text-white border-[#0D7466] shadow-xs'
                        : 'bg-white border-[#CBD5E1] text-[#4A5568] hover:border-[#0D7466]'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty: Easy, Medium, Hard */}
            <div>
              <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                      difficulty === diff
                        ? 'bg-[#0A5C51] text-white border-[#0A5C51] shadow-xs'
                        : 'bg-white border-[#CBD5E1] text-[#4A5568] hover:border-[#0A5C51]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium text-center">{error}</p>
            )}

            {/* Generate Button */}
            <div className="pt-2 flex gap-3">
              {mcqs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="py-3 px-4 rounded-xl border border-[#CBD5E1] text-sm font-semibold text-[#4A5568] hover:bg-[#F7F7F5] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating MCQs...' : 'Generate MCQs'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state as required: Generating MCQs... */}
      {isGenerating && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center shadow-xs">
          <LoadingSpinner message="Generating MCQs..." size="lg" />
          <p className="text-xs text-[#718096] mt-2">
            Formulating {questionCount} {difficulty} multiple-choice questions with answer keys and document citations.
          </p>
        </div>
      )}

      {/* Active MCQ Practice Interface */}
      {!showGeneratorModal && !isGenerating && (
        <MCQPracticeCard
          questions={mcqs}
          onSubmit={handleSubmitAttempt}
          onReset={() => setShowGeneratorModal(true)}
          documentTitle={selectedDoc.file_name}
        />
      )}
    </div>
  );
};
