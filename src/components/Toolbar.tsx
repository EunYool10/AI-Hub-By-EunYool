import React from 'react';
import { ChevronDown, Dices, Star, X, RotateCcw, Search } from 'lucide-react';
import { Category } from '../types';
import { getCategoryVisual } from '../lib/categories';
import { getCategoryLabel, CATEGORY_TRANSLATIONS, Language } from '../lib/translations';
import { cn } from '../lib/cn';

interface ToolbarProps {
  lang: Language;
  resultCount: number;
  selectedCategory: Category;
  searchQuery: string;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  bookmarkCount: number;
  onOpenRandomModal: () => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onResetAll: () => void;
}

const PRICE_OPTIONS: { value: string; ko: string; en: string }[] = [
  { value: 'all', ko: '전체', en: 'All' },
  { value: '무료', ko: '무료', en: 'Free' },
  { value: '무료/유료', ko: '부분 무료', en: 'Freemium' },
  { value: '유료', ko: '유료', en: 'Paid' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  lang,
  resultCount,
  selectedCategory,
  searchQuery,
  selectedPrice,
  onPriceChange,
  selectedSort,
  onSortChange,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  bookmarkCount,
  onOpenRandomModal,
  onClearSearch,
  onClearCategory,
  onResetAll,
}) => {
  const isKo = lang === 'ko';
  const { Icon, text, tint } = getCategoryVisual(selectedCategory);
  const query = searchQuery.trim();

  const title = showBookmarksOnly
    ? isKo
      ? '내 북마크'
      : 'My bookmarks'
    : selectedCategory === '전체'
      ? isKo
        ? '모든 AI 도구'
        : 'All AI tools'
      : getCategoryLabel(selectedCategory, lang);

  const catInfo = CATEGORY_TRANSLATIONS[selectedCategory];
  const description = query
    ? isKo
      ? `‘${query}’ 검색 결과`
      : `Results for ‘${query}’`
    : catInfo
      ? isKo
        ? catInfo.descKo
        : catInfo.descEn
      : '';

  const hasFilters = Boolean(query) || selectedCategory !== '전체' || selectedPrice !== 'all' || showBookmarksOnly;
  const priceLabel = PRICE_OPTIONS.find((o) => o.value === selectedPrice);

  const filterChip =
    'inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-fg/[0.06] border border-line text-xs font-medium text-fg-2';
  const chipX = 'w-5 h-5 inline-flex items-center justify-center rounded-full text-subtle hover:text-fg hover:bg-fg/[0.1]';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        {/* Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', showBookmarksOnly ? 'bg-amber-400/12' : tint)}>
              {showBookmarksOnly ? (
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <Icon className={cn('w-5 h-5', text)} />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg break-keep">{title}</h2>
                <span
                  className="inline-flex items-center h-6 px-2 rounded-md bg-fg/[0.07] text-xs font-semibold tabular-nums text-muted"
                  aria-label={isKo ? `${resultCount}개` : `${resultCount} results`}
                >
                  {resultCount}
                </span>
              </div>
              {description && <p className="mt-0.5 text-sm text-muted break-keep">{description}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label={isKo ? '가격 필터' : 'Price filter'} className="flex items-center p-1 h-10 rounded-xl bg-surface-2 border border-line shrink-0">
            {PRICE_OPTIONS.map((opt) => {
              const isActive = selectedPrice === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onPriceChange(opt.value)}
                  className={cn(
                    'h-8 px-3 rounded-lg text-sm whitespace-nowrap transition-colors',
                    isActive ? 'bg-surface text-fg font-semibold shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'
                  )}
                >
                  {isKo ? opt.ko : opt.en}
                </button>
              );
            })}
          </div>

          <label className="relative shrink-0">
            <span className="sr-only">{isKo ? '정렬' : 'Sort'}</span>
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none h-10 pl-3.5 pr-9 rounded-xl bg-surface-2 border border-line text-sm font-medium text-fg-2 hover:text-fg hover:border-line-strong focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition"
            >
              <option value="default">{isKo ? '추천순' : 'Recommended'}</option>
              <option value="abc">{isKo ? '이름순' : 'A → Z'}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
          </label>

          <button
            type="button"
            onClick={onToggleBookmarksOnly}
            aria-pressed={showBookmarksOnly}
            className={cn(
              'lg:hidden shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-sm font-medium transition-colors',
              showBookmarksOnly
                ? 'bg-amber-400/12 border-amber-400/40 text-amber-300'
                : 'bg-surface-2 border-line text-fg-2 hover:text-fg hover:border-line-strong'
            )}
          >
            <Star className={cn('w-4 h-4', showBookmarksOnly ? 'fill-amber-400 text-amber-400' : 'text-amber-400')} />
            {isKo ? '북마크' : 'Saved'}
            <span className="text-xs tabular-nums opacity-70">{bookmarkCount}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRandomModal}
            className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-line bg-surface-2 text-sm font-medium text-fg-2 hover:text-fg hover:border-line-strong transition-colors"
          >
            <Dices className="w-4 h-4 text-mint" />
            {isKo ? '랜덤 뽑기' : 'Random'}
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-subtle mr-1">{isKo ? '적용된 필터' : 'Filters'}</span>
          {query && (
            <span className={filterChip}>
              <Search className="w-3 h-3 text-subtle" />
              <span className="max-w-[160px] truncate">{query}</span>
              <button type="button" className={chipX} onClick={onClearSearch} aria-label={isKo ? '검색어 해제' : 'Clear search'}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== '전체' && (
            <span className={filterChip}>
              {getCategoryLabel(selectedCategory, lang)}
              <button type="button" className={chipX} onClick={onClearCategory} aria-label={isKo ? '카테고리 해제' : 'Clear category'}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPrice !== 'all' && priceLabel && (
            <span className={filterChip}>
              {isKo ? priceLabel.ko : priceLabel.en}
              <button type="button" className={chipX} onClick={() => onPriceChange('all')} aria-label={isKo ? '가격 필터 해제' : 'Clear price'}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {showBookmarksOnly && (
            <span className={filterChip}>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {isKo ? '북마크' : 'Bookmarks'}
              <button type="button" className={chipX} onClick={onToggleBookmarksOnly} aria-label={isKo ? '북마크 필터 해제' : 'Clear bookmarks filter'}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 h-7 px-2 rounded-full text-xs font-semibold text-brand hover:bg-accent/10 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {isKo ? '모두 초기화' : 'Reset all'}
          </button>
        </div>
      )}
    </div>
  );
};
