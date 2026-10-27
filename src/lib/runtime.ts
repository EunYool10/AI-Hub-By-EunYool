/**
 * The GitHub Pages build has no API server (VITE_STATIC_SITE=1).
 * Sign-in, notices and inquiries go to Firebase (lib/firebase.ts), the server admin console and
 * Gemini chat are off, and the assistant answers from the local catalog and live diagnostics.
 */
export const IS_STATIC_SITE = (import.meta as any).env?.VITE_STATIC_SITE === '1';

/** Health/RTT probe: the API server's /api/ping, or a small file of the site itself on the static build. */
export const pingUrl = () =>
  IS_STATIC_SITE ? `${(import.meta as any).env.BASE_URL}favicon.svg?ping=${Date.now()}` : '/api/ping';
