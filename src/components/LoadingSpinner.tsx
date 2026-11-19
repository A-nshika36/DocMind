import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-6 ${
        fullHeight ? 'min-h-[300px]' : ''
      }`}
    >
      <div className="relative">
        <Loader2 className={`${sizeMap[size]} animate-spin text-[#0D7466]`} />
        <div className="absolute inset-0 rounded-full blur-[6px] bg-[#0D7466]/20 animate-pulse pointer-events-none" />
      </div>
      {message && (
        <p className="text-sm font-medium text-[#4A5568] tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
