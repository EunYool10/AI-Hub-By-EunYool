/**
 * The GitHub Pages build has no API server (VITE_STATIC_SITE=1).
 * Sign-in, notices, the admin console and the Gemini chat are switched off there,
 * and the assistant answers from the local tool catalog instead.
 */
export const IS_STATIC_SITE = (import.meta as any).env?.VITE_STATIC_SITE === '1';
