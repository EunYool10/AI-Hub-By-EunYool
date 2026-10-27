import {
  LayoutGrid,
  PenLine,
  Image,
  Palette,
  Clapperboard,
  AudioLines,
  Languages,
  Code2,
  Gauge,
  Briefcase,
  BarChart3,
  BookOpen,
  Box,
  Bot,
  TrendingUp,
  GraduationCap,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { Category } from '../types';

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

export interface CategoryVisual {
  Icon: LucideIcon;
  /** text color class for the icon */
  text: string;
  /** soft tinted background for icon tiles */
  tint: string;
}

// Full class strings are spelled out so Tailwind can see them.
const VISUALS: Record<string, CategoryVisual> = {
  '전체': { Icon: LayoutGrid, text: 'text-brand', tint: 'bg-accent/12' },
  '기획/글쓰기': { Icon: PenLine, text: 'text-amber-400', tint: 'bg-amber-400/12' },
  '디자인/이미지': { Icon: Image, text: 'text-pink-400', tint: 'bg-pink-400/12' },
  '디자인 생성': { Icon: Palette, text: 'text-fuchsia-400', tint: 'bg-fuchsia-400/12' },
  '영상/오디오': { Icon: Clapperboard, text: 'text-rose-400', tint: 'bg-rose-400/12' },
  '음성 변환(TTS/STT)': { Icon: AudioLines, text: 'text-orange-400', tint: 'bg-orange-400/12' },
  '번역/어학': { Icon: Languages, text: 'text-sky-400', tint: 'bg-sky-400/12' },
  '개발/데이터': { Icon: Code2, text: 'text-emerald-400', tint: 'bg-emerald-400/12' },
  '코드 최적화': { Icon: Gauge, text: 'text-lime-400', tint: 'bg-lime-400/12' },
  '생산성/협업': { Icon: Briefcase, text: 'text-blue-400', tint: 'bg-blue-400/12' },
  '마케팅/분석': { Icon: BarChart3, text: 'text-violet-400', tint: 'bg-violet-400/12' },
  '학술/리서치': { Icon: BookOpen, text: 'text-cyan-400', tint: 'bg-cyan-400/12' },
  '3D/공간': { Icon: Box, text: 'text-teal-400', tint: 'bg-teal-400/12' },
  '에이전트/자동화': { Icon: Bot, text: 'text-indigo-400', tint: 'bg-indigo-400/12' },
  '금융/투자': { Icon: TrendingUp, text: 'text-green-400', tint: 'bg-green-400/12' },
  '교육/튜터': { Icon: GraduationCap, text: 'text-yellow-400', tint: 'bg-yellow-400/12' },
  '비즈니스/법률': { Icon: Scale, text: 'text-purple-400', tint: 'bg-purple-400/12' },
};

export function getCategoryVisual(category: string): CategoryVisual {
  return VISUALS[category] || VISUALS['전체'];
}
