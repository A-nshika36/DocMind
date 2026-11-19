import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-[#E6F4F1] border-[#0D7466]/20 text-[#0A5C51]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0D7466] shrink-0" />,
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${styles[type]}`}
      role="alert"
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors text-current opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
