import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  CheckSquare,
  LogOut,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { getUserProfile } from '../services/api.js';
import { UserStats } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    documentsCount: 0,
    questionsCount: 0,
    mcqsAttempted: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await getUserProfile();
        if (res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Member';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Member';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs">
        {/* User Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0D7466] to-[#14B8A6] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E2929]">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096] mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#A0AEC0]" />
                  {user?.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A0AEC0]" />
                  Joined {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Learning Statistics Section */}
        <div className="pt-6">
          <h2 className="text-base font-bold text-[#1E2929] mb-4">
            Your Learning Activity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D7466] flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-[#1E2929]">
                {stats.documentsCount}
              </span>
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mt-1">
                Uploaded Documents
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-[#1E2929]">
                {stats.questionsCount}
              </span>
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mt-1">
                Questions Asked
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-[#1E2929]">
                {stats.mcqsAttempted}
              </span>
              <p className="text-xs font-semibold text-[#718096] uppercase tracking-wide mt-1">
                MCQs Attempted
              </p>
            </div>
          </div>
        </div>

        {/* Academic Grounding Policy */}
        <div className="mt-8 p-4 rounded-2xl bg-[#E6F4F1]/60 border border-[#0D7466]/20">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A5C51] mb-1">
            <Award className="w-4 h-4" />
            <span>Document-Grounded Learning Commitment</span>
          </div>
          <p className="text-xs text-[#2D3748] leading-relaxed">
            DocMind AI isolates all generation parameters strictly to each user's authenticated documents. Answers, flash assessments, and summaries never hallucinate or invent external claims.
          </p>
        </div>
      </div>
    </div>
  );
};
