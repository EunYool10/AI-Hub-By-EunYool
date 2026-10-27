import React from 'react';
import { Star, Trash2, ArrowUpRight } from 'lucide-react';
import { AITool } from '../types';
import { BADGES } from '../data/aiToolsData';
import { getCategoryLabel, getToolDescription, Language } from '../lib/translations';
import { getCategoryVisual } from '../lib/categories';
import { getToolFeatureTags } from '../lib/toolTags';
import { cn } from '../lib/cn';
import { AIFavicon } from './AIFavicon';
import { PriceBadge, ToolBadge } from './ui/Badges';

interface AICardProps {
  tool: AITool;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onDeleteCustomTool?: (id: number) => void;
  onOpenDetail?: (tool: AITool) => void;
  index: number;
  lang?: Language;
}

export const AICard: React.FC<AICardProps> = ({
  tool,
  isBookmarked,
  onToggleBookmark,
  onDeleteCustomTool,
  onOpenDetail,
  index,
  lang = 'ko',
}) => {
  const isKo = lang === 'ko';
  const description = getToolDescription(tool, lang);
  const featureTags = getToolFeatureTags(tool, lang);
  const badge = BADGES[tool.id];
  const { Icon, text } = getCategoryVisual(tool.category);

  return (
    <article
      data-tool-card
      className="group relative flex flex-col h-full p-5 rounded-2xl border border-line bg-surface transition-[transform,border-color,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
    >
      <div className="flex items-start gap-3.5">
        <AIFavicon
          url={tool.url}
          name={tool.name}
          customIcon={tool.icon || tool.iconUrl || tool.logoUrl}
          className="w-11 h-11 rounded-xl"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
            <h3 className="min-w-0 text-[0.9375rem] font-semibold leading-snug text-fg break-keep [overflow-wrap:anywhere]">
              {/* Stretched button: makes the whole card open the detail view */}
              <button
                type="button"
                data-open
                onClick={() => onOpenDetail?.(tool)}
                className="text-left focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-accent focus-visible:after:outline-offset-2"
              >
                {tool.name}
                <span className="sr-only">{isKo ? ' 자세히 보기' : ' — view details'}</span>
              </button>
            </h3>
            {badge && <ToolBadge badge={badge} lang={lang} />}
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted min-w-0">
            <Icon className={cn('w-3.5 h-3.5 shrink-0 mt-px', text)} aria-hidden="true" />
            <span className="break-keep">{getCategoryLabel(tool.category, lang)}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleBookmark(tool.id)}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? (isKo ? '북마크 해제' : 'Remove bookmark') : isKo ? '북마크 추가' : 'Add bookmark'}
          title={isBookmarked ? (isKo ? '북마크 해제' : 'Remove bookmark') : isKo ? '북마크 추가' : 'Add bookmark'}
          className={cn(
            'relative z-10 -mr-2 -mt-1.5 w-9 h-9 inline-flex items-center justify-center rounded-lg transition-colors',
            isBookmarked ? 'text-amber-400 hover:bg-amber-400/10' : 'text-subtle hover:text-amber-400 hover:bg-fg/[0.06]'
          )}
        >
          <Star className={cn('w-[18px] h-[18px]', isBookmarked && 'fill-amber-400')} />
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-fg-2 break-keep [overflow-wrap:anywhere]">{description}</p>

      {featureTags.length > 0 && (
        <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label={isKo ? '특징' : 'Features'}>
          {featureTags.map((tag) => (
            <li key={tag} className="h-6 inline-flex items-center px-2 rounded-md bg-fg/[0.05] text-xs text-muted whitespace-nowrap">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-5 flex items-center justify-between gap-2">
        <PriceBadge price={tool.price} lang={lang} />
        <div className="relative z-10 flex items-center gap-0.5 -mr-2">
          {tool.isCustom && onDeleteCustomTool && (
            <button
              type="button"
              onClick={() => onDeleteCustomTool(tool.id)}
              aria-label={isKo ? `${tool.name} 삭제` : `Delete ${tool.name}`}
              title={isKo ? '삭제' : 'Delete'}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-muted hover:text-fg hover:bg-fg/[0.07] transition-colors"
          >
            {isKo ? '바로가기' : 'Visit'}
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="sr-only">{isKo ? '(새 창)' : '(opens in new tab)'}</span>
          </a>
        </div>
      </div>
    </article>
  );
};
