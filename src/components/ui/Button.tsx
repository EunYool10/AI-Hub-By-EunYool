import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'warn';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-sm shadow-accent/20',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong',
  ghost: 'text-fg-2 hover:text-fg hover:bg-fg/[0.06]',
  outline: 'border border-line text-fg hover:bg-fg/[0.04] hover:border-line-strong',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/15',
  warn: 'bg-amber-400 text-black hover:bg-amber-300 shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[0.9375rem] gap-2 rounded-xl',
};

const BASE =
  'inline-flex items-center justify-center font-semibold whitespace-nowrap select-none transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none active:translate-y-px';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest} />
  )
);
Button.displayName = 'Button';

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ variant = 'secondary', size = 'md', className, ...rest }) => (
  <a className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest} />
);

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'secondary';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', variant = 'ghost', className, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9',
        variant === 'ghost'
          ? 'text-muted hover:text-fg hover:bg-fg/[0.07]'
          : 'text-fg-2 bg-surface-2 border border-line hover:text-fg hover:bg-surface-3',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';
