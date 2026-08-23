import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  Server,
  Bug,
  RefreshCw,
  X,
  Copy,
  Check,
  Globe,
  Clock,
  Gauge,
  Monitor,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

export interface JSLogEntry {
  type: string;
  message: string;
  source?: string;
  lineno?: number;
  timestamp: string;
}

export interface AdminDiagnosticStats {
  online: boolean;
  httpRttMs?: number;
  apiStatus: string;
  jsErrorsCount: number;
  recentJsErrors: JSLogEntry[];
  pageUrl: string;
  timestamp: string;
  browserInfo?: string;
  viewport?: string;
  language?: string;
  timeZone?: string;
  performanceTiming?: {
    dnsTimeMs?: number;
    connectTimeMs?: number;
    responseStartMs?: number;
    domContentLoadedMs?: number;
    loadEventMs?: number;
  };
}

interface AdminStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ko' | 'en';
  stats?: AdminDiagnosticStats;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminStatusPanel: React.FC<AdminStatusPanelProps> = ({
  isOpen,
  onClose,
  lang = 'ko',
  stats,
  onRefresh,
  isRefreshing = false,
}) => {
  const [internalStats, setInternalStats] = useState<AdminDiagnosticStats>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    apiStatus: '대기 중',
    jsErrorsCount: 0,
    recentJsErrors: [],
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
    timestamp: new Date().toLocaleTimeString(),
  });
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isKo = lang === 'ko';
  const activeStats = stats || internalStats;

  // Self-fetching ping metric if external stats not continuously supplied
  const measurePing = async () => {
    setIsMeasuring(true);
    let rtt: number | undefined = undefined;
    let statusText = '200 OK (Healthy)';

    try {
      const start = performance.now();
      const res = await fetch('/api/ping', { cache: 'no-store' });
      const end = performance.now();
      rtt = Math.round(end - start);

      if (!res.ok) {
        statusText = `Error (${res.status})`;
      }
    } catch (err) {
      statusText = 'Connection Refused';
    }

    const navEntry =
      typeof performance !== 'undefined'
        ? (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
        : undefined;

    setInternalStats({
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      httpRttMs: rtt,
      apiStatus: statusText,
      jsErrorsCount: activeStats.jsErrorsCount || 0,
      recentJsErrors: activeStats.recentJsErrors || [],
      pageUrl: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
      timestamp: new Date().toLocaleTimeString(),
      browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      language: typeof navigator !== 'undefined' ? navigator.language : 'ko-KR',
      timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Seoul',
      performanceTiming: navEntry
        ? {
            dnsTimeMs: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
            connectTimeMs: Math.round(navEntry.connectEnd - navEntry.connectStart),
            responseStartMs: Math.round(navEntry.responseStart - navEntry.requestStart),
            domContentLoadedMs: Math.round(navEntry.domContentLoadedEventEnd - navEntry.fetchStart),
            loadEventMs: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),
          }
        : undefined,
    });

    setIsMeasuring(false);
  };

  // Auto Refresh Interval every 5s when panel open
  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    measurePing();
    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      } else {
        measurePing();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, autoRefresh]);

  const handleCopyDiagnostics = () => {
    const payload = JSON.stringify(activeStats, null, 2);
    navigator.clipboard.writeText(payload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const rtt = activeStats.httpRttMs;
  let rttColor = 'text-emerald-400';
  let rttLabel = 'Fast (<100ms)';

  if (rtt !== undefined) {
    if (rtt > 300) {
      rttColor = 'text-rose-400';
      rttLabel = 'Slow (>300ms)';
    } else if (rtt > 120) {
      rttColor = 'text-amber-400';
      rttLabel = 'Moderate';
    }
  }

  return (
    <div className="fixed top-20 right-4 z-[60] w-[calc(100vw-2rem)] sm:w-full max-w-sm max-h-[calc(100vh-6rem)] bg-[#0c0e18]/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl shadow-2xl shadow-amber-500/10 text-gray-100 font-sans overflow-y-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Panel Top Header Bar */}
      <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 px-3.5 py-2.5 border-b border-amber-400/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/20 rounded-lg border border-amber-400/40">
            <Activity className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-amber-300 tracking-wide flex items-center gap-1.5">
              <span>ADMIN STATUS OVERLAY</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              {isKo ? '실시간 웹사이트 상태 및 진단 데이터' : 'Real-time Site Diagnostics & Health'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh || measurePing}
            disabled={isRefreshing || isMeasuring}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
            title={isKo ? '수동 측정' : 'Manual Refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isMeasuring ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
            title={isKo ? '닫기' : 'Close Overlay'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="p-3 space-y-2.5 text-xs font-mono">
        <div className="grid grid-cols-2 gap-2">
          {/* Network Connection */}
          <div className="bg-[#121526] p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
              {activeStats.online ? (
                <Wifi className="w-3 h-3 text-emerald-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-rose-400" />
              )}
              <span>네트워크 상태</span>
            </span>
            <div className="mt-1 font-bold text-sm flex items-center gap-1.5">
              <span className={activeStats.online ? 'text-emerald-400' : 'text-rose-400'}>
                {activeStats.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* HTTP Latency (RTT) */}
          <div className="bg-[#121526] p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>HTTP Ping RTT</span>
            </span>
            <div className="mt-1 font-bold text-sm flex items-baseline gap-1">
              <span className={rttColor}>
                {rtt !== undefined ? `${rtt} ms` : '측정중...'}
              </span>
              <span className="text-[9px] text-gray-400 font-sans">({rttLabel})</span>
            </div>
          </div>

          {/* Backend API Health */}
          <div className="bg-[#121526] p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
              <Server className="w-3 h-3 text-indigo-400" />
              <span>API 상태</span>
            </span>
            <div className="mt-1 font-bold text-xs truncate text-indigo-300">
              {activeStats.apiStatus}
            </div>
          </div>

          {/* Runtime JS Errors */}
          <div className="bg-[#121526] p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
              <Bug className="w-3 h-3 text-rose-400" />
              <span>JS Error 수</span>
            </span>
            <div className="mt-1 font-bold text-sm flex items-center justify-between">
              <span className={activeStats.jsErrorsCount > 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}>
                {activeStats.jsErrorsCount}건
              </span>
              {activeStats.jsErrorsCount > 0 && (
                <button
                  onClick={() => setShowErrorLogs(!showErrorLogs)}
                  className="text-[9px] text-rose-300 underline cursor-pointer"
                >
                  {showErrorLogs ? '숨기기' : '상세보기'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible JS Error Log Details */}
        {showErrorLogs && activeStats.recentJsErrors.length > 0 && (
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-2 space-y-1 max-h-32 overflow-y-auto text-[10px] font-mono">
            <div className="font-bold text-rose-300 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>최근 감지된 JavaScript 오류</span>
            </div>
            {activeStats.recentJsErrors.map((err, idx) => (
              <div key={idx} className="bg-black/40 p-1.5 rounded border border-rose-500/20 text-rose-200 break-words">
                <div className="font-bold text-rose-300">[{err.timestamp}] {err.type}</div>
                <div className="text-[9.5px] opacity-90">{err.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Environment & Viewport Info */}
        <div className="bg-[#121526] p-2.5 rounded-xl border border-white/10 space-y-1 text-[10px] text-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1 font-sans">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>페이지 경로:</span>
            </span>
            <span className="font-bold text-cyan-300 truncate max-w-[180px]">{activeStats.pageUrl}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1 font-sans">
              <Monitor className="w-3 h-3 text-purple-400" />
              <span>해상도 / 시간대:</span>
            </span>
            <span className="text-gray-200">{activeStats.viewport || 'N/A'} | {activeStats.timeZone || 'KST'}</span>
          </div>

          {activeStats.performanceTiming && (
            <div className="pt-1.5 border-t border-white/5 grid grid-cols-2 gap-1 text-[9px] text-gray-400">
              <div>TTFB: <span className="text-amber-300 font-bold">{activeStats.performanceTiming.responseStartMs || 0}ms</span></div>
              <div>DOM Load: <span className="text-emerald-300 font-bold">{activeStats.performanceTiming.domContentLoadedMs || 0}ms</span></div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-sans">
          <label className="flex items-center gap-1.5 text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-gray-800 border-gray-600 text-amber-500 focus:ring-0"
            />
            <span>5초 자동 갱신</span>
          </label>

          <button
            onClick={handleCopyDiagnostics}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-400" />
                <span>진단 JSON 복사</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
