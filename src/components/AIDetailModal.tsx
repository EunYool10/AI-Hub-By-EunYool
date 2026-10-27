import React, { useEffect, useState } from 'react';
import { X, Star, Copy, Check, Sparkles, Zap, Lightbulb, Users, Globe, ArrowUpRight, Link2, Shapes, ChevronRight } from 'lucide-react';
import { AITool, BadgeInfo } from '../types';
import { BADGES } from '../data/aiToolsData';
import { TOOL_DETAILS } from '../data/toolDetails';
import { TOOL_DETAILS_EN } from '../data/toolDetailsEn';
import { getCategoryVisual } from '../lib/categories';
import { getCategoryLabel, getToolDescription, Language, UI_TEXT } from '../lib/translations';
import { AIFavicon } from './AIFavicon';
import { cn } from '../lib/cn';
import { Modal, ModalBody, ModalFooter } from './ui/Modal';
import { IconButton, LinkButton } from './ui/Button';
import { PriceBadge, ToolBadge } from './ui/Badges';

interface AIDetailModalProps {
  tool: AITool | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onToast?: (message: string) => void;
  similarTools?: AITool[];
  onSelectTool?: (tool: AITool) => void;
  lang?: Language;
}

export const AIDetailModal: React.FC<AIDetailModalProps> = ({
  tool,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onToast,
  similarTools = [],
  onSelectTool,
  lang = 'ko',
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
    setShareCopied(false);
  }, [tool?.id]);

  if (!tool) return null;

  const currentLang: Language = (lang || 'ko') as Language;
  const isKo = currentLang === 'ko';
  const badge: BadgeInfo | undefined = BADGES[tool.id];
  const { Icon: CategoryIcon, text: categoryText } = getCategoryVisual(tool.category);

  const coreDesc = getToolDescription(tool, currentLang);
  // Tools added in the browser have no detail text and show only their description.
  const extraDetails = (currentLang === 'en' ? TOOL_DETAILS_EN : TOOL_DETAILS)[tool.id] || {
    tagline: coreDesc,
    highlights: [],
    useCases: [],
    proTip: '',
    targetAudience: [],
  };

  const handleCopyLink = () => {
    if (!tool.url) return;
    navigator.clipboard?.writeText(tool.url).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false)
    );
  };

  // Link back to this hub with the detail window open (see toolIdFromHash in App).
  const handleCopyShareLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#tool=${tool.id}`;
    navigator.clipboard?.writeText(link).then(
      () => {
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2000);
        onToast?.(isKo ? '공유 링크를 복사했어요' : 'Share link copied');
      },
      () => onToast?.(isKo ? '링크를 복사하지 못했어요' : 'Could not copy the link')
    );
  };

  const hasHighlights = extraDetails.highlights && extraDetails.highlights.length > 0;
  const hasUseCases = extraDetails.useCases && extraDetails.useCases.length > 0;
  const hasProTip = Boolean(extraDetails.proTip && extraDetails.proTip.trim());
  const hasTargetAudience = extraDetails.targetAudience && extraDetails.targetAudience.length > 0;

  const sectionTitle = 'flex items-center gap-2 text-sm font-semibold text-fg';
  const displayUrl = (tool.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" zIndex={220} labelledBy="tool-detail-title">
      {/* Header */}
      <div className="relative px-5 sm:px-7 pt-4 sm:pt-6 pb-5 border-b border-line shrink-0">
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4 flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyShareLink}
            aria-label={isKo ? '공유 링크 복사' : 'Copy share link'}
            title={isKo ? '공유 링크 복사' : 'Copy share link'}
            className={cn(
              'w-9 h-9 inline-flex items-center justify-center rounded-lg transition-colors',
              shareCopied ? 'text-mint' : 'text-muted hover:text-fg hover:bg-fg/[0.07]'
            )}
          >
            {shareCopied ? <Check className="w-[18px] h-[18px]" /> : <Link2 className="w-[18px] h-[18px]" />}
          </button>
          <button
            type="button"
            onClick={() => onToggleBookmark(tool.id)}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? UI_TEXT.modal.bookmarked[currentLang] : UI_TEXT.modal.bookmark[currentLang]}
            title={isBookmarked ? UI_TEXT.modal.bookmarked[currentLang] : UI_TEXT.modal.bookmark[currentLang]}
            className={cn(
              'w-9 h-9 inline-flex items-center justify-center rounded-lg transition-colors',
              isBookmarked ? 'text-amber-400 hover:bg-amber-400/10' : 'text-muted hover:text-amber-400 hover:bg-fg/[0.07]'
            )}
          >
            <Star className={cn('w-[18px] h-[18px]', isBookmarked && 'fill-amber-400')} />
          </button>
          <IconButton label={UI_TEXT.modal.close[currentLang]} onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="flex items-start gap-4 pr-28">
          <AIFavicon
            url={tool.url}
            name={tool.name}
            customIcon={tool.icon || tool.iconUrl || tool.logoUrl}
            size={128}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-card"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="tool-detail-title" className="text-xl sm:text-2xl font-bold tracking-tight text-fg leading-tight break-words">
                {tool.name}
              </h2>
              {badge && <ToolBadge badge={badge} lang={currentLang} />}
            </div>
            <p className="mt-1.5 text-sm sm:text-[0.9375rem] text-muted leading-relaxed">{extraDetails.tagline || coreDesc}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-fg/[0.06] text-xs font-medium text-fg-2">
            <CategoryIcon className={cn('w-3.5 h-3.5', categoryText)} />
            {getCategoryLabel(tool.category, currentLang)}
          </span>
          <PriceBadge price={tool.price} lang={currentLang} />
          {tool.isCustom && (
            <span className="inline-flex items-center h-6 px-2 rounded-md bg-purple-400/12 text-xs font-semibold text-purple-300">
              {isKo ? '사용자 등록' : 'User added'}
            </span>
          )}
        </div>
      </div>

      {/* Body (keyed so a similar tool opens scrolled to the top) */}
      <ModalBody key={tool.id} className="px-5 sm:px-7 py-6 space-y-7">
        {coreDesc && extraDetails.tagline && coreDesc !== extraDetails.tagline && (
          <p className="text-[0.9375rem] leading-relaxed text-fg-2">{coreDesc}</p>
        )}

        {hasHighlights && (
          <section>
            <h3 className={sectionTitle}>
              <Zap className="w-4 h-4 text-amber-400" />
              {UI_TEXT.modal.coreFeatures[currentLang]}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {extraDetails.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-fg-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-mint/12 text-mint flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasUseCases && (
          <section>
            <h3 className={sectionTitle}>
              <Sparkles className="w-4 h-4 text-brand" />
              {UI_TEXT.modal.useCases[currentLang]}
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extraDetails.useCases.map((useCase, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-2 border border-line text-sm leading-snug text-fg-2">
                  <span className="text-xs font-bold tabular-nums text-subtle mt-px">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">{useCase}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasProTip && (
          <section className="p-4 rounded-xl bg-amber-400/[0.07] border border-amber-400/25">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Lightbulb className="w-4 h-4" />
              {isKo ? '활용 팁' : 'Pro tip'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-2 whitespace-pre-line">{extraDetails.proTip}</p>
          </section>
        )}

        {hasTargetAudience && (
          <section>
            <h3 className={sectionTitle}>
              <Users className="w-4 h-4 text-mint" />
              {UI_TEXT.modal.targetUsers[currentLang]}
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {extraDetails.targetAudience.map((target, idx) => (
                <span key={idx} className="inline-flex items-center h-8 px-3 rounded-full border border-line bg-surface-2 text-sm text-fg-2">
                  {target}
                </span>
              ))}
            </div>
          </section>
        )}

        {similarTools.length > 0 && onSelectTool && (
          <section>
            <h3 className={sectionTitle}>
              <Shapes className="w-4 h-4 text-brand" />
              {isKo ? '비슷한 도구' : 'Similar tools'}
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {similarTools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTool(t)}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line text-left hover:border-line-strong transition-colors"
                >
                  <AIFavicon url={t.url} name={t.name} customIcon={t.icon || t.iconUrl || t.logoUrl} className="w-9 h-9 rounded-lg shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-fg">{t.name}</span>
                    <span className="block truncate text-xs text-muted">{getToolDescription(t, currentLang)}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-subtle group-hover:text-fg shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 px-5 sm:px-7">
        {tool.url && (
          <div className="w-full sm:flex-1 min-w-0 flex items-center gap-1 h-11 pl-3.5 pr-1.5 rounded-xl bg-surface-2 border border-line">
            <Globe className="w-4 h-4 text-subtle shrink-0" />
            <span className="flex-1 min-w-0 truncate text-sm text-muted ml-1.5" title={tool.url}>
              {displayUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                'shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors',
                copied ? 'text-mint' : 'text-fg-2 hover:text-fg hover:bg-fg/[0.07]'
              )}
              aria-live="polite"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? UI_TEXT.modal.urlCopied[currentLang] : UI_TEXT.modal.copyUrl[currentLang]}
            </button>
          </div>
        )}
        <LinkButton
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto h-11"
        >
          {isKo ? '공식 사이트 방문' : 'Visit website'}
          <ArrowUpRight className="w-4 h-4" />
        </LinkButton>
      </ModalFooter>
    </Modal>
  );
};
