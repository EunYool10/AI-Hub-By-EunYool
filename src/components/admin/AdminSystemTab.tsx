import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Cpu,
  Database,
  Clock,
  Zap,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { safeFetchJson } from '../../lib/api';

interface AdminSystemTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  showToast: (msg: string) => void;
}

export const AdminSystemTab: React.FC<AdminSystemTabProps> = ({
  currentUserEmail,
  lang,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ rttMs: number; time: string } | null>(null);

  const [systemStatus, setSystemStatus] = useState<any>(null);

  const fetchSystemData = async () => {
    try {
      const res = await safeFetchJson<any>('/api/admin/system/status', {
        headers: { 'x-user-email': currentUserEmail },
      });
      if (res.ok && res.data?.system) {
        setSystemStatus(res.data.system);
      }
    } catch (e) {
      console.error('Failed to fetch system data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const timer = setInterval(fetchSystemData, 10000);
    return () => clearInterval(timer);
  }, [currentUserEmail]);

  const handleTestLatency = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await safeFetchJson<{ status: string }>('/api/ping');
      const rtt = Math.round(performance.now() - start);
      setPingResult({ rttMs: rtt, time: new Date().toLocaleTimeString() });
      showToast(isKo ? `⚡ HTTP RTT 측정 완료: ${rtt}ms` : `Ping complete: ${rtt}ms`);
    } catch (e) {
      setPingResult({ rttMs: -1, time: new Date().toLocaleTimeString() });
      showToast('❌ Ping 실패');
    } finally {
      setIsPinging(false);
    }
  };

  const handleClearErrors = async () => {
    try {
      const res = await safeFetchJson<any>('/api/admin/errors/reset', {
        method: 'POST',
        headers: { 'x-user-email': currentUserEmail },
      });
      if (res.ok) {
        showToast(isKo ? '🧹 에러 로그 버퍼가 초기화되었습니다.' : 'Error logs cleared.');
        fetchSystemData();
      }
    } catch (e) {
      showToast('에러 초기화 실패');
    }
  };

  const formatUptime = (sec: number) => {
    if (!sec || sec <= 0) return isKo ? '기록 없음' : 'N/A';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  const mem = systemStatus?.memoryMb || null;
  const nodeVersion = systemStatus?.nodeVersion || 'v20.x';
  const port = systemStatus?.port || 3000;
  const geminiConfigured = systemStatus?.geminiConfigured ?? true;
  const uptime = systemStatus?.uptimeSeconds || 0;
  const errorLogs: any[] = systemStatus?.recentErrorLogs || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-surface-2 to-surface border border-cyan-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              SYSTEM MONITOR & DIAGNOSTICS
            </span>
            <span className="text-xs text-muted">
              {isKo ? '실시간 인프라 및 API 지연 시간' : 'Real-time Infrastructure & Latency'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? '시스템 모니터링 및 진단' : 'System Monitoring'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Node.js <span className="text-cyan-300 font-mono">{nodeVersion}</span> | Port{' '}
            <span className="text-cyan-300 font-mono">{port}</span> | Gemini Key{' '}
            <span className="text-emerald-400 font-bold">{geminiConfigured ? 'Ready' : 'Missing'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestLatency}
            disabled={isPinging}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 ${isPinging ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{isKo ? '실시간 핑(Ping) 테스트' : 'Ping Test'}</span>
          </button>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchSystemData();
            }}
            disabled={refreshing}
            className="p-2 bg-surface-3 hover:bg-surface-3 border border-line text-fg-2 hover:text-fg rounded-xl transition-all cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Latency & Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: HTTP Ping / Latency */}
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <span>HTTP RTT (Ping)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">
              {pingResult ? (pingResult.rttMs >= 0 ? `${pingResult.rttMs}ms` : 'FAIL') : (isKo ? '측정 대기' : 'Pending')}
            </span>
            {pingResult && pingResult.rttMs >= 0 && (
              <span className="text-xs text-emerald-400 font-bold">Fast</span>
            )}
          </div>
          <p className="text-[0.6875rem] text-subtle">
            {pingResult ? `측정: ${pingResult.time}` : (isKo ? '핑 테스트 버튼을 눌러 측정' : 'Press Ping Test to measure')}
          </p>
        </div>

        {/* Card 2: Memory RSS & Heap */}
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <span>메모리 사용량 (Memory)</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            {mem ? (
              <>
                <span className="text-3xl font-black text-fg font-mono">{mem.heapUsed}</span>
                <span className="text-xs text-muted font-mono">/ {mem.heapTotal} MB</span>
              </>
            ) : (
              <span className="text-lg font-bold text-muted">{isKo ? '확인 중...' : 'Loading...'}</span>
            )}
          </div>
          <p className="text-[0.6875rem] text-subtle">{mem ? `RSS: ${mem.rss} MB` : (isKo ? '프로세스 메모리' : 'Process Memory')}</p>
        </div>

        {/* Card 3: Server Uptime */}
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <span>서버 가동 시간 (Uptime)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-fg font-mono">{formatUptime(uptime)}</div>
          <p className="text-[0.6875rem] text-subtle">Node Container Process</p>
        </div>

        {/* Card 4: Accumulated Errors */}
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <span>누적 에러 수 (Errors)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">{errorLogs.length}</span>
            <span className="text-xs text-emerald-400 font-bold">
              {errorLogs.length === 0 ? 'Optimal' : 'Logged'}
            </span>
          </div>
          <p className="text-[0.6875rem] text-subtle">실시간 예외 버퍼</p>
        </div>
      </div>

      {/* Error Logs Console */}
      <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-fg">
              {isKo ? '실시간 서버 에러 로그 버퍼' : 'Live Server Error Logs'}
            </h3>
          </div>

          <button
            onClick={handleClearErrors}
            disabled={errorLogs.length === 0}
            className="px-2.5 py-1 bg-fg/5 hover:bg-fg/10 disabled:opacity-40 text-fg-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{isKo ? '로그 비우기' : 'Clear Errors'}</span>
          </button>
        </div>

        {errorLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-subtle flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>{isKo ? '현재 감지된 서버 예외 및 에러가 없습니다. (시스템 정상)' : 'No errors logged. All systems nominal.'}</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {errorLogs.map((log: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs font-mono flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-rose-300">
                  <span className="font-bold">[{log.endpoint || 'API'}]</span>
                  <span className="text-muted text-[0.6875rem]">{log.timestamp}</span>
                </div>
                <div className="text-fg-2">{log.message || log.error}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
