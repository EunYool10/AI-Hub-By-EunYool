import React, { useState } from 'react';
import { Star, Dices, LayoutGrid, Check } from 'lucide-react';
import { Category } from '../types';
import { CATEGORIES, getCategoryVisual } from '../lib/categories';
import { getCategoryLabel, CATEGORY_TRANSLATIONS, Language } from '../lib/translations';
import { cn } from '../lib/cn';
import { Modal, ModalBody, ModalHeader } from './ui/Modal';

interface CategoryNavProps {
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  counts: Record<string, number>;
  lang: Language;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  bookmarkCount: number;
  onOpenRandomModal: () => void;
}

const sectionLabel = 'px-3 mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-subtle';

/** Desktop: sticky sidebar listing every category with live counts. */
export const CategorySidebar: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
  lang,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  bookmarkCount,
  onOpenRandomModal,
}) => {
  const isKo = lang === 'ko';
  return (
    <aside className="hidden lg:block" aria-label={isKo ? '카테고리' : 'Categories'}>
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar pb-8 -mx-2 px-2">
        <p className={sectionLabel}>{isKo ? '카테고리' : 'Categories'}</p>
        <ul className="space-y-px">
          {CATEGORIES.map((cat) => {
            const { Icon, text } = getCategoryVisual(cat.label);
            const isActive = activeCategory === cat.label;
            const count = counts[cat.label] ?? 0;
            return (
              <li key={cat.label}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.label)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative w-full flex items-center gap-3 h-9 pl-3 pr-2.5 rounded-lg text-sm text-left transition-colors',
                    isActive ? 'bg-fg/[0.07] text-fg font-semibold' : 'text-fg-2 hover:text-fg hover:bg-fg/[0.04]'
                  )}
                >
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-accent" aria-hidden="true" />}
                  <Icon className={cn('w-4 h-4 shrink-0', text, !isActive && 'opacity-80 group-hover:opacity-100')} />
                  <span className="flex-1 truncate">{getCategoryLabel(cat.label, lang)}</span>
                  <span className={cn('text-xs tabular-nums', isActive ? 'text-fg-2' : 'text-subtle')}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="my-5 mx-3 h-px bg-line" />

        <p className={sectionLabel}>{isKo ? '내 라이브러리' : 'Library'}</p>
        <ul className="space-y-px">
          <li>
            <button
              type="button"
              onClick={onToggleBookmarksOnly}
              aria-pressed={showBookmarksOnly}
              className={cn(
                'w-full flex items-center gap-3 h-9 pl-3 pr-2.5 rounded-lg text-sm text-left transition-colors',
                showBookmarksOnly ? 'bg-amber-400/10 text-fg font-semibold' : 'text-fg-2 hover:text-fg hover:bg-fg/[0.04]'
              )}
            >
              <Star className={cn('w-4 h-4 shrink-0 text-amber-400', showBookmarksOnly && 'fill-amber-400')} />
              <span className="flex-1">{isKo ? '북마크만 보기' : 'Bookmarks only'}</span>
              <span className="text-xs tabular-nums text-subtle">{bookmarkCount}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={onOpenRandomModal}
              className="w-full flex items-center gap-3 h-9 pl-3 pr-2.5 rounded-lg text-sm text-left text-fg-2 hover:text-fg hover:bg-fg/[0.04] transition-colors"
            >
              <Dices className="w-4 h-4 shrink-0 text-mint" />
              <span className="flex-1">{isKo ? '랜덤 AI 뽑기' : 'Random pick'}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

/** Mobile/tablet: horizontally scrolling chips plus a full-category sheet. */
export const CategoryChips: React.FC<Pick<CategoryNavProps, 'activeCategory' | 'onSelectCategory' | 'counts' | 'lang'>> = ({
  activeCategory,
  onSelectCategory,
  counts,
  lang,
}) => {
  const isKo = lang === 'ko';
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-fade-x -ml-1">
          <div className="flex gap-1.5 w-max py-1 pl-1 pr-6">
            {CATEGORIES.map((cat) => {
              const { Icon, text } = getCategoryVisual(cat.label);
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => onSelectCategory(cat.label)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-fg text-bg border-fg font-semibold'
                      : 'bg-surface border-line text-fg-2 hover:text-fg hover:border-line-strong'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? '' : text)} />
                  {getCategoryLabel(cat.label, lang)}
                  <span className={cn('text-xs tabular-nums', isActive ? 'opacity-70' : 'text-subtle')}>
                    {counts[cat.label] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          aria-label={isKo ? '전체 카테고리 보기' : 'All categories'}
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full border border-line bg-surface text-fg-2 hover:text-fg"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      <Modal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} size="lg" zIndex={250} labelledBy="all-categories-title">
        <ModalHeader
          id="all-categories-title"
          title={isKo ? '전체 카테고리' : 'All categories'}
          description={isKo ? '분야를 선택하면 해당 AI 도구만 모아서 보여드려요.' : 'Pick a field to filter the directory.'}
          onClose={() => setIsSheetOpen(false)}
          closeLabel={isKo ? '닫기' : 'Close'}
        />
        <ModalBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const { Icon, text, tint } = getCategoryVisual(cat.label);
              const isActive = activeCategory === cat.label;
              const desc = CATEGORY_TRANSLATIONS[cat.label];
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.label);
                    setIsSheetOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                    isActive ? 'border-accent bg-accent/8' : 'border-line hover:border-line-strong hover:bg-fg/[0.03]'
                  )}
                >
                  <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', tint)}>
                    <Icon className={cn('w-5 h-5', text)} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-fg truncate">{getCategoryLabel(cat.label, lang)}</span>
                      <span className="text-xs tabular-nums text-subtle">{counts[cat.label] ?? 0}</span>
                    </span>
                    <span className="block text-xs text-muted truncate mt-0.5">{desc ? (isKo ? desc.descKo : desc.descEn) : ''}</span>
                  </span>
                  {isActive && <Check className="w-4 h-4 text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
