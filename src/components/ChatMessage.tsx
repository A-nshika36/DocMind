import React, { useState } from 'react';
import { User as UserIcon, Bot, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
}) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNotFound = content.includes("I couldn't find this information in the uploaded document.");

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-2xl transition-all ${
        isUser
          ? 'bg-[#E6F4F1]/60 border border-[#0D7466]/15 ml-auto max-w-[85%]'
          : 'bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs mr-auto max-w-[90%]'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-[#0D7466] text-white'
            : 'bg-[#F0FDF4] border border-[#0D7466]/30 text-[#0D7466]'
        }`}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-[#1E2929]">
            {isUser ? 'You' : 'DocMind AI'}
          </span>
          {timestamp && (
            <span className="text-[10px] text-[#A0AEC0]">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isNotFound
              ? 'text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium'
              : 'text-[#2D3748]'
          }`}
        >
          {content}
        </div>

        {/* Copy button for assistant responses */}
        {!isUser && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-[#718096] hover:text-[#0D7466] py-1 px-2 rounded-md hover:bg-[#F7F7F5] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy answer</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
