import React from 'react';
import { BadgeInfo } from '../../types';
import { cn } from '../../lib/cn';

export function getPriceMeta(price: string, lang: string) {
  const isKo = lang !== 'en';
  if (price === '무료') return { label: isKo ? '무료' : 'Free', cls: 'text-mint bg-mint/10', dot: 'bg-mint' };
  if (price === '유료') return { label: isKo ? '유료' : 'Paid', cls: 'text-rose-400 bg-rose-400/10', dot: 'bg-rose-400' };
  return { label: isKo ? '부분 무료' : 'Freemium', cls: 'text-amber-400 bg-amber-400/10', dot: 'bg-amber-400' };
}

export const PriceBadge: React.FC<{ price: string; lang: string; className?: string }> = ({ price, lang, className }) => {
  const meta = getPriceMeta(price, lang);
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-xs font-semibold', meta.cls, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
};

export const ToolBadge: React.FC<{ badge: BadgeInfo; lang: string; className?: string }> = ({ badge, lang, className }) => {
  const isKo = lang !== 'en';
  const meta =
    badge.type === 'hot'
      ? { label: 'HOT', cls: 'text-rose-400 bg-rose-400/12' }
      : badge.type === 'pick'
        ? { label: 'PICK', cls: 'text-brand bg-accent/12' }
        : { label: isKo ? '국내 인기' : 'KR', cls: 'text-sky-400 bg-sky-400/12' };
  return (
    <span
      className={cn(
        'inline-flex items-center h-5 px-1.5 rounded text-[0.625rem] font-bold tracking-wide whitespace-nowrap shrink-0',
        meta.cls,
        className
      )}
    >
      {meta.label}
    </span>
  );
};
