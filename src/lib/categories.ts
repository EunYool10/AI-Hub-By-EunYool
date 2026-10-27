import {
  LayoutGrid,
  MessagesSquare,
  Search,
  Presentation,
  Image,
  Shapes,
  Clapperboard,
  AudioLines,
  Music,
  Languages,
  GraduationCap,
  Code2,
  AppWindow,
  Briefcase,
  Megaphone,
  Bot,
  TrendingUp,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { Category } from '../types';

export const CATEGORIES: { label: Category; icon: string; desc: string }[] = [
  { label: '전체', icon: '✨', desc: '모든 분야의 추천 AI 도구' },
  { label: 'AI 챗봇', icon: '💬', desc: '무엇이든 물어보고 글쓰기·요약·코딩까지 하는 대화형 AI' },
  { label: '검색·리서치', icon: '🔎', desc: '출처가 달린 AI 검색, 논문 찾기, 자료 읽고 정리하기' },
  { label: '문서·발표', icon: '📑', desc: 'PPT·문서 자동 생성, 도식과 인포그래픽' },
  { label: '이미지 생성', icon: '🎨', desc: '글로 그림·사진·일러스트를 만들고 편집하기' },
  { label: '디자인·3D', icon: '🧩', desc: '디자인 툴, 앱 화면(UI) 시안, 3D 모델 만들기' },
  { label: '영상 제작', icon: '🎬', desc: '영상 생성, AI 아바타, 자막·컷 편집' },
  { label: 'AI 음성', icon: '🎙️', desc: 'AI 성우(TTS), 받아쓰기(STT), 목소리 복제, 음성 보정' },
  { label: '음악 생성', icon: '🎵', desc: '가사와 분위기로 노래·배경음악 만들기' },
  { label: '번역·외국어', icon: '🌐', desc: '번역기, 외국어 회화·발음 연습' },
  { label: '교육·튜터', icon: '🎓', desc: '스스로 생각하게 돕는 AI 튜터와 학습 도우미' },
  { label: '개발·코딩', icon: '💻', desc: 'AI 코드 에디터, 코딩 에이전트, 코드 리뷰·테스트' },
  { label: '앱·웹 만들기', icon: '🧱', desc: '코딩 없이 말로 웹사이트와 앱을 만들고 배포하기' },
  { label: '업무·생산성', icon: '🚀', desc: '회의록, 노트·지식 관리, 사내 검색, 데이터 분석' },
  { label: '마케팅', icon: '📣', desc: '광고 문구·소재, SEO, 키워드 분석' },
  { label: '에이전트·자동화', icon: '🤖', desc: '일을 맡기는 AI 에이전트, 노코드 업무 자동화' },
  { label: '금융·투자', icon: '📈', desc: '기업 재무·실적 리서치, 투자 분석' },
  { label: '법률', icon: '⚖️', desc: '계약서 검토, 판례·법률 리서치' },
];

// Category names before the 2026-10-28 reorganization, for tools saved in browsers under the old names.
const LEGACY_CATEGORIES: Record<string, Category> = {
  '기획/글쓰기': 'AI 챗봇',
  '디자인/이미지': '이미지 생성',
  '디자인 생성': '디자인·3D',
  '영상/오디오': '영상 제작',
  '음성 변환(TTS/STT)': 'AI 음성',
  '번역/어학': '번역·외국어',
  '개발/데이터': '개발·코딩',
  '코드 최적화': '개발·코딩',
  '생산성/협업': '업무·생산성',
  '마케팅/분석': '마케팅',
  '학술/리서치': '검색·리서치',
  '3D/공간': '디자인·3D',
  '에이전트/자동화': '에이전트·자동화',
  '금융/투자': '금융·투자',
  '교육/튜터': '교육·튜터',
  '비즈니스/법률': '법률',
};

export const currentCategory = (category: string): string => LEGACY_CATEGORIES[category] || category;

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
  'AI 챗봇': { Icon: MessagesSquare, text: 'text-amber-400', tint: 'bg-amber-400/12' },
  '검색·리서치': { Icon: Search, text: 'text-cyan-400', tint: 'bg-cyan-400/12' },
  '문서·발표': { Icon: Presentation, text: 'text-orange-400', tint: 'bg-orange-400/12' },
  '이미지 생성': { Icon: Image, text: 'text-pink-400', tint: 'bg-pink-400/12' },
  '디자인·3D': { Icon: Shapes, text: 'text-fuchsia-400', tint: 'bg-fuchsia-400/12' },
  '영상 제작': { Icon: Clapperboard, text: 'text-rose-400', tint: 'bg-rose-400/12' },
  'AI 음성': { Icon: AudioLines, text: 'text-yellow-400', tint: 'bg-yellow-400/12' },
  '음악 생성': { Icon: Music, text: 'text-red-400', tint: 'bg-red-400/12' },
  '번역·외국어': { Icon: Languages, text: 'text-sky-400', tint: 'bg-sky-400/12' },
  '교육·튜터': { Icon: GraduationCap, text: 'text-teal-400', tint: 'bg-teal-400/12' },
  '개발·코딩': { Icon: Code2, text: 'text-emerald-400', tint: 'bg-emerald-400/12' },
  '앱·웹 만들기': { Icon: AppWindow, text: 'text-lime-400', tint: 'bg-lime-400/12' },
  '업무·생산성': { Icon: Briefcase, text: 'text-blue-400', tint: 'bg-blue-400/12' },
  '마케팅': { Icon: Megaphone, text: 'text-violet-400', tint: 'bg-violet-400/12' },
  '에이전트·자동화': { Icon: Bot, text: 'text-indigo-400', tint: 'bg-indigo-400/12' },
  '금융·투자': { Icon: TrendingUp, text: 'text-green-400', tint: 'bg-green-400/12' },
  '법률': { Icon: Scale, text: 'text-purple-400', tint: 'bg-purple-400/12' },
};

export function getCategoryVisual(category: string): CategoryVisual {
  return VISUALS[currentCategory(category)] || VISUALS['전체'];
}
