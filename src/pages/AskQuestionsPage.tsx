import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Trash2,
  MessageSquare,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { DocumentItem, ChatMessageItem } from '../types/index.js';
import { fetchChatHistory, askQuestionApi, clearChatApi } from '../services/api.js';
import { ChatMessage } from '../components/ChatMessage.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

interface AskQuestionsPageProps {
  selectedDoc: DocumentItem | null;
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onNavigate: (tab: string) => void;
  pendingQuestion?: string | null;
  onClearPendingQuestion?: () => void;
}

export const AskQuestionsPage: React.FC<AskQuestionsPageProps> = ({
  selectedDoc,
  documents,
  onSelectDoc,
  onNavigate,
  pendingQuestion,
  onClearPendingQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (docId: string) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const response = await fetchChatHistory(docId);
      const validHistory = (response?.history || []).filter(
        (m): m is ChatMessageItem => Boolean(m && m.id && typeof m.question === 'string')
      );
      setMessages(validHistory);
    } catch (err: any) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      loadHistory(selectedDoc.id);
    } else {
      setMessages([]);
    }
  }, [selectedDoc]);

  // Handle incoming suggested question clicked from the Suggested Questions tab
  useEffect(() => {
    if (pendingQuestion && selectedDoc && !isThinking) {
      handleSend(pendingQuestion);
      if (onClearPendingQuestion) {
        onClearPendingQuestion();
      }
    }
  }, [pendingQuestion, selectedDoc]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputValue).trim();
    if (!q || !selectedDoc || isThinking) return;

    setInputValue('');
    setIsThinking(true);
    setError(null);

    // Optimistically add user's question to view
    const optimisticMessage: ChatMessageItem = {
      id: `temp_${Date.now()}`,
      question: q,
      answer: '',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await askQuestionApi(selectedDoc.id, q);
      if (!response?.record || typeof response.record.question !== 'string') {
        throw new Error('Could not receive a valid answer from the server. Please try again.');
      }
      // Replace optimistic message with complete record
      setMessages((prev) =>
        prev.map((m) => (m && m.id === optimisticMessage.id ? response.record : m))
      );
    } catch (err: any) {
      // Remove optimistic message on error and show error message
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setError(err.message || 'Something went wrong while processing your question.');
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClearChat = async () => {
    if (!selectedDoc) return;
    try {
      await clearChatApi(selectedDoc.id);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear chat.');
    }
  };

  if (!selectedDoc) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1E2929]">Select a Document for Q&A</h3>
        <p className="text-sm text-[#718096] max-w-md mx-auto mt-2 mb-6">
          Choose a study file to ask questions directly. DocMind AI will answer strictly from the document text.
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
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#FBFBFA] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0D7466] uppercase tracking-wider">
                Document Q&A
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
              <span className="text-xs text-[#718096]">{selectedDoc.file_type.toUpperCase()}</span>
            </div>
            <h2 className="text-base font-bold text-[#1E2929] truncate" title={selectedDoc.file_name}>
              {selectedDoc.file_name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {documents.length > 1 && (
            <select
              value={selectedDoc.id}
              onChange={(e) => {
                const found = documents.find((d) => d.id === e.target.value);
                if (found) onSelectDoc(found);
              }}
              className="hidden sm:block px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E2929]"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.file_name}
                </option>
              ))}
            </select>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-semibold text-[#718096] transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FBFBFA]">
        {/* Intro hint message */}
        <div className="p-4 rounded-2xl bg-[#E6F4F1]/50 border border-[#0D7466]/20 text-xs text-[#0A5C51] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#0D7466] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ask any question about <strong>{selectedDoc.file_name}</strong>. The AI responds strictly based on your document. If an answer cannot be found in the document, it will inform you directly.
          </p>
        </div>

        {/* Existing Q&A messages */}
        {messages
          .filter((msg): msg is ChatMessageItem => Boolean(msg && msg.id && typeof msg.question === 'string'))
          .map((msg) => (
            <React.Fragment key={msg.id}>
              {/* User message */}
              <ChatMessage role="user" content={msg.question} timestamp={msg.created_at} />
              {/* Assistant answer (if available) */}
              {msg.answer && (
                <ChatMessage role="assistant" content={msg.answer} timestamp={msg.created_at} />
              )}
            </React.Fragment>
          ))}

        {/* Loading state indicator as requested: Thinking about your question... */}
        {isThinking && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs max-w-sm mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] border border-[#0D7466]/30 text-[#0D7466] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E2929]">DocMind AI</p>
              <p className="text-xs font-medium text-[#0D7466]">Thinking about your question...</p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-white border-t border-[#E2E8F0] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask a question about ${selectedDoc.file_name}...`}
            disabled={isThinking}
            className="flex-1 px-4 py-3 rounded-xl border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all disabled:bg-[#F7F7F5]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="px-5 py-3 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-40 flex items-center gap-2"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
