import React from 'react';
import { BookOpen, Sparkles, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onNavigate?: (tab: string) => void;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-[#4A5568] hover:text-[#0D7466] hover:bg-[#F0FDF4] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate && onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D7466] to-[#14B8A6] flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#1E2929]">
                  DocMind<span className="text-[#0D7466]">.AI</span>
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4F1] text-[#0A5C51] border border-[#0D7466]/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  Study AI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate?.('profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#0D7466]/40 hover:bg-[#F7F7F5] transition-colors text-sm text-[#1E2929]"
              >
                <div className="w-6 h-6 rounded-full bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[140px] truncate">{user.name}</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => onNavigate?.('login')}
                className="px-4 py-2 text-sm font-semibold text-[#0D7466] hover:text-[#0A5C51] hover:bg-[#E6F4F1] rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate?.('register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0D7466] hover:bg-[#0A5C51] rounded-lg shadow-sm transition-all shadow-[#0D7466]/20 hover:shadow-md"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
