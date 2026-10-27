import React, { useEffect, useState } from 'react';
import { X, Dices, ArrowUpRight, Sparkles } from 'lucide-react';
import { AITool } from '../types';
import { BADGES } from '../data/aiToolsData';
import { getCategoryLabel, getToolDescription, Language, UI_TEXT } from '../lib/translations';
import { getCategoryVisual } from '../lib/categories';
import { cn } from '../lib/cn';
import { AIFavicon } from './AIFavicon';
import { Modal } from './ui/Modal';
import { Button, IconButton, LinkButton } from './ui/Button';
import { PriceBadge, ToolBadge } from './ui/Badges';

interface RandomModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: AITool[];
  lang?: Language;
}

export const RandomModal: React.FC<RandomModalProps> = ({ isOpen, onClose, tools, lang = 'ko' }) => {
  const isKo = lang === 'ko';
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  const rollRandom = () => {
    const candidates = (tools || []).filter(
      (t) => !t.status || t.status === 'active' || t.status === 'renamed' || t.status === 'temporarily_unavailable'
    );
    if (candidates.length === 0) return;
    setIsRolling(true);
    let next = candidates[Math.floor(Math.random() * candidates.length)];
    if (candidates.length > 1 && selectedTool && next.id === selectedTool.id) {
      next = candidates[(candidates.indexOf(next) + 1) % candidates.length];
    }
    setSelectedTool(next);
    setRollKey((k) => k + 1);
    window.setTimeout(() => setIsRolling(false), 450);
  };

  useEffect(() => {
    if (isOpen) rollRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!selectedTool) return null;

  const badge = BADGES[selectedTool.id];
  const { Icon, text } = getCategoryVisual(selectedTool.category);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" zIndex={200} labelledBy="random-title">
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-accent/20 to-transparent pointer-events-none" aria-hidden="true" />
        <IconButton label={isKo ? '닫기' : 'Close'} onClick={onClose} className="absolute right-3 top-3 z-10">
          <X className="w-5 h-5" />
        </IconButton>

        <div className="relative px-6 sm:px-8 pt-8 pb-6 text-center">
          <p id="random-title" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Sparkles className="w-3.5 h-3.5" />
            {UI_TEXT.randomModal.todayRecommend[lang]}
          </p>

          <div key={rollKey} className="mt-5 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <AIFavicon
              url={selectedTool.url}
              name={selectedTool.name}
              customIcon={selectedTool.icon || selectedTool.iconUrl || selectedTool.logoUrl}
              className="w-20 h-20 rounded-[22px] shadow-card"
            />
            <div className="mt-4 flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-fg">{selectedTool.name}</h2>
              {badge && <ToolBadge badge={badge} lang={lang} />}
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-fg/[0.06] text-xs font-medium text-fg-2">
                <Icon className={cn('w-3.5 h-3.5', text)} />
                {getCategoryLabel(selectedTool.category, lang)}
              </span>
              <PriceBadge price={selectedTool.price} lang={lang} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-fg-2 max-w-xs">{getToolDescription(selectedTool, lang)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 sm:px-8 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-7">
        <Button variant="secondary" size="lg" onClick={rollRandom} disabled={isRolling} className="flex-1">
          <Dices className={cn('w-[18px] h-[18px] text-mint', isRolling && 'animate-spin')} />
          {UI_TEXT.randomModal.reroll[lang]}
        </Button>
        <LinkButton
          href={selectedTool.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
          className="flex-1"
        >
          {isKo ? '바로가기' : 'Visit'}
          <ArrowUpRight className="w-4 h-4" />
        </LinkButton>
      </div>
    </Modal>
  );
};
