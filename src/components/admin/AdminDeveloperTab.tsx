import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Shield,
  Code2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { safeFetchJson } from '../../lib/api';

interface AdminDeveloperTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  showToast: (msg: string) => void;
}

export const AdminDeveloperTab: React.FC<AdminDeveloperTabProps> = ({
  currentUserEmail,
  lang,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [commandInput, setCommandInput] = useState('/dev help');
  const [output, setOutput] = useState<string>(
    isKo
      ? `=== DEVELOPER CONSOLE READY ===\n인증된 개발자 계정: ${currentUserEmail}\n사용 가능한 명령어: /dev help, /dev status, /dev debug, /dev logs, /dev model, /dev reload, /dev clear\n명령어를 입력하고 [실행]을 누르세요.`
      : `=== DEVELOPER CONSOLE READY ===\nVerified developer: ${currentUserEmail}\nType command and press Run.`
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || commandInput).trim();
    if (!cmd || loading) return;

    setLoading(true);
    const time = new Date().toLocaleTimeString();

    try {
      const res = await safeFetchJson<{ reply?: string; isOperatorCommand?: boolean; error?: string }>(
        '/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUserEmail,
          },
          body: JSON.stringify({
            query: cmd,
            lang,
          }),
        }
      );

      if (res.ok && res.data) {
        setOutput((prev) => `[${time}] > ${cmd}\n\n${res.data?.reply || 'No output.'}\n\n--------------------\n` + prev);
      } else {
        setOutput((prev) => `[${time}] > ${cmd}\n\n[ERROR] ${res.data?.error || '실행 실패'}\n\n--------------------\n` + prev);
      }
    } catch (e: any) {
      setOutput((prev) => `[${time}] > ${cmd}\n\n[ERROR] ${e.message}\n\n--------------------\n` + prev);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    showToast(isKo ? '콘솔 출력이 복사되었습니다.' : 'Copied output.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface-2 to-surface border border-emerald-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              DEVELOPER CENTER
            </span>
            <span className="text-xs text-muted">
              {isKo ? '개발자 전용 명령어 실행 및 런타임 제어' : 'Developer Commands & Runtime Controls'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? '개발자 전용 콘솔' : 'Developer Center'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Verified Account: <span className="text-emerald-300 font-mono">{currentUserEmail}</span> (Operator Role)
          </p>
        </div>
      </div>

      {/* Preset Command Buttons */}
      <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
        <div className="text-xs font-bold text-fg-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>{isKo ? '원클릭 개발자 명령어 실행' : 'Quick Developer Commands'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { cmd: '/dev help', label: '명령어 목록' },
            { cmd: '/dev status', label: '상태 검사' },
            { cmd: '/dev debug', label: '디버그 정보' },
            { cmd: '/dev logs', label: '서버 세션 로그' },
            { cmd: '/dev model', label: 'AI 모델 사양' },
            { cmd: '/dev reload', label: '데이터 리로드' },
          ].map((item) => (
            <button
              key={item.cmd}
              onClick={() => {
                setCommandInput(item.cmd);
                handleRunCommand(item.cmd);
              }}
              disabled={loading}
              className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-emerald-400/40 text-left transition-all cursor-pointer group"
            >
              <div className="font-mono text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                {item.cmd}
              </div>
              <div className="text-[0.6875rem] text-muted mt-0.5">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Command Runner */}
      <div className="p-5 rounded-2xl bg-surface border border-line space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fg flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>{isKo ? '명령어 실행 입력기' : 'Command Prompt'}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-fg/5 hover:bg-fg/10 text-fg-2 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isKo ? '출력 복사' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setOutput('')}
              className="px-2.5 py-1 bg-fg/5 hover:bg-fg/10 text-fg-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {isKo ? '콘솔 비우기' : 'Clear'}
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-emerald-400">
              &gt;
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="/dev help 또는 /dev status"
              className="w-full pl-8 pr-3.5 py-2.5 bg-bg border border-line rounded-xl font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !commandInput.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold rounded-xl text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
            <span>{isKo ? '실행 (Run)' : 'Run'}</span>
          </button>
        </form>

        {/* Terminal Output Screen */}
        <div className="bg-bg border border-emerald-500/20 rounded-xl p-4 font-mono text-xs text-fg-2 h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
          {output}
        </div>
      </div>
    </div>
  );
};
