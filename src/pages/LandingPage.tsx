import React from 'react';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  FileSearch,
  MessageSquare,
  Lightbulb,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const workflowSteps = [
    { step: '01', title: 'Upload File', desc: 'Drop your study PDF or TXT notes', icon: BookOpen },
    { step: '02', title: 'Extract Text', desc: 'Secure, clean server-side text extraction', icon: FileCheck },
    { step: '03', title: 'AI Analysis', desc: 'Strict document grounding with Gemini', icon: Cpu },
    { step: '04', title: 'Master Topic', desc: 'Summaries, Q&A, and practice MCQs', icon: Sparkles },
  ];

  const features = [
    {
      title: 'AI Summary',
      description: 'Get an easy-to-understand summary of your document with key concepts, bullet points, and terminology.',
      icon: FileSearch,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Ask Questions',
      description: 'Ask questions directly from your uploaded document. Answers are strictly grounded in your text without hallucinations.',
      icon: MessageSquare,
      accent: 'bg-teal-50 text-[#0D7466] border-teal-100',
    },
    {
      title: 'Smart Questions',
      description: 'Get automatically generated questions to explore your document and test how well you grasped the key topics.',
      icon: Lightbulb,
      accent: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      title: 'MCQ Practice',
      description: 'Generate MCQs and test your understanding with instant scoring and detailed document-based explanations.',
      icon: CheckSquare,
      accent: 'bg-blue-50 text-blue-700 border-blue-100',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4F1] border border-[#0D7466]/20 text-[#0A5C51] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#0D7466]" />
            <span>AI-Powered Document Learning for Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1E2929] tracking-tight leading-[1.15]">
            Learn Smarter With <br />
            <span className="text-[#0D7466] underline decoration-[#0D7466]/20 decoration-wavy decoration-2">
              Your Documents
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
            Upload your PDF or TXT files, understand them with AI, ask questions, and practice with automatically generated MCQs.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-bold text-base shadow-md hover:shadow-lg shadow-[#0D7466]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#0D7466] hover:bg-[#F7F7F5] text-[#1E2929] font-bold text-base transition-colors"
            >
              Login
            </button>
          </div>

          {/* Visual Workflow Representation */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm max-w-4xl mx-auto">
            <div className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-6 text-center">
              DocMind AI Learning Workflow
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((ws, i) => {
                const Icon = ws.icon;
                return (
                  <div
                    key={ws.step}
                    className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E2E8F0] text-left relative group hover:border-[#0D7466] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#A0AEC0]">
                        {ws.step}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1E2929]">{ws.title}</h3>
                    <p className="text-xs text-[#718096] mt-1 leading-snug">{ws.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2929]">
              Everything You Need to Master Any Subject
            </h2>
            <p className="text-sm sm:text-base text-[#718096] mt-2">
              Turn dense academic texts into interactive study materials in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 sm:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${feat.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E2929] mb-2">{feat.title}</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Truth & Anti-Hallucination Guarantee */}
      <section className="py-16 bg-[#FBFBFA] border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E2929]">Strict Document Grounding</h2>
          <p className="mt-2 text-sm text-[#4A5568] max-w-xl mx-auto">
            The AI only answers using information present in your document. If an answer cannot be verified from the uploaded text, DocMind transparently tells you:
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono font-medium text-[#0A5C51] shadow-2xs">
            "I couldn't find this information in the uploaded document."
          </div>

          <div className="mt-8">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-semibold text-sm shadow-sm transition-all"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#E2E8F0] text-center text-xs text-[#718096]">
        <p>DocMind — Built for Students and Curious Minds</p>
      </footer>
    </div>
  );
};
