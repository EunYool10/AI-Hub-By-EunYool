import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[#1a1d2a] border border-white/20 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-2xl shadow-black/80 flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <CheckCircle className="w-4 h-4 text-[#00d4aa]" />
      <span>{message}</span>
    </div>
  );
};
