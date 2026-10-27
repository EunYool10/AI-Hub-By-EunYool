/**
 * Official Brand Asset Registry
 *
 * Provides verified official brand asset URLs from official open-source brand kits (Simple Icons)
 * and verified high-resolution domain favicon endpoints.
 *
 * NO synthetic/hand-drawn fake SVGs are generated.
 */

export interface OfficialBrandInfo {
  slug?: string;
  officialLogoUrl?: string;
  domain: string;
}

// Verified mapping for AI services to their official brand asset endpoints
export const OFFICIAL_BRAND_REGISTRY: Record<string, { slug?: string; officialUrl?: string; domain: string }> = {
  // 1. Core LLM & Assistants
  'chatgpt': { slug: 'openai', domain: 'chatgpt.com' },
  'openai': { slug: 'openai', domain: 'openai.com' },
  'claude': { slug: 'anthropic', domain: 'claude.ai' },
  'anthropic': { slug: 'anthropic', domain: 'anthropic.com' },
  'gemini': { slug: 'googlegemini', domain: 'gemini.google.com' },
  'wrtn': { domain: 'wrtn.ai' },
  'grok': { slug: 'x', domain: 'x.com' },
  'kimi': { domain: 'kimi.moonshot.cn' },
  'kimi chat': { domain: 'kimi.moonshot.cn' },
  'perplexity': { slug: 'perplexity', domain: 'perplexity.ai' },
  'perplexity pages': { slug: 'perplexity', domain: 'perplexity.ai' },
  'deepseek': { slug: 'deepseek', domain: 'deepseek.com' },
  'mistral': { slug: 'mistral', domain: 'mistral.ai' },
  'mistral ai': { slug: 'mistral', domain: 'mistral.ai' },
  'hyperclova': { domain: 'clova-x.naver.com' },
  'hyperclova x': { domain: 'clova-x.naver.com' },
  'jasper': { domain: 'jasper.ai' },
  'jasper ai': { domain: 'jasper.ai' },
  'copy.ai': { domain: 'copy.ai' },
  'typewriter ai': { domain: 'typewriter.ai' },

  // 2. Design & Image Generation
  'midjourney': { slug: 'midjourney', domain: 'midjourney.com' },
  'adobe firefly': { slug: 'adobe', domain: 'adobe.com' },
  'adobe': { slug: 'adobe', domain: 'adobe.com' },
  'ideogram': { domain: 'ideogram.ai' },
  'figma': { slug: 'figma', domain: 'figma.com' },
  'figma ai': { slug: 'figma', domain: 'figma.com' },
  'dall·e 3': { slug: 'openai', domain: 'openai.com' },
  'dall-e 3': { slug: 'openai', domain: 'openai.com' },
  'canva': { slug: 'canva', domain: 'canva.com' },
  'canva ai': { slug: 'canva', domain: 'canva.com' },
  'leonardo': { domain: 'leonardo.ai' },
  'leonardo ai': { domain: 'leonardo.ai' },
  'stable diffusion': { slug: 'stabilityai', domain: 'stability.ai' },
  'kling ai': { domain: 'klingai.com' },
  'recraft ai': { domain: 'recraft.ai' },
  'flux': { domain: 'blackforestlabs.ai' },
  'galileo ai': { domain: 'usegalileo.ai' },
  'uizard': { domain: 'uizard.io' },
  'krea ai': { domain: 'krea.ai' },
  'visual electric': { domain: 'visualelectric.com' },

  // 3. Video & Audio
  'sora': { slug: 'openai', domain: 'openai.com' },
  'runway': { domain: 'runwayml.com' },
  'runway gen-3': { domain: 'runwayml.com' },
  'synthesia': { domain: 'synthesia.io' },
  'vrew': { domain: 'vrew.voyagerx.com' },
  'vrew (브루)': { domain: 'vrew.voyagerx.com' },
  'elevenlabs': { slug: 'elevenlabs', domain: 'elevenlabs.io' },
  'suno': { slug: 'suno', domain: 'suno.com' },
  'suno ai': { slug: 'suno', domain: 'suno.com' },
  'viggle.ai': { domain: 'viggle.ai' },
  'typecast': { domain: 'typecast.ai' },
  'udio': { domain: 'udio.com' },
  'heygen': { domain: 'heygen.com' },
  'captions ai': { domain: 'captions.ai' },
  'luma dream machine': { domain: 'lumalabs.ai' },
  'pika labs': { domain: 'pika.art' },
  'adobe podcast ai': { slug: 'adobe', domain: 'podcast.adobe.com' },
  'mureka ai': { domain: 'mureka.ai' },

  // 4. Voice & Speech
  'whisper ai': { slug: 'openai', domain: 'openai.com' },
  'whisper ai (openai)': { slug: 'openai', domain: 'openai.com' },
  'speechify': { domain: 'speechify.com' },
  'play.ht': { domain: 'play.ht' },
  'openvoice': { domain: 'myshell.ai' },

  // 5. Translation & Language
  'deepl': { slug: 'deepl', domain: 'deepl.com' },
  'papago': { domain: 'papago.naver.com' },
  'speak ai': { domain: 'speak.com' },
  'duolingo': { slug: 'duolingo', domain: 'duolingo.com' },
  'duolingo max': { slug: 'duolingo', domain: 'duolingo.com' },
  'elsa speak': { domain: 'elsaspeak.com' },

  // 6. Development & Code
  'cursor': { domain: 'cursor.com' },
  'lovable': { domain: 'lovable.dev' },
  'v0': { slug: 'v0', domain: 'v0.dev' },
  'v0 by vercel': { slug: 'v0', domain: 'v0.dev' },
  'github copilot': { slug: 'githubcopilot', domain: 'github.com' },
  'phind': { domain: 'phind.com' },
  'bolt.new': { domain: 'bolt.new' },
  'windsurf': { domain: 'windsurf.com' },
  'replit': { slug: 'replit', domain: 'replit.com' },
  'replit ai': { slug: 'replit', domain: 'replit.com' },
  'tabnine': { domain: 'tabnine.com' },
  'claude code': { slug: 'anthropic', domain: 'claude.ai' },
  'pieces for developers': { domain: 'pieces.app' },
  'warp ai': { domain: 'warp.dev' },
  'coderabbit': { domain: 'coderabbit.ai' },
  'qodo (codiumai)': { domain: 'qodo.ai' },
  'sonarqube ai': { slug: 'sonarsource', domain: 'sonarsource.com' },
  'bito ai': { domain: 'bito.ai' },

  // 7. Productivity & Workspace
  'notion': { slug: 'notion', domain: 'notion.so' },
  'notion ai': { slug: 'notion', domain: 'notion.so' },
  'granola': { domain: 'granola.ai' },
  'wispr flow': { domain: 'play.wispr.ai' },
  'heptabase': { domain: 'heptabase.com' },
  'chatpdf': { domain: 'chatpdf.com' },
  'miro': { slug: 'miro', domain: 'miro.com' },
  'miro assist': { slug: 'miro', domain: 'miro.com' },
  'mem ai': { domain: 'mem.ai' },
  'otter.ai': { domain: 'otter.ai' },
  'taskade ai': { domain: 'taskade.com' },
  'napkin ai': { domain: 'napkin.ai' },
  'tana ai': { domain: 'tana.inc' },
  'fireflies.ai': { domain: 'fireflies.ai' },

  // 8. Marketing & Analytics
  'gamma': { domain: 'gamma.app' },
  'glean': { domain: 'glean.com' },
  'julius ai': { domain: 'julius.ai' },
  'beautiful.ai': { domain: 'beautiful.ai' },
  'anysummary': { domain: 'anysummary.app' },
  'adcreative.ai': { domain: 'adcreative.ai' },
  'surfer seo': { domain: 'surferseo.com' },
  'descript': { slug: 'descript', domain: 'descript.com' },
  'synthflow ai': { domain: 'synthflow.ai' },
  'semrush ai': { slug: 'semrush', domain: 'semrush.com' },
  'murf ai': { domain: 'murf.ai' },

  // 9. Research & Academia
  'notebooklm': { domain: 'notebooklm.google' },
  'elicit': { domain: 'elicit.com' },
  'consensus': { domain: 'consensus.app' },
  'scite ai': { domain: 'scite.ai' },
  'genspark': { domain: 'genspark.ai' },

  // 10. 3D & Spatial
  'meshy': { domain: 'meshy.ai' },
  'tripo 3d': { domain: 'tripo3d.ai' },
  'luma genie': { domain: 'lumalabs.ai' },
  'csm (common sense machines)': { domain: 'csm.ai' },

  // 11. Agents & Automation
  'manus / devin': { domain: 'manus.im' },
  'n8n / make': { slug: 'n8n', domain: 'n8n.io' },
  'operator by openai': { slug: 'openai', domain: 'openai.com' },
  'autogpt': { domain: 'agpt.co' },

  // 12. Finance, Education, Legal
  'finchat.io': { domain: 'finchat.io' },
  'alphasense': { domain: 'alpha-sense.com' },
  'kavout ai': { domain: 'kavout.com' },
  'bloomberggpt': { slug: 'bloomberg', domain: 'bloomberg.com' },
  'khanmigo': { slug: 'khanacademy', domain: 'khanacademy.org' },
  'socratic by google': { domain: 'socratic.org' },
  'synthesis tutor': { domain: 'synthesis.is' },
  'harvey ai': { domain: 'harvey.ai' },
  'casetext cocounsel': { domain: 'casetext.com' },
  'spellbook': { domain: 'spellbook.legal' },
};

/**
 * Returns clean domain string from URL or tool info
 */
export function extractDomain(urlStr?: string): string {
  if (!urlStr) return '';
  try {
    const formatted = urlStr.startsWith('http://') || urlStr.startsWith('https://')
      ? urlStr
      : `https://${urlStr}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Returns prioritized official brand image URLs for a tool.
 * Pipeline:
 * 1. Simple Icons Official Vector (if available)
 * 2. Official High-Res Website Favicon (Google S2 128px)
 * 3. Secondary Official Favicon (DuckDuckGo ICO)
 */
export function getOfficialLogoSources(name: string, url?: string, customLogoUrl?: string): string[] {
  const sources: string[] = [];

  if (customLogoUrl && customLogoUrl.trim()) {
    sources.push(customLogoUrl.trim());
  }

  const cleanName = (name || '').toLowerCase().trim();
  const regEntry = OFFICIAL_BRAND_REGISTRY[cleanName];

  // 1. Simple Icons official SVG vector CDN (official brand color; logos sit on a white tile)
  if (regEntry?.slug) {
    sources.push(`https://cdn.simpleicons.org/${regEntry.slug}`);
  }

  // 2. High-res official website favicon from domain
  const domain = regEntry?.domain || extractDomain(url);
  if (domain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
    sources.push(`https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`);
  }

  return sources;
}
