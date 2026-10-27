import { AITool } from '../types';
import { getCategoryLabel } from './translations';

// Words people use for each category, e.g. "그림 그려주는 AI" should land on 이미지 생성.
export const CATEGORY_HINTS: Record<string, string[]> = {
  'AI 챗봇': ['챗봇', '대화형', '질문', '물어', '글쓰기', '글 쓰', '작문', '요약', '자소서', '이메일', 'gpt', '지피티', 'chatbot', 'chat', 'assistant', 'llm', 'writing', 'summar', 'email'],
  '검색·리서치': ['검색', '찾기', '자료조사', '자료 조사', '조사', '리서치', '논문', '연구', '학술', '출처', 'pdf', '문헌', 'search', 'research', 'paper', 'academic', 'citation', 'source'],
  '문서·발표': ['ppt', '피피티', '발표', '슬라이드', '프레젠테이션', '문서', '보고서', '도식', '다이어그램', '인포그래픽', '차트 그림', 'presentation', 'slides', 'deck', 'document', 'report', 'diagram', 'infographic'],
  '이미지 생성': ['이미지', '그림', '사진', '일러스트', '로고', '포스터', '썸네일', '그려', '캐릭터', 'image', 'picture', 'photo', 'illustration', 'logo', 'drawing'],
  '디자인·3D': ['디자인', 'ui', 'ux', '화면 디자인', '프로토타입', '웹디자인', '앱 디자인', '피그마', '카드뉴스', '3d', '모델링', '3d 프린팅', 'design', 'figma', 'prototype', 'mockup', 'wireframe', 'modeling'],
  '영상 제작': ['영상', '동영상', '비디오', '유튜브', '쇼츠', '릴스', '편집', '자막', '아바타', 'video', 'youtube', 'shorts', 'subtitle', 'caption', 'avatar'],
  'AI 음성': ['음성', '목소리', '보이스', '더빙', '성우', '받아쓰기', '녹음', '음질', '낭독', '읽어', 'tts', 'stt', 'voice', 'speech', 'transcri', 'audio', 'dubbing'],
  '음악 생성': ['음악', '작곡', '노래', '배경음악', 'bgm', '가사', 'music', 'song', 'lyrics'],
  '번역·외국어': ['번역', '영어', '일본어', '중국어', '외국어', '어학', '회화', '발음', 'translat', 'language', 'english', 'pronunciation'],
  '교육·튜터': ['공부', '학습', '과외', '수학', '숙제', '튜터', '교사', '선생님', 'study', 'learn', 'tutor', 'homework', 'math', 'teacher'],
  '개발·코딩': ['코딩', '코드', '개발', '프로그래밍', '파이썬', '버그', '디버그', '디버깅', '코드 리뷰', '테스트', '리팩터', '터미널', 'code', 'coding', 'programming', 'developer', 'python', 'bug', 'debug', 'review', 'test', 'refactor'],
  '앱·웹 만들기': ['웹사이트', '홈페이지', '앱 만들', '웹 만들', '사이트 만들', '노코드 앱', '바이브 코딩', '바이브코딩', 'mvp', '랜딩', 'website', 'app builder', 'landing page', 'vibe coding', 'no-code app'],
  '업무·생산성': ['회의', '회의록', '미팅', '노트', '메모', '일정', '협업', '업무', '할 일', '데이터 분석', '엑셀', '사내', 'meeting', 'notes', 'productivity', 'schedule', 'todo', 'excel', 'spreadsheet', 'data'],
  '마케팅': ['마케팅', '광고', '카피', '홍보', 'seo', '키워드', '블로그', 'sns', '배너', 'marketing', 'ads', 'copy', 'keyword', 'blog', 'banner'],
  '에이전트·자동화': ['자동화', '에이전트', '워크플로', '노코드', '업무 자동', '전화 상담', 'automation', 'agent', 'workflow', 'no-code', 'nocode', 'zapier'],
  '금융·투자': ['주식', '투자', '금융', '재테크', '경제', '재무', '실적', '증권', 'stock', 'invest', 'finance', 'earnings'],
  '법률': ['계약', '계약서', '법률', '판례', '변호사', '법무', 'contract', 'legal', 'law', 'lawyer'],
};

const FREE_WORDS = ['무료', '공짜', 'free'];

// Everyday words with a space ("바이브 코딩", "자료 조사") and their categories. They are matched whole, not word by word.
const HINT_PHRASES = new Map<string, Set<string>>();
for (const [category, words] of Object.entries(CATEGORY_HINTS)) {
  for (const w of words) if (w.includes(' ')) HINT_PHRASES.set(w, (HINT_PHRASES.get(w) || new Set<string>()).add(category));
}

export const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** Categories whose everyday words appear in the query, with how many words matched. */
export function categoriesForQuery(query: string): Map<string, number> {
  const q = query.toLowerCase();
  const hits = new Map<string, number>();
  for (const [category, words] of Object.entries(CATEGORY_HINTS)) {
    const count = words.filter((w) => q.includes(w)).length;
    if (count) hits.set(category, count);
  }
  return hits;
}

function fieldsOf(tool: AITool): string[] {
  return [tool.name, tool.description, tool.descriptionEn, ...(tool.tags || []), tool.category, getCategoryLabel(tool.category, 'en')]
    .filter(Boolean)
    .map((f) => String(f).toLowerCase());
}

/** Everyday phrases in the query, and the words outside them ("바이브 코딩 무료" → ["바이브 코딩"], ["무료"]). */
function termsOf(q: string): { phrases: string[]; words: string[] } {
  const inPhrase = new Array<boolean>(q.length).fill(false);
  const phrases = [...HINT_PHRASES.keys()].filter((p) => {
    const at = q.indexOf(p);
    if (at >= 0) inPhrase.fill(true, at, at + p.length);
    return at >= 0;
  });
  const words = [...q.matchAll(/\S+/g)]
    .filter((m) => !inPhrase.slice(m.index, m.index + m[0].length).includes(true))
    .map((m) => m[0]);
  return { phrases, words };
}

/**
 * True when every word of the query fits the tool: by text (spaces ignored, so "chat gpt" finds ChatGPT),
 * by an everyday category word or phrase ("그림" → 이미지 생성, "바이브 코딩" → 앱·웹 만들기),
 * or by "무료" for free and freemium tools.
 */
export function toolMatches(tool: AITool, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const fields = fieldsOf(tool);
  const whole = normalize(q);
  // Spaces are ignored only for names ("chat gpt" → ChatGPT); in descriptions "app that" must not match "ppt".
  if (normalize(tool.name).includes(whole) || fields.some((f) => f.includes(q))) return true;
  const { phrases, words } = termsOf(q);
  return (
    phrases.every((p) => fields.some((f) => f.includes(p)) || HINT_PHRASES.get(p)!.has(tool.category)) &&
    words.every((word) => {
      if (FREE_WORDS.includes(word)) return tool.price !== '유료';
      if (fields.some((f) => f.includes(word))) return true;
      return categoriesForQuery(word).has(tool.category);
    })
  );
}

/** Matching tools, best first: name start, name, tag, everyday category word, description. */
export function rankTools(tools: AITool[], query: string, limit = 5): AITool[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const whole = normalize(q);
  const intent = categoriesForQuery(q);
  return tools
    .filter((t) => toolMatches(t, q))
    .map((tool) => {
      const name = normalize(tool.name);
      let score = 0;
      if (name.startsWith(whole)) score += 100;
      else if (name.includes(whole)) score += 60;
      if ((tool.tags || []).some((t) => normalize(t).includes(whole))) score += 30;
      score += (intent.get(tool.category) || 0) * 15;
      if (normalize(tool.description).includes(whole)) score += 10;
      return { tool, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.tool);
}
