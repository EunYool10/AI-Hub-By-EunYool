import React, { useEffect, useState } from 'react';
import { X, Star, Copy, Check, Sparkles, Zap, Lightbulb, Users, Globe, ArrowUpRight, Link2, Shapes, ChevronRight } from 'lucide-react';
import { AITool, BadgeInfo } from '../types';
import { BADGES } from '../data/aiToolsData';
import { TOOL_DETAILS } from '../data/toolDetails';
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

interface ExtraToolDetailItem {
  tagline: { ko: string; en: string };
  highlights: { ko: string[]; en: string[] };
  useCases: { ko: string[]; en: string[] };
  proTip: { ko: string; en: string };
  targetAudience: { ko: string[]; en: string[] };
}

interface ExtraToolDetailResolved {
  tagline: string;
  highlights: string[];
  useCases: string[];
  proTip: string;
  targetAudience: string[];
}

const getExtraDetailResolved = (item: ExtraToolDetailItem, lang: Language): ExtraToolDetailResolved => {
  return {
    tagline: lang === 'en' ? item.tagline.en || item.tagline.ko : item.tagline.ko,
    highlights: lang === 'en' && item.highlights.en ? item.highlights.en : item.highlights.ko,
    useCases: lang === 'en' && item.useCases.en ? item.useCases.en : item.useCases.ko,
    proTip: lang === 'en' ? item.proTip.en || item.proTip.ko : item.proTip.ko,
    targetAudience: lang === 'en' && item.targetAudience.en ? item.targetAudience.en : item.targetAudience.ko,
  };
};

// Per-category text: the English for every tool, and the Korean when TOOL_DETAILS has no entry.
const getFallbackDetails = (tool: AITool): ExtraToolDetailItem => {
  const cat = tool.category;

  if (cat.includes('기획') || cat.includes('글쓰기')) {
    return {
      tagline: {
        ko: `${tool.name} - 아이디어 구상과 효율적인 텍스트 작성을 돕는 전문 AI`,
        en: `${tool.name} - Professional AI assisting in ideation and efficient text generation`,
      },
      highlights: {
        ko: [
          '자연스러운 문장 구성 및 문맥에 맞는 내용 자동 보완',
          '긴 문단 요약, 핵심 포인트 추출 및 브레인스토밍 기능',
          '다양한 글쓰기 톤앤매너 변경 및 맞춤법 정교 교정',
        ],
        en: [
          'Natural sentence structuring and context-aware auto-completion',
          'Paragraph summarization, key point extraction, and brainstorming',
          'Custom writing tone adjustments and precise grammar correction',
        ],
      },
      useCases: {
        ko: ['업무 보고서 및 제안서 작성', '블로그·SNS 스크립트 작성', '자료 정리 및 아이디어 도출'],
        en: ['Writing business reports & proposals', 'Drafting blog & social media scripts', 'Organizing research & ideation'],
      },
      proTip: {
        ko: '원하는 목적(예: "상사 보고용으로 경어체를 사용하여 3줄 요약해줘")을 명확히 제시하면 훨씬 만족스러운 결과를 얻을 수 있습니다.',
        en: 'Clearly state your goal (e.g. "Summarize in 3 bullet points with a formal tone for executive reporting").',
      },
      targetAudience: {
        ko: ['기획자', '직장인', '콘텐츠 크리에이터'],
        en: ['Planners', 'Professionals', 'Content Creators'],
      },
    };
  }

  if (cat.includes('디자인') || cat.includes('이미지')) {
    return {
      tagline: {
        ko: `${tool.name} - 고퀄리티 시각 자료와 비주얼을 신속하게 구현하는 AI`,
        en: `${tool.name} - AI for rapidly rendering high-quality visual materials`,
      },
      highlights: {
        ko: [
          '텍스트 명령어나 이미지 기반의 고화질 비주얼 자동 생성',
          '스타일 매칭, 레이아웃 추천 및 그래픽 보정 기능',
          '디자이너 작업 시간 절감을 위한 맞춤형 워크플로우 지원',
        ],
        en: [
          'Automated generation of high-res visuals from prompts or images',
          'Style matching, layout recommendation, and graphic touch-ups',
          'Tailored workflows to save design iteration time',
        ],
      },
      useCases: {
        ko: ['마케팅 배너 및 SNS 이미지 제작', '웹/앱 UI 컨셉 시안 구상', '포스터 및 시각 자료 제작'],
        en: ['Creating marketing banners & social images', 'Drafting web/app UI concept mockups', 'Designing posters & graphics'],
      },
      proTip: {
        ko: '주요 메인 컬러, 구도, 아트 스타일(예: "Minimalist, 3D render, octane render") 키워드를 포함해 보세요.',
        en: 'Include key color palettes, composition, and art style keywords (e.g., "Minimalist, 3D render, octane render").',
      },
      targetAudience: {
        ko: ['디자이너', '마케터', '크리에이터'],
        en: ['Designers', 'Marketers', 'Creators'],
      },
    };
  }

  if (cat.includes('영상') || cat.includes('오디오')) {
    return {
      tagline: {
        ko: `${tool.name} - 차세대 멀티미디어 콘텐츠를 위한 미디어 생성 AI`,
        en: `${tool.name} - Media synthesis AI for next-gen multimedia content`,
      },
      highlights: {
        ko: [
          '텍스트나 스틸 컷 기반의 자연스러운 모션/음성 자동 합성',
          '빠른 영상 편집, 자막 자동화, 음성 복제 및 BGM 생성',
          '쇼츠, 릴스 등 숏폼 콘텐츠 최적화 제작 기능',
        ],
        en: [
          'Automated motion and voice synthesis from text or still shots',
          'Fast video editing, auto-captioning, voice cloning, and BGM creation',
          'Optimized creation flow for Shorts, Reels, and short-form video',
        ],
      },
      useCases: {
        ko: ['유튜브 및 숏폼 영상 제작', '기업 홍보 영상 및 오디오 더빙', '배경음악 및 효과음 창작'],
        en: ['YouTube & short-form video creation', 'Corporate promos & audio dubbing', 'Creating background music & SFX'],
      },
      proTip: {
        ko: '원하는 비트수, 분위기 또는 카메라 액션 명칭을 구체적으로 입력해 보세요.',
        en: 'Provide specific tempo, mood, or camera movement names in your prompt.',
      },
      targetAudience: {
        ko: ['영상 편집자', '유튜버', '마케터'],
        en: ['Video Editors', 'YouTubers', 'Marketers'],
      },
    };
  }

  if (cat.includes('개발') || cat.includes('데이터')) {
    return {
      tagline: {
        ko: `${tool.name} - 생산성을 극대화하는 개발자 & 데이터 전문 AI`,
        en: `${tool.name} - Specialized AI for developer velocity and data processing`,
      },
      highlights: {
        ko: [
          '자동 코드 완성, 리팩토링 및 버그 자동 탐지',
          '복잡한 데이터 구조 분석 및 SQL/파이썬 쿼리 자동 작성',
          '신규 기술 스택 학습 및 알고리즘 해설',
        ],
        en: [
          'Auto code completion, refactoring, and bug detection',
          'Complex data structure analysis & auto SQL/Python query drafting',
          'Accelerated tech stack learning and algorithm explanation',
        ],
      },
      useCases: {
        ko: ['프로그램 개발 및 코드 작성', '데이터 가공 및 자동 분석', '코드 리뷰 및 성능 최적화'],
        en: ['Software development & coding', 'Data transformation & automated analysis', 'Code review & performance optimization'],
      },
      proTip: {
        ko: '에러 메시지 전체를 복사하여 전달하면 원인 분석과 수정 코드를 즉시 제안받을 수 있습니다.',
        en: 'Paste the complete error stack trace to get root-cause analysis and fixed code snippets instantly.',
      },
      targetAudience: {
        ko: ['개발자', '데이터 분석가', '엔지니어'],
        en: ['Developers', 'Data Analysts', 'Engineers'],
      },
    };
  }

  return {
    tagline: {
      ko: `${tool.name} - ${tool.category} 분야의 스마트한 작업을 지원하는 AI 솔루션`,
      en: `${tool.name} - Smart AI solution empowering productivity in ${getCategoryLabel(tool.category, 'en')}`,
    },
    highlights: {
      ko: [
        '반복적인 업무 절차 자동화 및 생산성 혁신',
        '전문적인 분야 지식 기반 분석 및 최적의 대안 제시',
        '사용자 맞춤형 설정 및 신속한 결과 도출',
      ],
      en: [
        'Automates repetitive workflows to supercharge productivity',
        'Provides domain-specific insights and optimal recommendations',
        'Customizable settings for swift, tailored execution',
      ],
    },
    useCases: {
      ko: ['업무 프로세스 효율화', '전문 데이터 조회 및 결과 가공', '맞춤형 솔루션 구축'],
      en: ['Streamlining business processes', 'Domain data query & result processing', 'Building tailored AI solutions'],
    },
    proTip: {
      ko: '구체적인 가이드라인과 예시 입력(Few-shot)을 함께 제공하면 답변 품질이 대폭 향상됩니다.',
      en: 'Providing clear guidelines and few-shot examples significantly improves generation quality.',
    },
    targetAudience: {
      ko: ['전문가', '직장인', '스마트 워커'],
      en: ['Experts', 'Professionals', 'Smart Workers'],
    },
  };
};

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

  const fallback = getFallbackDetails(tool);
  const ko = TOOL_DETAILS[tool.id];
  const rawDetails: ExtraToolDetailItem = ko
    ? {
        tagline: { ko: ko.tagline, en: fallback.tagline.en },
        highlights: { ko: ko.highlights, en: fallback.highlights.en },
        useCases: { ko: ko.useCases, en: fallback.useCases.en },
        proTip: { ko: ko.proTip, en: fallback.proTip.en },
        targetAudience: { ko: ko.targetAudience, en: fallback.targetAudience.en },
      }
    : fallback;
  const extraDetails = getExtraDetailResolved(rawDetails, currentLang);
  const coreDesc = getToolDescription(tool, currentLang);

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
