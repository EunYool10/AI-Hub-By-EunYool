import { AITool } from '../types';
import { Language, getCategoryLabel, getPriceLabel, getToolDescription } from './translations';
import { categoriesForQuery } from './search';

/**
 * Catalog-only assistant used on the static site, where the Gemini chat server is not available.
 * It scores tools against the question and answers with the best matches as markdown.
 */

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
  const categories = categoriesForQuery(q);
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
