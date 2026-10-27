import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Clock, TrendingUp, CornerDownLeft, ArrowUpRight } from 'lucide-react';
import { Language, UI_TEXT } from '../lib/translations';
import { cn } from '../lib/cn';

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
  onSubmit?: () => void;
  lang?: Language;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}

const TRENDING_KEYWORDS = ['ChatGPT', 'Claude', 'DeepSeek', 'Midjourney', 'Cursor', 'n8n'];

const AUTO_SUGGESTIONS = [
  'ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Midjourney', 'Cursor',
  'Perplexity', 'Wrtn', 'n8n', 'Adobe Firefly', 'Sora', 'Suno',
  '글쓰기', '코드 생성', '이미지 생성', '영상', '번역', '자동화', 'PPT',
];

const DEFAULT_RECENT = ['ChatGPT', 'DeepSeek', 'Midjourney'];
const RECENT_KEY = 'ai_hub_recent_searches';

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, lang = 'ko', inputRef, className }) => {
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

  const query = value.trim().toLowerCase();
  const suggestions = query
    ? AUTO_SUGGESTIONS.filter((s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query).slice(0, 6)
    : [];

  const select = (keyword: string) => {
    onChange(keyword);
    saveRecent(keyword);
    setIsOpen(false);
    setActiveIndex(-1);
    onSubmit?.();
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
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        select(suggestions[activeIndex]);
      } else if (value.trim()) {
        saveRecent(value);
        setIsOpen(false);
        onSubmit?.();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
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
          aria-label={UI_TEXT.controls.searchPlaceholder[lang]}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={UI_TEXT.controls.searchPlaceholder[lang]}
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
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-line bg-surface shadow-pop overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {query ? (
            <div className="p-2">
              {suggestions.length > 0 && (
                <ul>
                  {suggestions.map((s, idx) => (
                    <li key={s}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={activeIndex === idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => select(s)}
                        className={cn(
                          'w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-left transition-colors',
                          activeIndex === idx ? 'bg-fg/[0.06] text-fg' : 'text-fg-2'
                        )}
                      >
                        <Search className="w-4 h-4 text-subtle shrink-0" />
                        <span className="flex-1 truncate">{s}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-subtle" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => {
                  saveRecent(value);
                  setIsOpen(false);
                  onSubmit?.();
                }}
                className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-left text-muted hover:bg-fg/[0.06] hover:text-fg transition-colors"
              >
                <CornerDownLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {isKo ? (
                    <>
                      <strong className="font-semibold text-fg">‘{value.trim()}’</strong> 검색 결과 보기
                    </>
                  ) : (
                    <>
                      See results for <strong className="font-semibold text-fg">‘{value.trim()}’</strong>
                    </>
                  )}
                </span>
              </button>
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
                        <button type="button" onClick={() => select(term)} className="max-w-[160px] truncate">
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
                        onClick={() => select(keyword)}
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
