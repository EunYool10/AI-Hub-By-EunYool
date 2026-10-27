import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Wrench,
  Megaphone,
  Server,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { AdminUser, AdminAuditLog, SystemHealthStatus, AITool, NoticeItem } from '../../types';
import { safeFetchJson } from '../../lib/api';

interface AdminDashboardTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  tools: AITool[];
  notices: NoticeItem[];
  onNavigateTab: (tab: any) => void;
  onRefreshData: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  currentUserEmail,
  lang,
  tools,
  notices,
  onNavigateTab,
  onRefreshData,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [health, setHealth] = useState<SystemHealthStatus>({
    application: 'Online',
    authentication: 'Online',
    aiApi: 'Online',
    database: 'Online',
    chatbot: 'Online',
    tts: 'Online',
    lastChecked: new Date().toLocaleTimeString(),
    averageResponseTimeMs: 0,
    recentErrorsCount: 0,
    activeToolsCount: tools.filter((t) => !t.isDeleted && t.status !== 'inactive').length,
    totalUsersCount: 0,
  });

  const [usersCount, setUsersCount] = useState({ total: 0, active: 0, suspended: 0, admins: 0 });
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await safeFetchJson<any>('/api/admin/overview', {
        headers: { 'x-user-email': currentUserEmail },
      });
      if (res.ok && res.data) {
        if (res.data.status) setHealth(res.data.status);
        if (res.data.users) setUsersCount(res.data.users);
        if (res.data.recentAuditLogs) setAuditLogs(res.data.recentAuditLogs);
      }
    } catch (e) {
      console.error('Failed to fetch admin overview:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000);
    return () => clearInterval(interval);
  }, [currentUserEmail]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOverview();
    onRefreshData();
    showToast(isKo ? '📊 관리자 대시보드 메트릭이 최신화되었습니다.' : 'Metrics refreshed.');
  };

  const handleExecuteAction = async (actionType: 'cache' | 'errors' | 'websocket') => {
    setIsExecutingAction(actionType);
    try {
      const endpoint =
        actionType === 'cache'
          ? '/api/admin/cache/reset'
          : actionType === 'errors'
          ? '/api/admin/errors/reset'
          : '/api/admin/websocket/reset';

      const res = await safeFetchJson<any>(endpoint, {
        method: 'POST',
        headers: { 'x-user-email': currentUserEmail },
      });

      if (res.ok && res.data?.success) {
        showToast(`✅ ${res.data.message || '작업이 성공적으로 실행되었습니다.'}`);
        fetchOverview();
      } else {
        showToast(`❌ 실행 실패: ${res.data?.error || '서버 오류'}`);
      }
    } catch (e) {
      showToast('❌ 작업 요청 중 오류가 발생했습니다.');
    } finally {
      setIsExecutingAction(null);
    }
  };

  const activeToolsCount = tools.filter((t) => !t.isDeleted && t.status !== 'inactive').length;
  const publishedNoticesCount = notices.filter((n) => n.status !== 'DRAFT').length;

  const renderStatusBadge = (status: 'Online' | 'Warning' | 'Offline') => {
    if (status === 'Online') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Online
        </span>
      );
    }
    if (status === 'Warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3" /> Offline
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface-2 to-surface border border-amber-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              OPERATIONS CONSOLE
            </span>
            <span className="text-xs text-muted">
              {isKo ? '실시간 통합 모니터링 및 운영 제어' : 'Real-time System Operations'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? 'AI Hub 운영 대시보드' : 'AI Hub Admin Dashboard'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isKo ? '마지막 상태 검사:' : 'Last checked:'} <span className="text-amber-300 font-mono">{health.lastChecked}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 bg-surface-3 hover:bg-surface-3 border border-line text-fg rounded-xl text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : 'text-fg-2'}`} />
            <span>{isKo ? '새로고침' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total & Active AI Tools */}
        <div
          onClick={() => onNavigateTab('tools')}
          className="p-5 rounded-2xl bg-surface hover:bg-surface-2 border border-line hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              {isKo ? 'AI 도구 카탈로그' : 'AI Tools Catalog'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">{tools.length}</span>
            <span className="text-xs text-emerald-400 font-bold">
              ({activeToolsCount} {isKo ? '활성' : 'Active'})
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {isKo ? '카테고리별 등록 도구 관리' : 'Manage registered AI tools'} &rarr;
          </p>
        </div>

        {/* Stat 2: Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="p-5 rounded-2xl bg-surface hover:bg-surface-2 border border-line hover:border-indigo-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              {isKo ? '등록 사용자 계정' : 'User Accounts'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">{usersCount.total}</span>
            <span className="text-xs text-emerald-400 font-bold">
              ({usersCount.active} {isKo ? '정상' : 'Active'})
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {isKo ? '계정 권한 및 정지 상태 관리' : 'User roles & status management'} &rarr;
          </p>
        </div>

        {/* Stat 3: Announcements */}
        <div
          onClick={() => onNavigateTab('announcements')}
          className="p-5 rounded-2xl bg-surface hover:bg-surface-2 border border-line hover:border-purple-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              {isKo ? '공지사항 관리' : 'Announcements'}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">{notices.length}</span>
            <span className="text-xs text-purple-400 font-bold">
              ({publishedNoticesCount} {isKo ? '게시 중' : 'Published'})
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {isKo ? '공지 등록, 수정 및 상단 고정' : 'Publish & pin notices'} &rarr;
          </p>
        </div>

        {/* Stat 4: Avg Response Time & Errors */}
        <div
          onClick={() => onNavigateTab('system')}
          className="p-5 rounded-2xl bg-surface hover:bg-surface-2 border border-line hover:border-cyan-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted">
              {isKo ? '평균 응답 속도 (Latency)' : 'Average Latency'}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-fg font-mono">
              {health.averageResponseTimeMs > 0 ? health.averageResponseTimeMs : 0}
              <span className="text-sm font-normal text-muted ml-1">ms</span>
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              ({health.recentErrorsCount} {isKo ? '에러' : 'Errors'})
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {isKo ? '실시간 시스템 진단 및 상태 점검' : 'System diagnostics & health'} &rarr;
          </p>
        </div>
      </div>

      {/* Services Health Grid & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Service Status Matrix */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-line space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-fg">
                {isKo ? '실시간 서비스 가동 상태 (Service Health Matrix)' : 'Real-time Service Health'}
              </h3>
            </div>
            <span className="text-xs text-muted">포트 3000 Ingress</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">Application (Frontend)</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.application)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">Google OAuth & Auth</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.authentication)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">Gemini 3.6 Flash AI API</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.aiApi)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">Database & State Engine</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.database)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">AIChatbot & Commands</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.chatbot)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-line flex flex-col justify-between">
              <span className="text-xs text-muted">Speech (TTS Engine)</span>
              <div className="mt-2 flex items-center justify-between">
                {renderStatusBadge(health.tts)}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Executable Admin Actions */}
        <div className="p-5 rounded-2xl bg-surface border border-line space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-fg">
                {isKo ? '관리자 즉각 제어 작업' : 'Quick Actions'}
              </h3>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => handleExecuteAction('cache')}
                disabled={isExecutingAction !== null}
                className="w-full p-2.5 bg-surface-2 hover:bg-surface-3 border border-line rounded-xl text-xs font-bold text-fg-2 hover:text-fg transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isKo ? '서버 캐시 초기화' : 'Reset Server Cache'}</span>
                </div>
                <span className="text-[0.6875rem] text-muted font-mono">CACHE_RESET</span>
              </button>

              <button
                onClick={() => handleExecuteAction('errors')}
                disabled={isExecutingAction !== null}
                className="w-full p-2.5 bg-surface-2 hover:bg-surface-3 border border-line rounded-xl text-xs font-bold text-fg-2 hover:text-fg transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isKo ? '에러 로그 버퍼 초기화' : 'Reset Error Logs'}</span>
                </div>
                <span className="text-[0.6875rem] text-muted font-mono">ERROR_RESET</span>
              </button>

              <button
                onClick={() => handleExecuteAction('websocket')}
                disabled={isExecutingAction !== null}
                className="w-full p-2.5 bg-surface-2 hover:bg-surface-3 border border-line rounded-xl text-xs font-bold text-fg-2 hover:text-fg transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isKo ? '웹소켓 세션 재설정' : 'Reset WebSocket'}</span>
                </div>
                <span className="text-[0.6875rem] text-muted font-mono">WS_RESET</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-line text-xs text-muted flex items-center justify-between">
            <span>보안 인증:</span>
            <span className="text-amber-300 font-bold">{currentUserEmail}</span>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity Stream */}
      <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-fg">
              {isKo ? '최근 관리자 감사 로그 (Audit Activity)' : 'Recent Audit Activity'}
            </h3>
          </div>
          <span className="text-xs text-muted">
            {auditLogs.length} {isKo ? '건 기록됨' : 'logs'}
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-subtle py-4 text-center">
            {isKo ? '최근 기록된 감사 로그가 없습니다.' : 'No audit activity recorded yet.'}
          </p>
        ) : (
          <div className="divide-y divide-line">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.6875rem] text-muted whitespace-nowrap">{log.timestamp}</span>
                  <div>
                    <span className="font-bold text-fg mr-1.5">{log.action}</span>
                    <span className="text-muted">[{log.target}]</span>
                    {log.details && <span className="text-subtle text-xs ml-1.5">- {log.details}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[0.6875rem] text-amber-400/80 font-mono">{log.adminEmail}</span>
                  <span className="px-1.5 py-0.5 rounded text-[0.6875rem] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
