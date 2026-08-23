import React from 'react';
import { Star, Trash2, ArrowRight } from 'lucide-react';
import { AITool } from '../types';
import { getCategoryLabel, getToolDescription, Language, UI_TEXT } from '../lib/translations';
import { AIFavicon } from './AIFavicon';
import { getToolFeatureTags } from '../lib/toolTags';

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
  const getPriceStyle = (price: string) => {
    if (price === '무료') {
      return { dot: 'bg-[#00d4aa]', text: 'text-[#00d4aa]', label: lang === 'ko' ? '무료' : 'FREE' };
    }
    if (price === '유료') {
      return { dot: 'bg-[#ff6b6b]', text: 'text-[#ff6b6b]', label: lang === 'ko' ? '유료' : 'PAID' };
    }
    return { dot: 'bg-amber-400', text: 'text-amber-400', label: lang === 'ko' ? '무료/유료' : 'FREE+' };
  };

  const priceInfo = getPriceStyle(tool.price);
  const descriptionText = getToolDescription(tool, lang);
  const featureTags = getToolFeatureTags(tool, lang);

  return (
    <div
      onClick={() => onOpenDetail?.(tool)}
      className="group relative bg-[#13151f] hover:bg-[#161926] border border-white/10 hover:border-[#6c63ff]/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(108,99,255,0.2),0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer h-full select-none"
      style={{
        animationDelay: `${Math.min(index * 20, 250)}ms`,
      }}
    >
      {/* Top Gradient Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6c63ff] to-[#00d4aa] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 mb-3.5">
        {/* Header: Name + Favicon + Favorite Star + Category */}
        <div className="flex items-start justify-between gap-2 mb-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AIFavicon
              url={tool.url}
              name={tool.name}
              customIcon={tool.icon || tool.iconUrl || tool.logoUrl}
              className="w-7 h-7 rounded-lg shrink-0 border border-white/10"
            />
            <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-white group-hover:text-[#6c63ff] transition-colors truncate">
              {tool.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleBookmark(tool.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-amber-400 hover:scale-110 transition-all cursor-pointer"
              title={isBookmarked ? (lang === 'ko' ? '북마크 취소' : 'Remove Bookmark') : (lang === 'ko' ? '북마크 추가' : 'Add Bookmark')}
            >
              <Star
                className={`w-4 h-4 ${
                  isBookmarked
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-500 hover:text-amber-400'
                }`}
              />
            </button>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1a1d2a] border border-white/10 text-gray-400 whitespace-nowrap">
              {getCategoryLabel(tool.category, lang)}
            </span>
            {tool.isCustom && onDeleteCustomTool && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustomTool(tool.id);
                }}
                className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                title={lang === 'ko' ? '삭제하기' : 'Delete'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-gray-300/85 leading-relaxed line-clamp-3 font-normal min-h-[3.6rem] mb-2.5">
          {descriptionText}
        </p>

        {/* Feature Tags (Chips) */}
        {featureTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {featureTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-gray-400 font-medium group-hover:border-white/10 group-hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Price + Single CTA Button */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-auto shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${priceInfo.dot}`} />
          <span className={`text-[11px] font-bold font-['Space_Grotesk'] uppercase tracking-wider ${priceInfo.text}`}>
            {priceInfo.label}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(tool);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1d2a] group-hover:bg-[#6c63ff] border border-white/10 group-hover:border-[#6c63ff] text-white text-xs font-semibold font-['Space_Grotesk'] rounded-lg transition-all duration-150 cursor-pointer shadow-sm"
        >
          <span>{UI_TEXT.common.viewDetails[lang]}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
