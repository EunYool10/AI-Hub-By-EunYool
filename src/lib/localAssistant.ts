import { AITool } from '../types';
import { Language, getCategoryLabel, getPriceLabel, getToolDescription } from './translations';

/**
 * Catalog-only assistant used on the static site, where the Gemini chat server is not available.
 * It scores tools against the question and answers with the best matches as markdown.
 */

// Words people use for each category, e.g. "그림 그려주는 AI" should land on 디자인/이미지.
const CATEGORY_HINTS: Record<string, string[]> = {
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

const FREE_WORDS = ['무료', '공짜', '프리', 'free'];
const GREETING = /^(안녕|하이|헬로|ㅎㅇ|hi\b|hello|hey)/i;
const HELP = /(뭘 할 수|무엇을 할 수|사용법|도움말|help|what can you)/i;

// Trailing Korean particles and request endings, so "영상을" or "추천해줘" still match.
const KO_SUFFIX = /(으로|에서|해줘|해 줘|해주세요|하는|할|을|를|이|가|은|는|에|의|로|도|만|랑|와|과)$/;

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.]+/u)
    .map((t) => (t.length > 2 ? t.replace(KO_SUFFIX, '') : t))
    .filter((t) => t.length >= 2 && !['ai', '추천', '도구', '툴', 'tool', 'tools', '알려', '찾아', '좋은', '있어', 'recommend'].includes(t));
}

function matchedCategories(q: string): Map<string, number> {
  const hits = new Map<string, number>();
  for (const [category, words] of Object.entries(CATEGORY_HINTS)) {
    const count = words.filter((w) => q.includes(w)).length;
    if (count) hits.set(category, count);
  }
  return hits;
}

function scoreTool(tool: AITool, q: string, tokens: string[], categories: Map<string, number>, wantsFree: boolean): number {
  const name = tool.name.toLowerCase();
  const haystack = [tool.description, tool.descriptionEn, ...(tool.tags || []), ...(tool.keyFeatures || []), tool.useCases]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  // Ask about a tool by name ("Claude 어때?") → that tool first.
  const baseName = name.replace(/\s*\(.*\)\s*/g, '').trim();
  if (q.includes(baseName) || tokens.some((t) => t.length >= 3 && baseName.includes(t))) score += 20;
  score += (categories.get(tool.category) || 0) * 6;
  for (const t of tokens) if (haystack.includes(t)) score += 2;
  if (wantsFree) score += tool.price === '무료' ? 4 : tool.price === '유료' ? -6 : 1;
  return score;
}

function priceLabel(price: string, lang: Language): string {
  // Same wording as the price badges on the cards
  if (price === '무료/유료') return lang === 'ko' ? '부분 무료' : 'Freemium';
  return getPriceLabel(price, lang);
}

function toolLine(tool: AITool, index: number, lang: Language): string {
  const meta = `${getCategoryLabel(tool.category, lang)} · ${priceLabel(String(tool.price), lang)}`;
  return `${index + 1}. **[${tool.name}](${tool.url})** — ${meta}\n   ${getToolDescription(tool, lang)}`;
}

export function answerFromCatalog(query: string, tools: AITool[], lang: Language): string {
  const isKo = lang === 'ko';
  const q = query.toLowerCase().trim();
  const note = isKo
    ? '_지금은 사이트에 정리된 도구 목록에서 찾아 드리는 간단 추천 모드예요._'
    : '_This assistant searches the tool list on this site._';

  if (GREETING.test(q) || HELP.test(q)) {
    return isKo
      ? `안녕하세요! 하고 싶은 작업을 알려 주시면 맞는 AI 도구를 골라 드릴게요.\n\n예: **"유튜브 영상 편집"**, **"무료 이미지 생성"**, **"논문 요약"**, **"코딩 도와주는 AI"**\n\n${note}`
      : `Hi! Tell me what you want to do and I'll pick matching AI tools.\n\nTry: **"edit YouTube videos"**, **"free image generator"**, **"summarize papers"**, **"coding assistant"**\n\n${note}`;
  }

  const tokens = tokenize(q);
  const categories = matchedCategories(q);
  const wantsFree = FREE_WORDS.some((w) => q.includes(w));

  const ranked = tools
    .map((tool) => ({ tool, score: scoreTool(tool, q, tokens, categories, wantsFree) }))
    .filter((r) => r.score > 2)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return isKo
      ? `"${query}"에 딱 맞는 도구를 찾지 못했어요. **이미지 만들기**, **영상 편집**, **번역**, **코딩**처럼 하고 싶은 작업을 적어 주시면 더 잘 찾아 드려요.\n\n${note}`
      : `I couldn't find a tool for "${query}". Describe the task, like **image generation**, **video editing**, **translation** or **coding**.\n\n${note}`;
  }

  const top = ranked.slice(0, 5).map((r) => r.tool);
  // Point to the category most of the picks come from, if the question named one.
  const picksPerCategory = new Map<string, number>();
  for (const tool of top) {
    if (categories.has(tool.category)) picksPerCategory.set(tool.category, (picksPerCategory.get(tool.category) || 0) + 1);
  }
  const topCategory = [...picksPerCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const intro = isKo
    ? `**${query}**에 어울리는 AI 도구예요.${wantsFree ? ' 무료로 쓸 수 있는 도구를 앞에 두었어요.' : ''}`
    : `Here are AI tools for **${query}**.${wantsFree ? ' Free ones come first.' : ''}`;
  const more = topCategory
    ? isKo
      ? `\n\n더 보고 싶다면 왼쪽 카테고리에서 **${getCategoryLabel(topCategory, lang)}**을(를) 눌러 보세요.`
      : `\n\nFor more, open the **${getCategoryLabel(topCategory, lang)}** category.`
    : '';

  return `${intro}\n\n${top.map((tool, i) => toolLine(tool, i, lang)).join('\n')}${more}`;
}
