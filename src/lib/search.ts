import { AITool } from '../types';
import { getCategoryLabel } from './translations';

// Words people use for each category, e.g. "그림 그려주는 AI" should land on 디자인/이미지.
export const CATEGORY_HINTS: Record<string, string[]> = {
  '기획/글쓰기': ['글쓰기', '글 쓰', '작문', '문서', '보고서', '기획', '요약', '블로그', '에세이', '자소서', '이메일', '대화형', '챗봇', 'write', 'writing', 'essay', 'blog', 'summar', 'report', 'email', 'chatbot'],
  '디자인/이미지': ['이미지', '그림', '사진', '일러스트', '로고', '포스터', '썸네일', '그려', 'image', 'picture', 'photo', 'illustration', 'logo', 'drawing'],
  '디자인 생성': ['ui', 'ux', '화면 디자인', '프로토타입', '웹디자인', '앱 디자인', '피그마', 'figma', 'prototype', 'mockup', 'wireframe'],
  '영상/오디오': ['영상', '동영상', '비디오', '유튜브', '쇼츠', '편집', '자막', '음악', '작곡', '노래', 'video', 'youtube', 'music', 'subtitle', 'song'],
  '음성 변환(TTS/STT)': ['음성', '목소리', '보이스', '더빙', '받아쓰기', '녹음', '성우', 'tts', 'stt', 'voice', 'speech', 'transcri'],
  '번역/어학': ['번역', '영어', '일본어', '중국어', '외국어', '어학', '회화', 'translat', 'language', 'english'],
  '개발/데이터': ['코딩', '코드', '개발', '프로그래밍', '웹사이트', '홈페이지', '데이터', '파이썬', 'code', 'coding', 'programming', 'developer', 'website', 'python', 'data'],
  '코드 최적화': ['코드 리뷰', '버그', '디버그', '디버깅', '테스트', '리팩터', '최적화', 'review', 'bug', 'debug', 'test', 'refactor'],
  '생산성/협업': ['회의', '미팅', '노트', '메모', '일정', '협업', '업무', 'meeting', 'notes', 'productivity', 'schedule'],
  '마케팅/분석': ['마케팅', '광고', 'seo', '발표', 'ppt', '슬라이드', '프레젠테이션', '홍보', 'marketing', 'ads', 'presentation', 'slides'],
  '학술/리서치': ['논문', '연구', '리서치', '자료조사', '자료 조사', '학술', 'paper', 'research', 'academic', 'citation'],
  '3D/공간': ['3d', '모델링', '메타버스', '공간', 'modeling', 'metaverse'],
  '에이전트/자동화': ['자동화', '에이전트', '워크플로', '노코드', 'automation', 'agent', 'workflow', 'no-code', 'nocode'],
  '금융/투자': ['주식', '투자', '금융', '재테크', '코인', '경제', 'stock', 'invest', 'finance', 'crypto'],
  '교육/튜터': ['공부', '학습', '과외', '수학', '숙제', '시험', '튜터', 'study', 'learn', 'tutor', 'homework', 'math'],
  '비즈니스/법률': ['계약', '법률', '판례', '비즈니스', '창업', 'contract', 'legal', 'law', 'business', 'startup'],
};

const FREE_WORDS = ['무료', '공짜', 'free'];

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

/**
 * True when every word of the query fits the tool: by text (spaces ignored, so "chat gpt" finds ChatGPT),
 * by an everyday category word ("그림" → 디자인/이미지), or by "무료" for free and freemium tools.
 */
export function toolMatches(tool: AITool, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const fields = fieldsOf(tool);
  const whole = normalize(q);
  if (fields.some((f) => normalize(f).includes(whole))) return true;
  return q.split(/\s+/).every((word) => {
    if (FREE_WORDS.includes(word)) return tool.price !== '유료';
    if (fields.some((f) => f.includes(word))) return true;
    return categoriesForQuery(word).has(tool.category);
  });
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
