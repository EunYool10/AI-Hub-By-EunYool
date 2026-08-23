import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Terminal,
  Shield,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { safeFetchJson } from '../../lib/api';
import { AITool } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  isOperatorCommand?: boolean;
  permissionDenied?: boolean;
}

interface AdminChatbotTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  tools: AITool[];
  showToast: (msg: string) => void;
}

const QUICK_COMMANDS = [
  { cmd: '/admin help', desc: '관리자 도움말', tag: 'ADMIN' },
  { cmd: '/admin status', desc: '운영 상태 진단', tag: 'ADMIN' },
  { cmd: '/admin users', desc: '사용자 통계', tag: 'ADMIN' },
  { cmd: '/admin tools', desc: '도구 카탈로그', tag: 'ADMIN' },
  { cmd: '/admin announcements', desc: '공지사항 현황', tag: 'ADMIN' },
  { cmd: '/admin logs', desc: '감사 로그 조회', tag: 'ADMIN' },
  { cmd: '/admin system', desc: '시스템 리소스', tag: 'ADMIN' },
  { cmd: '/admin reload', desc: '데이터 동기화', tag: 'ADMIN' },
  { cmd: '/dev status', desc: '개발자 상태', tag: 'DEV' },
  { cmd: '/dev debug', desc: '세션 디버그', tag: 'DEV' },
  { cmd: '/dev logs', desc: '서버 로그', tag: 'DEV' },
  { cmd: '/dev model', desc: 'AI 모델 정보', tag: 'DEV' },
  { cmd: '/dev clear', desc: '대화 초기화', tag: 'DEV' },
];

export const AdminChatbotTab: React.FC<AdminChatbotTabProps> = ({
  currentUserEmail,
  lang,
  tools,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_msg',
      sender: 'bot',
      text: isKo
        ? `🛡️ **AI Hub 관리자 챗봇 콘솔에 접속되었습니다.**\n\n현재 계정(\`${currentUserEmail}\`)은 **최고 관리자(Admin/Operator)**로 인증되었습니다.\n\n아래 빠른 명령어 칩을 클릭하거나 자연어로 서비스 상태 점검, 사용자 관리, 도구 통계 및 시스템 제어를 요청할 수 있습니다.`
        : `🛡️ **Connected to AI Hub Admin Chatbot Console.**\n\nAuthenticated as **Admin/Operator** with email \`${currentUserEmail}\`.\n\nClick any quick command chip below or send natural queries.`,
      timestamp: new Date().toLocaleTimeString(),
      isOperatorCommand: true,
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await safeFetchJson<{
        reply?: string;
        isOperatorCommand?: boolean;
        action?: string;
        permissionDenied?: boolean;
        error?: string;
      }>('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({
          query,
          lang,
          toolsCatalog: tools,
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      if (res.ok && res.data) {
        if (res.data.action === 'CLEAR_CHAT') {
          setMessages([
            {
              id: `sys_${Date.now()}`,
              sender: 'system',
              text: isKo ? '🧹 챗봇 대화 기록이 초기화되었습니다.' : '🧹 Chat history cleared.',
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          setLoading(false);
          return;
        }

        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: res.data.reply || (isKo ? '응답을 생성할 수 없습니다.' : 'No response.'),
          timestamp: new Date().toLocaleTimeString(),
          isOperatorCommand: res.data.isOperatorCommand,
          permissionDenied: res.data.permissionDenied,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'bot',
            text: `⚠️ API Error: ${res.data?.error || '서버 통신 실패'}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Error: ${e.message || '네트워크 오류'}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isKo ? '클립보드에 복사되었습니다.' : 'Copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `sys_${Date.now()}`,
        sender: 'system',
        text: isKo ? '대화 세션이 초기화되었습니다.' : 'Session restarted.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-[#16192b] to-[#121422] border border-cyan-400/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isKo ? '관리자 전용 AI 비서' : 'Admin AI Assistant'}
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                PRIVILEGED
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {isKo ? '운영 명령어 실행 및 자연어 종합 분석' : 'Command console & deep analysis'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="대화 비우기"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {QUICK_COMMANDS.map((item) => (
          <button
            key={item.cmd}
            onClick={() => handleSendMessage(item.cmd)}
            disabled={loading}
            className="px-2.5 py-1.5 bg-[#16192d] hover:bg-[#1f2442] border border-white/10 hover:border-cyan-400/40 rounded-xl text-xs text-gray-300 hover:text-white transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-[11px] font-bold text-cyan-300">{item.cmd}</span>
            <span className="text-[10px] text-gray-500">({item.desc})</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-[#121424] rounded-2xl border border-white/10 p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSys = msg.sender === 'system';

          if (isSys) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-gray-400">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 text-xs shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-[#6c63ff] to-[#5046e5] text-white rounded-tr-none shadow-md'
                    : 'bg-[#181b30] border border-white/10 text-gray-200 rounded-tl-none shadow-md'
                }`}
              >
                {!isUser && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="absolute top-2 right-2 p-1 rounded bg-black/40 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="복사하기"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? 'text-indigo-200 text-right' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shrink-0 text-xs shadow-md">
                  👑
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#181b30] border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{isKo ? '관리자 명령어 처리 및 AI 응답 생성 중...' : 'Processing admin query...'}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isKo
                ? '관리자 명령어(/admin help) 또는 자연어로 질문을 입력하세요...'
                : 'Enter admin command or natural query...'
            }
            className="w-full pl-4 pr-12 py-3 bg-[#121424] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
