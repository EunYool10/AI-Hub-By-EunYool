// Weekly check of every tool's website (.github/workflows/link-check.yml).
// Prints a Markdown report of dead, parked or moved sites; exits 1 when there is something to fix.
// Run by hand: node --max-http-header-size=262144 scripts/check-links.mjs (some sites send very large headers)
import fs from 'node:fs';

const DATA = new URL('../src/data/aiToolsData.ts', import.meta.url);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const PARKING = /(this domain|the domain|domain name)[^<]{0,60}(is |may be )?for sale|buy this domain|domain parking|parked (free|domain)|hugedomains|sedoparking|afternic|dan\.com/i;

const tools = [];
for (const line of fs.readFileSync(DATA, 'utf8').split('\n')) {
  const m = line.match(/^\s*\{ id: (\d+), name: "([^"]+)".*?url: "([^"]+)"/);
  if (m) tools.push({ id: Number(m[1]), name: m[2], url: m[3] });
}

// example.co.kr → example.co.kr, app.example.com → example.com
function site(host) {
  const parts = host.replace(/^www\./, '').split('.');
  const second = /^(co|or|ne|go|ac|com|net|org)\.[a-z]{2}$/.test(parts.slice(-2).join('.'));
  return parts.slice(second ? -3 : -2).join('.');
}

async function load(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } });
    const body = res.ok ? (await res.text()).slice(0, 300000) : '';
    return { code: res.status, finalUrl: res.url, body };
  } catch (e) {
    return { code: 0, error: e.cause?.code || e.name };
  } finally {
    clearTimeout(timer);
  }
}

async function check(tool) {
  let r = await load(tool.url);
  // One retry for timeouts and server errors, which are often momentary.
  if (r.code === 0 || r.code >= 500) {
    await new Promise((ok) => setTimeout(ok, 5000));
    r = await load(tool.url);
  }
  if (r.error === 'UND_ERR_HEADERS_OVERFLOW') return { ...tool, kind: 'blocked', why: '응답 헤더가 너무 큼' };
  if (r.code === 0) return { ...tool, kind: 'dead', why: `연결 안 됨 (${r.error})` };
  if (r.code === 404 || r.code === 410) return { ...tool, kind: 'dead', why: `페이지 없음 (HTTP ${r.code})` };
  // Bot walls (Cloudflare and the like) answer automated requests this way; a person can still open the site.
  if ([401, 403, 429, 503].includes(r.code)) return { ...tool, kind: 'blocked', why: `HTTP ${r.code}` };
  if (r.code >= 400) return { ...tool, kind: 'dead', why: `오류 (HTTP ${r.code})` };
  const to = new URL(r.finalUrl);
  if (/\/lander\b/.test(to.pathname) || PARKING.test(r.body)) return { ...tool, kind: 'parked', why: `판매·주차 도메인으로 보임 (${to.host})` };
  if (site(to.host) !== site(new URL(tool.url).host)) return { ...tool, kind: 'moved', why: `다른 주소로 이동 → ${to.origin}${to.pathname === '/' ? '' : to.pathname}` };
  return { ...tool, kind: 'ok' };
}

const results = [];
for (let i = 0; i < tools.length; i += 8) results.push(...(await Promise.all(tools.slice(i, i + 8).map(check))));

const line = (r) => `- **${r.name}** (id ${r.id}) ${r.url} — ${r.why}`;
const pick = (kind) => results.filter((r) => r.kind === kind).sort((a, b) => a.id - b.id);
const problems = [...pick('dead'), ...pick('parked'), ...pick('moved')];
const blocked = pick('blocked');

const out = [`도구 ${results.length}개의 사이트를 확인했어요. 문제 ${problems.length}개, 자동 확인 불가 ${blocked.length}개.`, ''];
if (pick('dead').length) out.push('### 열리지 않음', ...pick('dead').map(line), '');
if (pick('parked').length) out.push('### 판매·주차 도메인 의심', ...pick('parked').map(line), '');
if (pick('moved').length) out.push('### 다른 사이트로 이동', '서비스 이름이나 주소가 바뀌었을 수 있어요. 새 주소가 맞으면 aiToolsData.ts의 url을 고쳐 주세요.', ...pick('moved').map(line), '');
if (blocked.length) {
  out.push('<details><summary>자동 확인 불가 (봇 차단, 사람이 열면 보통 정상)</summary>', '', ...blocked.map(line), '', '</details>', '');
}
console.log(out.join('\n'));
process.exitCode = problems.length ? 1 : 0;
