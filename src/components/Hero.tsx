import React from 'react';
import { X } from 'lucide-react';
import { Language } from '../lib/translations';
import { AITool, Category } from '../types';
import { SearchBar, TRENDING_KEYWORDS } from './SearchBar';
import { AIFavicon } from './AIFavicon';

interface HeroProps {
  lang: Language;
  tools: AITool[];
  recentTools: AITool[];
  onClearRecent: () => void;
  onSelectTool: (tool: AITool) => void;
  onSelectCategory: (category: Category) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSubmitSearch: () => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
  searchAnchorRef?: React.Ref<HTMLDivElement>;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  tools,
  recentTools,
  onClearRecent,
  onSelectTool,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  searchInputRef,
  searchAnchorRef,
}) => {
  const isKo = lang === 'ko';

  return (
    <section className="relative isolate z-20 -mt-16 pt-16">
      {/* Backdrop (masked so the glow fades out before the section edge) */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[min(1100px,140vw)] h-[560px] rounded-full bg-accent/20 blur-[110px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14 text-center">
        <h1 className="font-display text-[2rem] leading-[1.15] sm:text-5xl sm:leading-[1.1] font-bold tracking-[-0.03em] text-fg text-balance-ko">
          {isKo ? (
            <>
              필요한 AI를
              <br className="sm:hidden" />{' '}
              <span className="bg-gradient-to-r from-brand via-accent to-mint bg-clip-text text-transparent rainbow-text">
                가장 빠르게
              </span>{' '}
              찾는 곳
            </>
          ) : (
            <>
              Find the right AI tool,{' '}
              <span className="bg-gradient-to-r from-brand via-accent to-mint bg-clip-text text-transparent rainbow-text">
                faster
              </span>
            </>
          )}
        </h1>

        <p className="mt-4 text-[0.9375rem] sm:text-lg text-muted leading-relaxed text-balance-ko">
          {isKo
            ? '글쓰기·디자인·영상·개발까지, 분야별로 엄선한 AI 도구를 검색하고 비교해 보세요.'
            : 'Writing, design, video, code — search and compare hand-picked AI tools by category.'}
        </p>

        <div ref={searchAnchorRef} className="mt-7 sm:mt-8">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSubmitSearch}
            lang={lang}
            inputRef={searchInputRef}
            tools={tools}
            onSelectTool={onSelectTool}
            onSelectCategory={onSelectCategory}
          />
        </div>

        <div className="mt-4 flex items-center justify-center flex-wrap gap-x-1 gap-y-2 text-sm">
          <span className="text-subtle mr-1">{isKo ? '인기 검색' : 'Popular'}</span>
          {TRENDING_KEYWORDS.slice(0, 5).map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => {
                onSearchChange(keyword);
                onSubmitSearch();
              }}
              className="h-7 px-2.5 rounded-full text-fg-2 hover:text-fg hover:bg-fg/[0.07] transition-colors"
            >
              {keyword}
            </button>
          ))}
        </div>

        {recentTools.length > 0 && (
          <div className="mt-3 flex items-center justify-center flex-wrap gap-x-1.5 gap-y-2 text-sm">
            <span className="text-subtle mr-1">{isKo ? '최근 본 도구' : 'Recently viewed'}</span>
            {recentTools.slice(0, 6).map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool)}
                className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full border border-line bg-surface/60 text-fg-2 hover:text-fg hover:border-line-strong transition-colors"
              >
                <AIFavicon url={tool.url} name={tool.name} customIcon={tool.icon || tool.iconUrl || tool.logoUrl} className="w-5 h-5 rounded-full" />
                <span className="max-w-[9rem] truncate">{tool.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onClearRecent}
              aria-label={isKo ? '최근 본 도구 지우기' : 'Clear recently viewed'}
              title={isKo ? '최근 본 도구 지우기' : 'Clear recently viewed'}
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-subtle hover:text-fg hover:bg-fg/[0.07] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
