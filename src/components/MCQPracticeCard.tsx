import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
} from 'lucide-react';
import { MCQItem, MCQAttemptResult } from '../types/index.js';

interface MCQPracticeCardProps {
  questions: MCQItem[];
  onSubmit: (answers: Record<string, string>) => Promise<MCQAttemptResult | null>;
  onReset: () => void;
  documentTitle: string;
}

export const MCQPracticeCard: React.FC<MCQPracticeCardProps> = ({
  questions,
  onSubmit,
  onReset,
  documentTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<MCQAttemptResult | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] p-8">
        <HelpCircle className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#1E2929]">No MCQs Available</h3>
        <p className="text-sm text-[#718096] mt-1">
          Generate questions for "{documentTitle}" to begin practicing.
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentQ.id] || '';
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  const handleSelectOption = (optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const res = await onSubmit(userAnswers);
      if (res) {
        setResults(res);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setResults(null);
  };

  // If results are available, show the results and explanations screen
  if (results) {
    const percentage = results.percentage;
    const isPassing = percentage >= 60;

    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs max-w-3xl mx-auto animate-in fade-in duration-300">
        {/* Score Header */}
        <div className="text-center pb-6 border-b border-[#E2E8F0]">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#718096]">
            Practice Complete
          </span>
          <h2 className="text-3xl font-extrabold text-[#1E2929] mt-1">
            Your Score: {results.score} / {results.total}
          </h2>
          <p className="text-sm font-semibold text-[#0D7466] mt-1">
            Accuracy: {percentage}%
          </p>
          <p className="text-xs text-[#718096] mt-2">
            Based strictly on the content of "{documentTitle}"
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={handleTryAgain}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl bg-[#F7F7F5] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-sm font-semibold text-[#4A5568] transition-colors"
            >
              Generate New Questions
            </button>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-6 space-y-6">
          <h3 className="text-base font-bold text-[#1E2929]">
            Answer Explanations & Review
          </h3>

          {results.breakdown.map((item, idx) => (
            <div
              key={item.question_id || idx}
              className={`p-4 sm:p-5 rounded-xl border ${
                item.is_correct
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-red-50/60 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5">
                  {item.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1E2929]">
                    Q{idx + 1}. {item.question}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-[#4A5568]">
                      Your Answer:{' '}
                      <strong
                        className={item.is_correct ? 'text-emerald-700' : 'text-red-700'}
                      >
                        {item.selected_option ? `Option ${item.selected_option}` : 'Not answered'}
                      </strong>
                    </span>

                    {!item.is_correct && (
                      <span className="text-emerald-800 font-semibold">
                        Correct Answer: Option {item.correct_option}
                      </span>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-white/80 border border-black/5 text-xs text-[#2D3748] leading-relaxed">
                      <strong className="text-[#0D7466] font-semibold">Explanation: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string }> = [
    { key: 'A', label: currentQ.option_a },
    { key: 'B', label: currentQ.option_b },
    { key: 'C', label: currentQ.option_c },
    { key: 'D', label: currentQ.option_d },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
      {/* Top Header: Progress indicator */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-bold text-[#0D7466] uppercase tracking-wider">
            MCQ Practice Mode
          </span>
          <h2 className="text-lg font-bold text-[#1E2929]">
            Question {currentIndex + 1} of {totalQuestions}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#718096]">
            Answered: <strong className="text-[#1E2929]">{answeredCount}</strong> / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-[#0D7466] h-full transition-all duration-200 rounded-full"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="mb-6 p-4 rounded-xl bg-[#FBFBFA] border border-[#E2E8F0]">
        <p className="text-base sm:text-lg font-semibold text-[#1E2929] leading-relaxed">
          {currentQ.question}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-8">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => handleSelectOption(opt.key)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-[#E6F4F1] border-[#0D7466] ring-2 ring-[#0D7466]/20'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#FBFBFA]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#0D7466] text-white'
                    : 'bg-[#F7F7F5] text-[#4A5568] border border-[#CBD5E1]'
                }`}
              >
                {opt.key}
              </span>
              <span className="text-sm font-medium text-[#1E2929] leading-snug pt-0.5">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation and Submission Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-sm font-medium text-[#4A5568] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit Practice'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
