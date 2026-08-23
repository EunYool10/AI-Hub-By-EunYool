/**
 * Developer & Admin Session In-Memory Debug Logger
 * Securely tracks client/server interactions, response latencies, and execution events.
 * Automatically masks any sensitive tokens, secrets, or API keys.
 */

export interface DevLogEntry {
  id: string;
  timestamp: string;
  timeString: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'DEBUG';
  category: 'CHAT' | 'API' | 'SYSTEM' | 'COMMAND' | 'TOOL' | 'AUTH';
  message: string;
  responseTimeMs?: number;
  details?: string;
}

const MAX_LOG_ENTRIES = 100;
const devLogsBuffer: DevLogEntry[] = [];

/**
 * Regex patterns to mask sensitive tokens, passwords, and API keys.
 */
const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{8,}/gi,
  /AIzaSy[a-zA-Z0-9_-]{20,}/gi,
  /token-[a-zA-Z0-9_-]{8,}/gi,
  /bearer\s+[a-zA-Z0-9_.-]{10,}/gi,
  /password\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /secret\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /key\s*[:=]\s*["']?[^"'\s]+["']?/gi,
];

export function maskSensitiveData(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let sanitized = input;

  // Mask OpenAI/Claude/Google style keys
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9_-]{4,}/g, (match) => {
    return `sk-${match.slice(3, 7)}****`;
  });

  sanitized = sanitized.replace(/AIzaSy[a-zA-Z0-9_-]{10,}/g, 'AIzaSy********');
  sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9_.-]{10,}/gi, 'Bearer token-********');
  sanitized = sanitized.replace(/token-[a-zA-Z0-9_-]{4,}/g, 'token-********');

  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      if (match.toLowerCase().startsWith('password')) return 'password: ********';
      if (match.toLowerCase().startsWith('secret')) return 'secret: ********';
      return '********';
    });
  }

  return sanitized;
}

function getFormattedTime(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function logDevEvent(
  level: DevLogEntry['level'],
  category: DevLogEntry['category'],
  message: string,
  meta?: { responseTimeMs?: number; details?: string }
): DevLogEntry {
  const entry: DevLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    timeString: getFormattedTime(),
    level,
    category,
    message: maskSensitiveData(message),
    responseTimeMs: meta?.responseTimeMs,
    details: meta?.details ? maskSensitiveData(meta.details) : undefined,
  };

  devLogsBuffer.unshift(entry);
  if (devLogsBuffer.length > MAX_LOG_ENTRIES) {
    devLogsBuffer.length = MAX_LOG_ENTRIES;
  }

  return entry;
}

export function getDevLogs(): DevLogEntry[] {
  return [...devLogsBuffer];
}

export function clearDevLogs(): void {
  devLogsBuffer.length = 0;
  logDevEvent('INFO', 'SYSTEM', 'Developer session logs cleared by administrator.');
}

export function formatDevLogsForDisplay(limit = 15): string {
  if (devLogsBuffer.length === 0) {
    return '현재 세션에 기록된 디버그 로그가 없습니다.';
  }

  const slice = devLogsBuffer.slice(0, limit);
  const lines = slice.map((log) => {
    let prefix = `[${log.timeString}]`;
    let body = log.message;
    if (log.responseTimeMs !== undefined) {
      body += ` (Response time: ${log.responseTimeMs}ms)`;
    }
    if (log.details) {
      body += ` - ${log.details}`;
    }
    return `${prefix} [${log.level}] [${log.category}] ${body}`;
  });

  return lines.join('\n');
}

// Initial bootstrap logs
logDevEvent('INFO', 'SYSTEM', 'AI Hub Developer diagnostic subsystem initialized');
logDevEvent('INFO', 'AUTH', 'Auth session storage initialized and listening for events');
logDevEvent('INFO', 'CHAT', 'Gemini AI assistant pipeline ready (gemini-3.6-flash)');
