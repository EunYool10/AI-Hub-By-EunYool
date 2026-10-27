import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[9999] flex justify-center px-4 pointer-events-none"
  >
    {message && (
      <div
        key={message}
        className="pointer-events-auto max-w-md inline-flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-xl border border-line-strong bg-surface-2/95 backdrop-blur-xl text-sm font-medium text-fg shadow-pop animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
        <span>{message}</span>
      </div>
    )}
  </div>
);
