import React, { useState } from 'react';
import { Category } from '../types';
import { LayoutGrid, X, Sparkles, ChevronRight } from 'lucide-react';
import { getCategoryLabel, CATEGORY_TRANSLATIONS, Language } from '../lib/translations';

interface CategoryTabsProps {
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  lang?: Language;
}

export const CATEGORIES: { label: Category; icon: string; desc: string }[] = [
  { label: '전체', icon: '✨', desc: '모든 분야의 추천 AI 도구' },
  { label: '기획/글쓰기', icon: '✍️', desc: '문서 작성, 기획, 아이디어, 초안 작성' },
  { label: '디자인/이미지', icon: '🎨', desc: '이미지 생성, 화풍 변환, 그래픽 디자인' },
  { label: '디자인 생성', icon: '🖌️', desc: 'UI/UX 화면 자동 생성, 프로토타입 렌더링' },
  { label: '영상/오디오', icon: '🎬', desc: '비디오 합성, 자막, 더빙, 음악 작곡' },
  { label: '음성 변환(TTS/STT)', icon: '🎙️', desc: '음성 텍스트 변환, 보이스 클로닝, 성우 TTS' },
  { label: '번역/어학', icon: '🌐', desc: '자연스러운 기계 번역 및 외국어 학습' },
  { label: '개발/데이터', icon: '💻', desc: '코드 에디터, 풀스택 앱 빌더, 자동 완성' },
  { label: '코드 최적화', icon: '⚡', desc: '자동 코드 리뷰, 단위 테스트, 버그 수정' },
  { label: '생산성/협업', icon: '🚀', desc: '노트 정리, 미팅 요약, 지식 관리 툴' },
  { label: '마케팅/분석', icon: '📊', desc: '광고 시안, SEO 점수 분석, 발표 자료 PPT' },
  { label: '학술/리서치', icon: '📚', desc: '논문 데이터베이스 탐색 및 심층 조사' },
  { label: '3D/공간', icon: '🧊', desc: '텍스트 기반 3D 메쉬 및 메타버스 모델링' },
  { label: '에이전트/자동화', icon: '🤖', desc: '자율 브라우징 및 노코드 워크플로우' },
  { label: '금융/투자', icon: '📈', desc: '주식 리포트, 금융 데이터 분석 및 시장 자산 AI' },
  { label: '교육/튜터', icon: '🎓', desc: '개인 맞춤형 대화 학습, 1:1 과외 및 학습 보조' },
  { label: '비즈니스/법률', icon: '⚖️', desc: '계약서 자동 검토, 법률 조문 분석 및 비즈니스 판례' },
];

const PRIMARY_LABELS: Category[] = [
  '전체',
  '기획/글쓰기',
  '디자인/이미지',
  '영상/오디오',
  '개발/데이터',
  '에이전트/자동화',
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  lang = 'ko',
}) => {
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

  // Filter categories to show on the main bar
  const mainCategoriesToShow = CATEGORIES.filter((cat) =>
    PRIMARY_LABELS.includes(cat.label)
  );

  // Check if current activeCategory is an extra category not in PRIMARY_LABELS
  const isCustomActive =
    !PRIMARY_LABELS.includes(activeCategory) && activeCategory !== '전체';

  const customActiveCategoryObj = isCustomActive
    ? CATEGORIES.find((c) => c.label === activeCategory)
    : null;

  const getDesc = (label: string) => {
    const item = CATEGORY_TRANSLATIONS[label];
    if (!item) return '';
    return lang === 'ko' ? item.descKo : item.descEn;
  };

  return (
    <div className="py-1">
      {/* Category Pills Container */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {mainCategoriesToShow.map((cat) => {
          const isActive = activeCategory === cat.label;
          const labelText = getCategoryLabel(cat.label, lang);
          return (
            <button
              key={cat.label}
              onClick={() => onSelectCategory(cat.label)}
              className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-[#6c63ff] text-white border border-[#6c63ff] shadow-md shadow-[#6c63ff]/30 font-semibold scale-[1.02]'
                  : 'bg-[#1a1d2a] hover:bg-[#232738] text-gray-300 hover:text-white border border-white/10 hover:border-white/25'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{labelText}</span>
            </button>
          );
        })}

        {/* If user selected an extra category from modal */}
        {isCustomActive && customActiveCategoryObj && (
          <button
            onClick={() => onSelectCategory(customActiveCategoryObj.label)}
            className="h-9 px-3.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-[#6c63ff] text-white border border-[#6c63ff] shadow-md shadow-[#6c63ff]/30 scale-[1.02]"
          >
            <span className="text-sm leading-none">{customActiveCategoryObj.icon}</span>
            <span>{getCategoryLabel(customActiveCategoryObj.label, lang)}</span>
          </button>
        )}

        {/* 'All Categories' button */}
        <button
          onClick={() => setIsMoreModalOpen(true)}
          className="h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-[#6c63ff]/20 to-[#00d4aa]/20 hover:from-[#6c63ff]/30 hover:to-[#00d4aa]/30 text-[#00d4aa] border border-[#00d4aa]/50 hover:border-[#00d4aa] shadow-sm active:scale-95"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span>{lang === 'ko' ? '전체 카테고리 ⊞' : 'All Categories ⊞'}</span>
        </button>
      </div>

      {/* All Categories Modal */}
      {isMoreModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#13151f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/20 border border-[#6c63ff]/40 flex items-center justify-center text-[#6c63ff]">
                  <LayoutGrid className="w-5 h-5 text-[#00d4aa]" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
                    {lang === 'ko' ? '전체 카테고리 한눈에 보기' : 'Explore All Categories'}
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-gray-400">
                    {lang === 'ko'
                      ? '원하시는 주제를 선택하여 관련 AI 도구만 신속하게 필터링하세요.'
                      : 'Select a domain to quickly filter tools by topic.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMoreModalOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.label;
                const labelText = getCategoryLabel(cat.label, lang);
                const descText = getDesc(cat.label);
                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      onSelectCategory(cat.label);
                      setIsMoreModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-[#6c63ff]/20 border-[#6c63ff] shadow-lg shadow-[#6c63ff]/20'
                        : 'bg-[#1a1d2a] border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold text-sm ${
                            isActive ? 'text-[#00d4aa]' : 'text-white'
                          }`}
                        >
                          {labelText}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                        {descText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="pt-4 border-t border-white/10 mt-4 text-center">
              <span className="text-xs text-gray-400">
                {lang === 'ko' ? '현재 선택된 카테고리: ' : 'Selected Category: '}
                <strong className="text-[#00d4aa]">{getCategoryLabel(activeCategory, lang)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
