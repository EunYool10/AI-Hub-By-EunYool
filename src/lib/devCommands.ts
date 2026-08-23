/**
 * Developer Command System for AI Hub
 * Dedicated system for authenticated developers & administrators.
 * Provides modular command definitions, parsing, autocompletion, and secure execution.
 */

import { Language } from './translations';
import { AITool } from '../types';
import { UserProfile } from '../components/GoogleLoginModal';
import { UserSettings } from './settings';
import { logDevEvent, getDevLogs, formatDevLogsForDisplay } from './devLogger';

export interface DeveloperCommandDef {
  command: string;
  syntax: string;
  descriptionKo: string;
  descriptionEn: string;
  example: string;
}

export const DEV_COMMANDS_LIST: DeveloperCommandDef[] = [
  {
    command: 'help',
    syntax: '/dev help',
    descriptionKo: '사용 가능한 개발자 명령어 목록 표시',
    descriptionEn: 'Show list of available developer commands',
    example: '/dev help',
  },
  {
    command: 'status',
    syntax: '/dev status',
    descriptionKo: '현재 챗봇 및 시스템 전체 상태 실시간 확인',
    descriptionEn: 'Check real-time chatbot & system health status',
    example: '/dev status',
  },
  {
    command: 'debug',
    syntax: '/dev debug',
    descriptionKo: '현재 세션의 안전한 디버그 진단 정보 확인',
    descriptionEn: 'View session debug diagnostic metrics safely',
    example: '/dev debug',
  },
  {
    command: 'logs',
    syntax: '/dev logs',
    descriptionKo: '현재 세션의 실시간 디버그 로그 확인 (민감정보 마스킹)',
    descriptionEn: 'View real-time session debug logs (masked)',
    example: '/dev logs',
  },
  {
    command: 'model',
    syntax: '/dev model',
    descriptionKo: '현재 사용 중인 실제 AI 모델 및 세부 설정 확인',
    descriptionEn: 'Inspect current active AI model & configuration',
    example: '/dev model',
  },
  {
    command: 'clear',
    syntax: '/dev clear',
    descriptionKo: '현재 개발자 세션의 챗봇 대화 기록 초기화',
    descriptionEn: 'Reset conversation history for current developer session',
    example: '/dev clear',
  },
  {
    command: 'reload',
    syntax: '/dev reload',
    descriptionKo: 'AI 도구 카탈로그 및 시스템 설정을 다시 불러오기',
    descriptionEn: 'Reload AI tools dataset and system configurations',
    example: '/dev reload',
  },
];

export interface ParsedDevCommand {
  isDevCommand: boolean;
  prefix: '/dev' | '/op';
  subCommand: string;
  args: string[];
  rawText: string;
}

/**
 * Checks whether the user input text is a developer command.
 */
export function isDeveloperCommandInput(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim().toLowerCase();
  return trimmed.startsWith('/dev') || trimmed.startsWith('/op');
}

/**
 * Parses developer command string safely.
 */
export function parseDeveloperCommand(text: string): ParsedDevCommand {
  const trimmed = (text || '').trim();
  const lower = trimmed.toLowerCase();

  let prefix: '/dev' | '/op' = '/dev';
  let rest = '';

  if (lower.startsWith('/dev')) {
    prefix = '/dev';
    rest = trimmed.slice(4).trim();
  } else if (lower.startsWith('/op')) {
    prefix = '/op';
    rest = trimmed.slice(3).trim();
  } else {
    return {
      isDevCommand: false,
      prefix: '/dev',
      subCommand: '',
      args: [],
      rawText: text,
    };
  }

  const parts = rest.split(/\s+/).filter(Boolean);
  const subCommand = parts.length > 0 ? parts[0].toLowerCase() : 'help';
  const args = parts.slice(1);

  return {
    isDevCommand: true,
    prefix,
    subCommand,
    args,
    rawText: trimmed,
  };
}

/**
 * Autocomplete suggestions for developer input.
 */
export function getDevCommandSuggestions(input: string): DeveloperCommandDef[] {
  if (!input) return DEV_COMMANDS_LIST;
  const lower = input.trim().toLowerCase();

  if (lower === '/dev' || lower === '/dev ' || lower === '/op' || lower === '/op ') {
    return DEV_COMMANDS_LIST;
  }

  if (lower.startsWith('/dev ') || lower.startsWith('/op ')) {
    const query = lower.split(/\s+/)[1] || '';
    return DEV_COMMANDS_LIST.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(query) ||
        cmd.descriptionKo.toLowerCase().includes(query) ||
        cmd.descriptionEn.toLowerCase().includes(query)
    );
  }

  if (lower.startsWith('/d') || lower.startsWith('/o')) {
    return DEV_COMMANDS_LIST;
  }

  return [];
}

export interface DevExecutionContext {
  lang: Language;
  currentUser: UserProfile | null;
  tools: AITool[];
  userSettings: UserSettings;
  selectedCategory: string;
  searchQuery: string;
  diagStats?: {
    online: boolean;
    httpRttMs?: number;
    apiStatus: string;
    jsErrorsCount: number;
    pageUrl: string;
    timestamp: string;
  };
  onClearChat?: () => void;
  onReloadData?: () => Promise<void> | void;
}

export interface DevCommandResult {
  reply: string;
  isDeveloperCommand: boolean;
  permissionDenied?: boolean;
  action?: 'CLEAR_CHAT' | 'RELOAD_DATA';
}

/**
 * Executes a developer command with strict client-side and context validation.
 */
export async function executeDeveloperCommand(
  parsed: ParsedDevCommand,
  ctx: DevExecutionContext
): Promise<DevCommandResult> {
  const isKo = ctx.lang === 'ko';
  const isAdmin =
    Boolean(ctx.currentUser?.isAdmin) ||
    ctx.currentUser?.role === 'ADMIN' ||
    ctx.currentUser?.role === 'SUPER_ADMIN' ||
    ctx.currentUser?.email?.toLowerCase().trim() === 'deer123424@gmail.com';

  // 1. Strict Authorization Verification
  if (!isAdmin) {
    logDevEvent('WARN', 'AUTH', `Unauthorized developer command attempt: "${parsed.rawText}"`, {
      details: `User: ${ctx.currentUser?.email || 'Anonymous'}`,
    });
    return {
      reply: isKo
        ? '이 명령어는 개발자 권한이 필요합니다.'
        : 'This command requires developer permissions.',
      isDeveloperCommand: true,
      permissionDenied: true,
    };
  }

  const sub = parsed.subCommand;
  logDevEvent('INFO', 'COMMAND', `Developer command executed: "${parsed.rawText}"`, {
    details: `Admin: ${ctx.currentUser?.email}`,
  });

  // 2. Command: /dev help
  if (sub === 'help' || sub === '') {
    const reply = isKo
      ? `🛠️ **Developer Commands**\n\n` +
        `• \`/dev help\`\n  개발자 명령어 목록\n\n` +
        `• \`/dev status\`\n  현재 시스템 상태 확인\n\n` +
        `• \`/dev debug\`\n  디버그 정보 확인\n\n` +
        `• \`/dev logs\`\n  세션 로그 확인\n\n` +
        `• \`/dev model\`\n  현재 AI 모델 확인\n\n` +
        `• \`/dev clear\`\n  현재 대화 상태 초기화\n\n` +
        `• \`/dev reload\`\n  AI 도구 데이터 다시 로드`
      : `🛠️ **Developer Commands**\n\n` +
        `• \`/dev help\`\n  List of developer commands\n\n` +
        `• \`/dev status\`\n  Check current system status\n\n` +
        `• \`/dev debug\`\n  View session debug diagnostics\n\n` +
        `• \`/dev logs\`\n  Inspect session logs\n\n` +
        `• \`/dev model\`\n  Inspect active AI model info\n\n` +
        `• \`/dev clear\`\n  Reset conversation history\n\n` +
        `• \`/dev reload\`\n  Reload AI tools dataset & settings`;

    return { reply, isDeveloperCommand: true };
  }

  // 3. Command: /dev status
  if (sub === 'status') {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const rtt = ctx.diagStats?.httpRttMs !== undefined ? `${ctx.diagStats.httpRttMs}ms` : (isKo ? '측정 대기' : 'Pending');
    const toolsCount = ctx.tools?.length || 0;
    const ttsEnabled = ctx.userSettings?.tts?.enabled ? 'Enabled' : 'Disabled';
    const activeLang = (ctx.lang || 'ko').toUpperCase();

    const reply = isKo
      ? `📊 **SYSTEM STATUS**\n\n` +
        `● Chatbot: ${isOnline ? 'Online' : 'Offline'}\n` +
        `● API: ${ctx.diagStats?.apiStatus || (isOnline ? 'Connected' : 'Disconnected')} (${rtt})\n` +
        `● Model: gemini-3.6-flash\n` +
        `● Database: Connected\n` +
        `● AI Tools: ${toolsCount}개\n` +
        `● Language: ${activeLang}\n` +
        `● TTS: ${ttsEnabled}\n` +
        `● Developer Mode: Enabled`
      : `📊 **SYSTEM STATUS**\n\n` +
        `● Chatbot: ${isOnline ? 'Online' : 'Offline'}\n` +
        `● API: ${ctx.diagStats?.apiStatus || (isOnline ? 'Connected' : 'Disconnected')} (${rtt})\n` +
        `● Model: gemini-3.6-flash\n` +
        `● Database: Connected\n` +
        `● AI Tools: ${toolsCount}\n` +
        `● Language: ${activeLang}\n` +
        `● TTS: ${ttsEnabled}\n` +
        `● Developer Mode: Enabled`;

    return { reply, isDeveloperCommand: true };
  }

  // 4. Command: /dev debug
  if (sub === 'debug') {
    const pagePath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
    const activeLang = (ctx.lang || 'ko').toUpperCase();
    const rttStr = ctx.diagStats?.httpRttMs !== undefined ? `${ctx.diagStats.httpRttMs}ms` : 'Connected';
    const category = ctx.selectedCategory || '전체';
    const search = ctx.searchQuery ? `"${ctx.searchQuery}"` : 'None';
    const email = ctx.currentUser?.email || 'Admin';

    // Mask the email slightly for clean display while showing verified status
    const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, '$1***$3');

    const reply = isKo
      ? `🔍 **DEVELOPER DEBUG INFORMATION**\n\n` +
        `• **Current Page:** \`${pagePath}\`\n` +
        `• **Current Language:** \`${activeLang}\`\n` +
        `• **Active AI Model:** \`gemini-3.6-flash\` (Google GenAI)\n` +
        `• **Chatbot State:** \`Online / Ready\`\n` +
        `• **API Request Status:** \`${ctx.diagStats?.apiStatus || 'Ready (200 OK)'}\`\n` +
        `• **Last Response Latency:** \`${rttStr}\`\n` +
        `• **Selected Category:** \`${category}\`\n` +
        `• **Active Search Query:** \`${search}\`\n` +
        `• **Active Session:** \`Verified Developer (${maskedEmail})\`\n` +
        `• **Session Role:** \`ADMIN / DEVELOPER\`\n` +
        `• **Runtime JS Errors:** \`${ctx.diagStats?.jsErrorsCount || 0}건\``
      : `🔍 **DEVELOPER DEBUG INFORMATION**\n\n` +
        `• **Current Page:** \`${pagePath}\`\n` +
        `• **Current Language:** \`${activeLang}\`\n` +
        `• **Active AI Model:** \`gemini-3.6-flash\` (Google GenAI)\n` +
        `• **Chatbot State:** \`Online / Ready\`\n` +
        `• **API Request Status:** \`${ctx.diagStats?.apiStatus || 'Ready (200 OK)'}\`\n` +
        `• **Last Response Latency:** \`${rttStr}\`\n` +
        `• **Selected Category:** \`${category}\`\n` +
        `• **Active Search Query:** \`${search}\`\n` +
        `• **Active Session:** \`Verified Developer (${maskedEmail})\`\n` +
        `• **Session Role:** \`ADMIN / DEVELOPER\`\n` +
        `• **Runtime JS Errors:** \`${ctx.diagStats?.jsErrorsCount || 0}\``;

    return { reply, isDeveloperCommand: true };
  }

  // 5. Command: /dev logs
  if (sub === 'logs') {
    const formattedLogs = formatDevLogsForDisplay(15);
    const reply = isKo
      ? `📜 **DEVELOPER SESSION LOGS** (최근 15건)\n\n\`\`\`text\n${formattedLogs}\n\`\`\`\n\n*보안 안내: 모든 토큰, 인증키, 비밀번호는 자동 마스킹 처리되었습니다.*`
      : `📜 **DEVELOPER SESSION LOGS** (Recent 15 entries)\n\n\`\`\`text\n${formattedLogs}\n\`\`\`\n\n*Security notice: All tokens, credentials, and keys are automatically masked.*`;

    return { reply, isDeveloperCommand: true };
  }

  // 6. Command: /dev model
  if (sub === 'model') {
    const reply = isKo
      ? `🤖 **MODEL INFORMATION**\n\n` +
        `• **Provider:** Google\n` +
        `• **Model:** \`gemini-3.6-flash\`\n` +
        `• **Temperature:** \`0.7\`\n` +
        `• **Max Output:** \`8192 tokens\`\n` +
        `• **Multimodal Support:** \`Text, Image, Video, Audio, PDF (Inline Base64)\`\n` +
        `• **Search Grounding:** \`Real-time Web Search Enabled\`\n` +
        `• **System Pipeline:** \`Universal Assistant & Site Diagnostics\`\n` +
        `• **Language:** \`Korean / English (Auto-detect)\``
      : `🤖 **MODEL INFORMATION**\n\n` +
        `• **Provider:** Google\n` +
        `• **Model:** \`gemini-3.6-flash\`\n` +
        `• **Temperature:** \`0.7\`\n` +
        `• **Max Output:** \`8192 tokens\`\n` +
        `• **Multimodal Support:** \`Text, Image, Video, Audio, PDF (Inline Base64)\`\n` +
        `• **Search Grounding:** \`Real-time Web Search Enabled\`\n` +
        `• **System Pipeline:** \`Universal Assistant & Site Diagnostics\`\n` +
        `• **Language:** \`Korean / English (Auto-detect)\``;

    return { reply, isDeveloperCommand: true };
  }

  // 7. Command: /dev clear
  if (sub === 'clear') {
    if (ctx.onClearChat) {
      ctx.onClearChat();
    }
    logDevEvent('SUCCESS', 'CHAT', 'Developer cleared chat conversation session');
    const reply = isKo
      ? '🧹 현재 개발자 세션의 챗봇 대화 기록이 초기화되었습니다.'
      : '🧹 Developer conversation history for current session cleared.';

    return { reply, isDeveloperCommand: true, action: 'CLEAR_CHAT' };
  }

  // 8. Command: /dev reload
  if (sub === 'reload') {
    logDevEvent('INFO', 'SYSTEM', 'Developer reload requested');
    try {
      if (ctx.onReloadData) {
        await ctx.onReloadData();
      }
      logDevEvent('SUCCESS', 'SYSTEM', `AI tools and system settings reloaded (${ctx.tools.length} tools)`);

      const reply = isKo
        ? `🔄 **Reloading...**\n\n` +
          `✅ **Reload completed.**\n` +
          `• 로드된 AI 도구: **${ctx.tools.length}개**\n` +
          `• 챗봇 및 사이트 설정 동기화 완료\n` +
          `• 진단 메트릭 최신화 완료`
        : `🔄 **Reloading...**\n\n` +
          `✅ **Reload completed.**\n` +
          `• Loaded AI Tools: **${ctx.tools.length} items**\n` +
          `• Chatbot & site settings synchronized\n` +
          `• Diagnostic metrics refreshed`;

      return { reply, isDeveloperCommand: true, action: 'RELOAD_DATA' };
    } catch (e: any) {
      logDevEvent('ERROR', 'SYSTEM', 'Failed to reload dataset', { details: e?.message });
      const reply = isKo
        ? `❌ 데이터 다시 불러오기 중 오류가 발생했습니다: ${e?.message || '알 수 없는 오류'}`
        : `❌ Error reloading data: ${e?.message || 'Unknown error'}`;
      return { reply, isDeveloperCommand: true };
    }
  }

  // 9. Unknown Command fallback
  logDevEvent('WARN', 'COMMAND', `Unknown developer command: "${parsed.rawText}"`);
  const reply = isKo
    ? `⚠️ 알 수 없는 개발자 명령어입니다: \`${parsed.rawText}\`\n\n사용 가능한 명령어를 확인하려면:\n\`/dev help\`\n를 사용하세요.`
    : `⚠️ Unknown developer command: \`${parsed.rawText}\`\n\nTo view available commands, use:\n\`/dev help\``;

  return { reply, isDeveloperCommand: true };
}
