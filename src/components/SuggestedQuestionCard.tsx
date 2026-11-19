import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface SuggestedQuestionCardProps {
  question: string;
  index: number;
  onClick: (question: string) => void;
}

export const SuggestedQuestionCard: React.FC<SuggestedQuestionCardProps> = ({
  question,
  index,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(question)}
      className="w-full text-left p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0D7466] hover:bg-[#F0FDF4]/50 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-start justify-between gap-3 group"
    >
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-lg bg-[#E6F4F1] text-[#0A5C51] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#0D7466] group-hover:text-white transition-colors">
          {index + 1}
        </span>
        <p className="text-sm font-medium text-[#1E2929] group-hover:text-[#0D7466] transition-colors leading-snug">
          {question}
        </p>
      </div>
      <div className="p-1 rounded-lg text-[#CBD5E1] group-hover:text-[#0D7466] group-hover:translate-x-0.5 transition-all shrink-0">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
};
