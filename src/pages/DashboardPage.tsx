import React from 'react';
import {
  Upload,
  FileText,
  FileSearch,
  MessageSquare,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DocumentItem } from '../types/index.js';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDoc: (doc: DocumentItem) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  documents,
  selectedDoc,
  onSelectDoc,
}) => {
  const { user } = useAuth();

  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Upload a PDF or TXT study document to analyze.',
      icon: Upload,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: 'my-documents',
      title: 'My Documents',
      description: 'Browse, manage, or switch between your uploaded files.',
      icon: FileText,
      accent: 'bg-slate-50 text-slate-700 border-slate-200',
    },
    {
      id: 'summary',
      title: 'AI Summary',
      description: 'Read key points, concepts, terms, and conclusions.',
      icon: FileSearch,
      accent: 'bg-teal-50 text-[#0D7466] border-teal-100',
    },
    {
      id: 'chat',
      title: 'Ask Questions',
      description: 'Chat directly with your document without hallucinations.',
      icon: MessageSquare,
      accent: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    {
      id: 'suggested-questions',
      title: 'Suggested Questions',
      description: 'Explore automated study questions from your text.',
      icon: Lightbulb,
      accent: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      id: 'mcq',
      title: 'MCQ Practice',
      description: 'Generate practice quizzes and test your knowledge.',
      icon: CheckSquare,
      accent: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] text-[#0A5C51] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2929]">
            Welcome, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-sm text-[#718096] mt-1.5 max-w-xl">
            DocMind is ready to help you extract summaries, answer grounded questions, and generate MCQs from your study files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="px-5 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-semibold text-sm shadow-xs flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Active Document Status */}
      {selectedDoc ? (
        <div className="bg-[#E6F4F1]/60 rounded-2xl p-5 border border-[#0D7466]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0D7466] text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0A5C51] uppercase tracking-wider">
                Currently Selected Document
              </span>
              <h3 className="text-base font-bold text-[#1E2929] truncate max-w-md">
                {selectedDoc.file_name}
              </h3>
              <p className="text-xs text-[#718096]">
                {selectedDoc.file_type.toUpperCase()} • ~{selectedDoc.word_count.toLocaleString()} words
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('summary')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#0D7466] text-xs font-semibold text-[#0D7466] transition-colors"
            >
              Summary
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-3 py-1.5 rounded-lg bg-[#0D7466] hover:bg-[#0A5C51] text-xs font-semibold text-white transition-colors"
            >
              Ask Questions
            </button>
            <button
              onClick={() => onNavigate('mcq')}
              className="px-3 py-1.5 rounded-lg bg-[#0A5C51] hover:bg-[#07463E] text-xs font-semibold text-white transition-colors"
            >
              MCQs
            </button>
          </div>
        </div>
      ) : documents.length > 0 ? (
        <div className="bg-[#FFFBEB] rounded-2xl p-4 border border-amber-200 text-amber-900 text-sm flex items-center justify-between gap-4">
          <p>
            Please select a document from <strong>My Documents</strong> to activate Summary, Q&A, and MCQs.
          </p>
          <button
            onClick={() => onNavigate('my-documents')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0"
          >
            Select Document
          </button>
        </div>
      ) : null}

      {/* Main Sections Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#1E2929] mb-4">
          Explore Main Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#0D7466]/60 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${action.accent}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#1E2929] group-hover:text-[#0D7466] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-[#0D7466] group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Documents Section */}
      {documents.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E2929]">
              Recent Documents ({documents.length})
            </h2>
            <button
              onClick={() => onNavigate('my-documents')}
              className="text-xs font-bold text-[#0D7466] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {documents.slice(0, 4).map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FBFBFA] px-2 rounded-xl transition-colors"
                >
                  <div
                    onClick={() => {
                      onSelectDoc(doc);
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {doc.file_type}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-[#1E2929] truncate hover:text-[#0D7466]">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-[#718096]">
                        ~{doc.word_count.toLocaleString()} words
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectDoc(doc);
                        onNavigate('summary');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#E6F4F1] text-[#0A5C51] hover:bg-[#D4EFEA]"
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => {
                        onSelectDoc(doc);
                        onNavigate('chat');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0D7466] text-white hover:bg-[#0A5C51]"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
