import React from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';
import { Language, UI_TEXT } from '../lib/translations';
import { AIHubBrandLogo } from './AIHubBrandLogo';

interface FooterProps {
  onOpenInquiryModal?: () => void;
  onOpenNoticeModal?: () => void;
  onOpenRandomModal?: () => void;
  onOpenSettings?: () => void;
  lang?: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenInquiryModal,
  onOpenNoticeModal,
  onOpenRandomModal,
  onOpenSettings,
  lang = 'ko',
}) => {
  const isKo = lang === 'ko';
  const link = 'text-sm text-muted hover:text-fg transition-colors text-left';

  return (
    <footer className="mt-auto border-t border-line bg-surface/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <AIHubBrandLogo className="w-8 h-8" />
              <span className="font-display text-base font-bold tracking-tight text-fg">AI Hub</span>
              <span className="text-xs text-subtle">by Yool</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {isKo
                ? '분야별로 엄선한 AI 도구를 한곳에서 검색하고 비교하는 디렉토리입니다. 찾는 도구가 없다면 언제든 제안해 주세요.'
                : 'A directory to search and compare hand-picked AI tools in one place. Missing something? Suggest it anytime.'}
            </p>
          </div>

          <nav aria-label={isKo ? '바로가기' : 'Shortcuts'}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">{isKo ? '서비스' : 'Service'}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button type="button" onClick={onOpenNoticeModal} className={link}>
                  {UI_TEXT.header.notices[lang]}
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenRandomModal} className={link}>
                  {isKo ? '랜덤 AI 뽑기' : 'Random pick'}
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenSettings} className={link}>
                  {UI_TEXT.settings.title[lang]}
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">{isKo ? '문의' : 'Contact'}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button type="button" onClick={onOpenInquiryModal} className={`${link} inline-flex items-center gap-1`}>
                  {isKo ? 'AI 도구 제안 · 문의하기' : 'Suggest a tool / Contact'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li>
                <a href="mailto:deer123424@gmail.com" className={`${link} inline-flex items-center gap-1.5 break-all`}>
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  deer123424@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-subtle">
          <span>{UI_TEXT.footer.copyright[lang]}</span>
          <span>
            {UI_TEXT.footer.dev[lang]} <span className="text-muted font-medium">{UI_TEXT.footer.devName[lang]}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
