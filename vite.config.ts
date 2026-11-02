import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {INITIAL_AI_TOOLS} from './src/data/aiToolsData';
import {TOOL_LOGOS} from './src/data/toolLogos';

// Link previews (KakaoTalk, X, Slack) need absolute addresses, so they point at the GitHub Pages site.
const SITE_URL = process.env.VITE_SITE_URL || 'https://eunyool10.github.io/AI-Hub-By-EunYool/';
const SITE_DESCRIPTION = '분야별로 정리한 AI 도구를 검색하고 비교해 보세요. 도구마다 쓰임새와 가격, 비슷한 도구를 함께 보여 줘요.';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function previewTags(p: {title: string; description: string; url: string; image: string; large: boolean}): string {
  return [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="AI Hub" />`,
    `<meta property="og:locale" content="ko_KR" />`,
    `<meta property="og:title" content="${esc(p.title)}" />`,
    `<meta property="og:description" content="${esc(p.description)}" />`,
    `<meta property="og:url" content="${esc(p.url)}" />`,
    `<meta property="og:image" content="${esc(p.image)}" />`,
    `<meta name="twitter:card" content="${p.large ? 'summary_large_image' : 'summary'}" />`,
  ].join('\n    ');
}

// The tool's own icon when it is a PNG or JPEG big enough to preview, else the site image. Apps do not show
// SVG previews, so SVG logos use the PNG copy in public/logos/preview/ (scratchpad render-svg-previews.cjs).
function toolImage(url: string): string {
  const host = new URL(url).host.replace(/^www\./, '');
  const file = TOOL_LOGOS[host];
  if (file?.endsWith('.svg') && fs.existsSync(path.resolve(__dirname, 'public/logos/preview', `${host}.png`))) {
    return `${SITE_URL}logos/preview/${host}.png`;
  }
  if (file && /\.(png|jpe?g)$/.test(file)) {
    const buf = fs.readFileSync(path.resolve(__dirname, 'public/logos', file));
    const width = buf.readUInt32BE(0) === 0x89504e47 ? buf.readUInt32BE(16) : 200;
    if (width >= 100) return `${SITE_URL}logos/${file}`;
  }
  return `${SITE_URL}og-image.png`;
}

/**
 * Preview tags for the home page, plus a small page per tool at tool/<id>/ that shows that tool's name and
 * icon in link previews and forwards to its detail window (#tool=<id>). The share button links there.
 */
function sharePreviews(): Plugin {
  return {
    name: 'share-previews',
    transformIndexHtml: (html) =>
      html.replace(
        /<!-- share-previews:.*?-->/,
        previewTags({title: 'AI Hub — by Yool', description: SITE_DESCRIPTION, url: SITE_URL, image: `${SITE_URL}og-image.png`, large: true})
      ),
    generateBundle() {
      for (const tool of INITIAL_AI_TOOLS) {
        const target = `../../#tool=${tool.id}`;
        const title = `${tool.name} – AI Hub`;
        this.emitFile({
          type: 'asset',
          fileName: `tool/${tool.id}/index.html`,
          source: `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(tool.description)}" />
    <meta name="robots" content="noindex" />
    ${previewTags({title, description: tool.description, url: `${SITE_URL}tool/${tool.id}/`, image: toolImage(tool.url), large: false})}
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <a href="${target}">AI Hub에서 ${esc(tool.name)} 보기</a>
  </body>
</html>
`,
        });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    // GitHub Pages serves the site from /<repo>/, so that build passes VITE_BASE.
    base: process.env.VITE_BASE || '/',
    plugins: [react(), tailwindcss(), sharePreviews()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
