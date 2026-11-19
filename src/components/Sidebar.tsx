import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  FileSearch,
  MessageSquare,
  Lightbulb,
  CheckSquare,
  User as UserIcon,
  LogOut,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedDocName?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  selectedDocName,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-documents', label: 'My Documents', icon: FileText },
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'summary', label: 'Summary', icon: FileSearch, requiresDoc: true },
    { id: 'chat', label: 'Ask Questions', icon: MessageSquare, requiresDoc: true },
    { id: 'suggested-questions', label: 'Suggested Questions', icon: Lightbulb, requiresDoc: true },
    { id: 'mcq', label: 'MCQ Practice', icon: CheckSquare, requiresDoc: true },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E2E8F0] w-64">
      {/* Mobile Header with close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#E2E8F0]">
        <span className="font-bold text-[#1E2929]">Menu</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#4A5568] hover:bg-[#F7F7F5]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Document Indicator (if any) */}
      {selectedDocName ? (
        <div className="mx-3 mt-4 p-2.5 rounded-xl bg-[#E6F4F1] border border-[#0D7466]/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0A5C51] mb-1">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Active Study Document</span>
          </div>
          <p className="text-xs font-medium text-[#1E2929] truncate" title={selectedDocName}>
            {selectedDocName}
          </p>
        </div>
      ) : (
        <div className="mx-3 mt-4 p-2.5 rounded-xl bg-[#F7F7F5] border border-dashed border-[#CBD5E1]">
          <p className="text-[11px] text-[#718096] text-center">
            No document selected yet
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#0D7466] text-white shadow-xs shadow-[#0D7466]/30 font-semibold'
                  : 'text-[#4A5568] hover:text-[#0D7466] hover:bg-[#F0FDF4]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#718096]'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.requiresDoc && !selectedDocName && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60" title="Requires selected document" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-2">
        {user && (
          <div
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F7F7F5] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1E2929] truncate">{user.name}</p>
              <p className="text-[11px] text-[#718096] truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
