import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from './Button';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

// Only the top-most open modal reacts to Escape.
const openStack: number[] = [];
let nextId = 1;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  zIndex?: number;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible modal shell. Renders as a bottom sheet on small screens and a
 * centered dialog from `sm` up. Handles scroll lock, Escape, focus trap and
 * focus restore.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  zIndex = 200,
  labelledBy,
  className,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = nextId++;
    openStack.push(id);

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (openStack[openStack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      const idx = openStack.indexOf(id);
      if (idx >= 0) openStack.splice(idx, 1);
      if (openStack.length === 0) document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-6" style={{ zIndex }}>
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'relative w-full flex flex-col min-h-0 max-h-[92dvh] sm:max-h-[min(88vh,860px)] bg-surface text-fg border border-line shadow-pop outline-none',
          'rounded-t-2xl sm:rounded-2xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
          SIZES[size],
          className
        )}
      >
        <div className="sm:hidden mx-auto mt-2 mb-0.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body
  );
};

interface ModalHeaderProps {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  id,
  title,
  description,
  icon,
  onClose,
  closeLabel = '닫기',
  actions,
  className,
}) => (
  <div className={cn('flex items-start gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-line shrink-0', className)}>
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-accent/12 text-brand flex items-center justify-center shrink-0">{icon}</div>
    )}
    <div className="flex-1 min-w-0 pt-0.5">
      <h2 id={id} className="text-base sm:text-lg font-semibold tracking-tight text-fg leading-snug">
        {title}
      </h2>
      {description && <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>}
    </div>
    {actions}
    {onClose && (
      <IconButton label={closeLabel} onClick={onClose} className="-mr-1.5 -mt-0.5">
        <X className="w-[18px] h-[18px]" />
      </IconButton>
    )}
  </div>
);

export const ModalBody: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5', className)}>{children}</div>
);

export const ModalFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div
    className={cn(
      'flex items-center gap-2 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 border-t border-line shrink-0',
      className
    )}
  >
    {children}
  </div>
);
