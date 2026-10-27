import React from 'react';
import { cn } from '../../lib/cn';

export const inputClass =
  'w-full h-11 px-3.5 rounded-xl bg-surface-2 border border-line text-sm text-fg placeholder:text-subtle transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:opacity-60';

export const textareaClass =
  'w-full px-3.5 py-3 rounded-xl bg-surface-2 border border-line text-sm leading-relaxed text-fg placeholder:text-subtle transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 resize-none';

export const selectClass = cn(inputClass, 'appearance-none pr-9 cursor-pointer');

interface FieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, required, className, children }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="flex items-center gap-1 mb-1.5 text-sm font-medium text-fg-2">
      {label}
      {required && <span className="text-rose-400" aria-hidden="true">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
  </div>
);
