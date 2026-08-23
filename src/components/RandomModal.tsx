import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Dices, Sparkles } from 'lucide-react';
import { AITool } from '../types';
import { BADGES } from '../data/aiToolsData';
import { getCategoryLabel, getToolDescription, Language, UI_TEXT } from '../lib/translations';
import { AIFavicon } from './AIFavicon';

interface RandomModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: AITool[];
  lang?: Language;
}

export const RandomModal: React.FC<RandomModalProps> = ({
  isOpen,
  onClose,
  tools,
  lang = 'ko',
}) => {
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollRandom = () => {
    const activeCandidates = (tools || []).filter(
      (t) => !t.status || t.status === 'active' || t.status === 'renamed' || t.status === 'temporarily_unavailable'
    );
    if (activeCandidates.length === 0) return;
    setIsRolling(true);
    const randomIndex = Math.floor(Math.random() * activeCandidates.length);
    setSelectedTool(activeCandidates[randomIndex]);

    setTimeout(() => {
      setIsRolling(false);
    }, 400);
  };

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      rollRandom();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedTool) return null;

  const badge = BADGES[selectedTool.id];

  const getPriceLabel = (price: string) => {
    if (price === '무료') return 'FREE';
    if (price === '유료') return 'PAID';
    return 'FREE+';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-black relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title={lang === 'ko' ? '닫기' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-3xl shadow-lg shadow-[#6c63ff]/30 mb-3 ${
              isRolling ? 'animate-spin' : ''
            }`}
          >
            <Dices className="w-8 h-8 text-white" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest font-['Space_Grotesk'] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{UI_TEXT.randomModal.todayRecommend[lang]}</span>
          </div>

          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white mb-1.5 flex items-center justify-center gap-2.5">
            <AIFavicon
              url={selectedTool.url}
              name={selectedTool.name}
              customIcon={selectedTool.icon || selectedTool.iconUrl || selectedTool.logoUrl}
              className="w-7 h-7 rounded-lg border border-white/10"
            />
            <span>{selectedTool.name}</span>
          </h2>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1a1d2a] border border-white/10 text-gray-300">
              {getCategoryLabel(selectedTool.category, lang)}
            </span>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {badge.label}
              </span>
            )}
            <span className="text-xs font-bold text-[#00d4aa] uppercase font-['Space_Grotesk']">
              {getPriceLabel(selectedTool.price)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 bg-[#1a1d2a]/60 p-4 rounded-xl border border-white/5">
            {getToolDescription(selectedTool, lang)}
          </p>

          <div className="flex items-center gap-3 w-full">
            <a
              href={selectedTool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#6c63ff] hover:bg-[#5b52e0] text-white font-bold text-xs sm:text-sm font-['Space_Grotesk'] rounded-xl transition-all shadow-lg shadow-[#6c63ff]/25"
            >
              <span>{UI_TEXT.randomModal.visit[lang]}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={rollRandom}
              disabled={isRolling}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#1a1d2a] hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm font-['Space_Grotesk'] rounded-xl transition-all cursor-pointer"
            >
              <Dices className="w-4 h-4 text-[#00d4aa]" />
              <span>{UI_TEXT.randomModal.reroll[lang]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
