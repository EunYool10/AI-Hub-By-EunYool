import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Clock, TrendingUp, CornerDownLeft, ChevronRight } from 'lucide-react';
import { Language, UI_TEXT, getCategoryLabel } from '../lib/translations';
import { CATEGORIES, getCategoryVisual } from '../lib/categories';
import { categoriesForQuery, rankTools, toolMatches } from '../lib/search';
import { cn } from '../lib/cn';
import { AITool, Category } from '../types';
import { AIFavicon } from './AIFavicon';
import { PriceBadge } from './ui/Badges';

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
  onSubmit?: () => void;
  lang?: Language;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  /** Catalog for live suggestions; without it the box only offers recent and popular searches. */
  tools?: AITool[];
  onSelectTool?: (tool: AITool) => void;
  onSelectCategory?: (category: Category) => void;
}

const TRENDING_KEYWORDS = ['ChatGPT', 'Claude', 'DeepSeek', 'Midjourney', 'Cursor', 'n8n'];

const DEFAULT_RECENT = ['ChatGPT', 'DeepSeek', 'Midjourney'];
const RECENT_KEY = 'ai_hub_recent_searches';

type Suggestion =
  | { kind: 'tool'; tool: AITool }
  | { kind: 'category'; category: Category; count: number }
  | { kind: 'query'; count: number };

/** Bold the part of `text` that matches the query. */
const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-brand font-semibold">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  lang = 'ko',
  inputRef,
  className,
  tools = [],
  onSelectTool,
  onSelectCategory,
}) => {
  const isKo = lang === 'ko';
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved).slice(0, 6) : DEFAULT_RECENT;
    } catch {
      return DEFAULT_RECENT;
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const persistRecent = (list: string[]) => {
    setRecent(list);
    try {
      if (list.length) localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      else localStorage.removeItem(RECENT_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    persistRecent([trimmed, ...recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6));
  };

  const query = value.trim();

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    const intent = categoriesForQuery(q);
    const categories = CATEGORIES.filter(
      ({ label }) =>
        label !== '전체' &&
        (label.toLowerCase().includes(q) || getCategoryLabel(label, 'en').toLowerCase().includes(q) || intent.has(label))
    )
      .slice(0, 2)
      .map(({ label }) => ({ kind: 'category' as const, category: label, count: tools.filter((t) => t.category === label).length }));
    const toolHits = rankTools(tools, query, 5).map((tool) => ({ kind: 'tool' as const, tool }));
    const total = tools.filter((t) => toolMatches(t, query)).length;
    return [...toolHits, ...categories, { kind: 'query' as const, count: total }];
  }, [query, tools]);

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const submitQuery = (term = value) => {
    saveRecent(term);
    close();
    onSubmit?.();
  };

  const choose = (item: Suggestion) => {
    if (item.kind === 'tool') {
      saveRecent(query);
      close();
      if (onSelectTool) onSelectTool(item.tool);
      else window.open(item.tool.url, '_blank', 'noopener,noreferrer');
    } else if (item.kind === 'category') {
      close();
      onChange('');
      onSelectCategory?.(item.category);
    } else {
      submitQuery();
    }
  };

  const pickKeyword = (keyword: string) => {
    onChange(keyword);
    submitQuery(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) choose(suggestions[activeIndex]);
      else if (query) submitQuery();
    } else if (e.key === 'Escape') {
      close();
      (e.target as HTMLInputElement).blur();
    }
  };

  const setRefs = (el: HTMLInputElement | null) => {
    localInputRef.current = el;
    if (typeof inputRef === 'function') inputRef(el);
    else if (inputRef && typeof inputRef === 'object') (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  const chip =
    'inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border border-line bg-surface-2 text-sm text-fg-2 hover:text-fg hover:border-line-strong transition-colors';
  const row = (active: boolean) =>
    cn('w-full flex items-center gap-3 px-3 rounded-lg text-sm text-left transition-colors', active ? 'bg-fg/[0.06] text-fg' : 'text-fg-2');

  const firstCategory = suggestions.findIndex((s) => s.kind === 'category');
  const queryIndex = suggestions.length - 1;

  return (
    <div ref={containerRef} className={cn('relative z-30 w-full', className)}>
      <div
        className={cn(
          'group relative flex items-center h-14 rounded-2xl border bg-surface shadow-card transition-[border-color,box-shadow]',
          isOpen ? 'border-accent ring-4 ring-accent/15' : 'border-line-strong hover:border-subtle/60'
        )}
      >
        <Search className="absolute left-5 w-5 h-5 text-subtle pointer-events-none" />
        <input
          ref={setRefs}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          aria-label={UI_TEXT.controls.searchPlaceholder[lang]}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isKo ? '도구 이름이나 하고 싶은 일 (예: 그림, 영상 편집, 무료 번역)' : 'Tool name or task (e.g. images, video editing)'}
          enterKeyHint="search"
          className="w-full h-full bg-transparent pl-13 pr-24 text-base text-fg placeholder:text-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                localInputRef.current?.focus();
              }}
              aria-label={isKo ? '검색어 지우기' : 'Clear search'}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-fg/[0.07] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center h-6 px-2 rounded-md border border-line bg-surface-2 text-xs font-sans font-medium text-subtle">
              /
            </kbd>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-line bg-surface shadow-pop text-left animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {query ? (
            <div className="p-2">
              {suggestions.map((item, idx) => {
                const active = activeIndex === idx;
                const common = {
                  id: `search-option-${idx}`,
                  role: 'option',
                  'aria-selected': active,
                  onMouseEnter: () => setActiveIndex(idx),
                  onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
                  onClick: () => choose(item),
                } as const;
                if (item.kind === 'tool') {
                  const { tool } = item;
                  return (
                    <button key={`t${tool.id}`} type="button" {...common} className={cn(row(active), 'py-2')}>
                      <AIFavicon url={tool.url} name={tool.name} customIcon={tool.iconUrl || tool.logoUrl} className="w-8 h-8 rounded-lg shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-fg">
                          <Highlight text={tool.name} query={query} />
                        </span>
                        <span className="block truncate text-xs text-muted">{getCategoryLabel(tool.category, lang)}</span>
                      </span>
                      <PriceBadge price={String(tool.price)} lang={lang} className="shrink-0 max-sm:hidden" />
                    </button>
                  );
                }
                if (item.kind === 'category') {
                  const { Icon, text, tint } = getCategoryVisual(item.category);
                  return (
                    <React.Fragment key={`c${item.category}`}>
                      {idx === firstCategory && idx > 0 && <div className="my-1.5 mx-3 h-px bg-line" />}
                      <button type="button" {...common} className={cn(row(active), 'h-11')}>
                        <span className={cn('w-8 h-8 shrink-0 rounded-lg inline-flex items-center justify-center', tint)}>
                          <Icon className={cn('w-4 h-4', text)} />
                        </span>
                        <span className="flex-1 truncate">
                          {isKo ? '분야' : 'Category'} · <strong className="font-semibold text-fg">{getCategoryLabel(item.category, lang)}</strong>
                        </span>
                        <span className="text-xs text-subtle tabular-nums">{item.count}</span>
                        <ChevronRight className="w-4 h-4 text-subtle" />
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key="q">
                    {idx === queryIndex && idx > 0 && firstCategory < 0 && <div className="my-1.5 mx-3 h-px bg-line" />}
                    <button type="button" {...common} className={cn(row(active), 'h-10 text-muted')}>
                      <CornerDownLeft className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">
                        {isKo ? (
                          <>
                            <strong className="font-semibold text-fg">‘{query}’</strong> 검색 결과 {item.count}개 보기
                          </>
                        ) : (
                          <>
                            See all {item.count} results for <strong className="font-semibold text-fg">‘{query}’</strong>
                          </>
                        )}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
              {suggestions.length === 1 && (
                <p className="px-3 pt-1 pb-2 text-xs text-subtle">
                  {isKo ? '맞는 도구가 없어요. 다른 단어나 하고 싶은 일로 찾아보세요.' : 'No matching tools. Try another word or a task.'}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <section>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    {isKo ? '최근 검색' : 'Recent'}
                  </h3>
                  {recent.length > 0 && (
                    <button
                      type="button"
                      onClick={() => persistRecent([])}
                      className="text-xs text-subtle hover:text-fg transition-colors"
                    >
                      {UI_TEXT.controls.clearRecent[lang]}
                    </button>
                  )}
                </div>
                {recent.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {recent.map((term) => (
                      <span key={term} className={chip}>
                        <button type="button" onClick={() => pickKeyword(term)} className="max-w-[160px] truncate">
                          {term}
                        </button>
                        <button
                          type="button"
                          onClick={() => persistRecent(recent.filter((r) => r !== term))}
                          aria-label={isKo ? `${term} 삭제` : `Remove ${term}`}
                          className="w-5 h-5 inline-flex items-center justify-center rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-subtle">{isKo ? '최근 검색어가 없습니다.' : 'No recent searches.'}</p>
                )}
              </section>

              <section className="pt-4 border-t border-line">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {UI_TEXT.controls.trendingTitle[lang]}
                </h3>
                <ol className="grid grid-cols-2 gap-x-2">
                  {TRENDING_KEYWORDS.map((keyword, i) => (
                    <li key={keyword}>
                      <button
                        type="button"
                        onClick={() => pickKeyword(keyword)}
                        className="w-full flex items-center gap-3 h-9 px-2 rounded-lg text-sm text-left hover:bg-fg/[0.06] transition-colors"
                      >
                        <span className={cn('w-4 text-center text-xs font-bold tabular-nums', i < 3 ? 'text-brand' : 'text-subtle')}>
                          {i + 1}
                        </span>
                        <span className="text-fg-2 truncate">{keyword}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TRENDING_KEYWORDS };
