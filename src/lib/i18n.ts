import { Language, UI_TEXT, CATEGORY_TRANSLATIONS, PRICE_TRANSLATIONS, getCategoryLabel, getPriceLabel, getToolDescription } from './translations';

export type { Language };
export { UI_TEXT, CATEGORY_TRANSLATIONS, PRICE_TRANSLATIONS, getCategoryLabel, getPriceLabel, getToolDescription };

/**
 * Centralized translation utility function `t`
 * 
 * Usage:
 * t('header.title', lang) => "AI Hub"
 * t('results.totalTools', lang, 15) => "총 15개의 AI 도구" or "Total 15 AI tools"
 */
export function t(keyPath: string, lang: Language = 'ko', params?: any): string {
  if (!keyPath) return '';

  const keys = keyPath.split('.');
  let current: any = UI_TEXT;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return keyPath;
    }
  }

  if (current && typeof current === 'object') {
    if (typeof current[lang] === 'function') {
      return current[lang](params);
    }
    if (current[lang] !== undefined) {
      return current[lang];
    }
  }

  if (typeof current === 'string') return current;
  if (typeof current === 'function') return current(params);

  return keyPath;
}
