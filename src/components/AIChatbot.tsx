import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mail,
  User,
  RefreshCw,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Square,
  ExternalLink,
  AlertCircle,
  Filter,
  Crown,
  Settings,
  Terminal,
  Code,
  Bug,
  Paperclip,
  FileText,
  Activity,
  File,
  Trash2,
  Image as ImageIcon,
  Film,
  UploadCloud,
  Clock,
  ShieldAlert,
  Download,
  Loader2,
} from 'lucide-react';
import { safeFetchJson } from '../lib/api';
import { IS_STATIC_SITE } from '../lib/runtime';
import { answerFromCatalog } from '../lib/localAssistant';
import { ActionRouter } from '../lib/actionRouter';
import { ExecutionConfirmation } from './ExecutionConfirmation';
import { Language, UI_TEXT, getCategoryLabel, getPriceLabel, getToolDescription } from '../lib/translations';
import { AITool, Category } from '../types';
import { AIFavicon } from './AIFavicon';
import { UserProfile } from './GoogleLoginModal';
import { getStoredSettings, UserSettings } from '../lib/settings';
import { ttsManager, cleanTextForTTS } from '../lib/ttsManager';
import { AdminStatusPanel } from './AdminStatusPanel';
import {
  isDeveloperCommandInput,
  parseDeveloperCommand,
  executeDeveloperCommand,
  getDevCommandSuggestions,
  DEV_COMMANDS_LIST,
} from '../lib/devCommands';
import { logDevEvent, getDevLogs } from '../lib/devLogger';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
  isOperatorCommand?: boolean;
  permissionDenied?: boolean;
  attachments?: Array<{ id: string; name: string; type: string; content: string; size: number }>;
  debugInfo?: {
    model: string;
    responseTimeMs: number;
    catalogCount: number;
    selectedCategory: string;
    searchQuery: string;
    operatorEmail: string;
    status: string;
  };
}

interface AIChatbotProps {
  onOpenInquiryModal: () => void;
  lang?: Language;
  tools?: AITool[];
  onSelectTool?: (tool: AITool) => void;
  selectedCategory?: Category;
  searchQuery?: string;
  onSelectCategory?: (cat: Category) => void;
  onSearch?: (query: string) => void;
  currentUser?: UserProfile | null;
  onOpenSettings?: () => void;
}

// Rich Markdown Renderer component using react-markdown and remark-gfm
const FormattedMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="max-w-full text-xs text-fg-2 leading-relaxed [word-break:break-word] overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed break-words [word-break:break-word]">{children}</p>,
          h1: ({ children }) => <h1 className="font-bold text-sm text-fg mt-2 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="font-bold text-xs text-fg mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="font-semibold text-xs text-indigo-300 mt-1.5 mb-1">{children}</h3>,
          h4: ({ children }) => <h4 className="font-semibold text-xs text-indigo-300 mt-1 mb-0.5">{children}</h4>,
          strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
          em: ({ children }) => <em className="italic text-fg-2">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5 text-fg-2 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-1 space-y-0.5 text-fg-2 pl-1">{children}</ol>,
          li: ({ children }) => <li className="my-0.5 leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mint hover:underline inline-flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <span>{children}</span>
              <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-mint pl-2 py-0.5 my-1.5 text-fg-2 italic bg-inset rounded-r-md">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => <div className="my-1.5">{children}</div>,
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isMultiLine = codeString.includes('\n');
            if (match || isMultiLine) {
              const langName = match ? match[1] : 'javascript';
              return (
                <div className="my-2 rounded-lg bg-bg border border-line overflow-hidden text-xs font-mono shadow-md">
                  <div className="flex items-center justify-between px-2.5 py-1 bg-inset border-b border-line text-[0.6875rem] text-muted">
                    <span className="font-semibold text-indigo-300">{langName}</span>
                    <button
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(codeString);
                        }
                      }}
                      className="hover:text-fg transition-colors cursor-pointer flex items-center gap-1"
                      title="Copy code"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={langName}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '10px 12px',
                      background: 'transparent',
                      fontSize: '11px',
                      lineHeight: '1.5',
                    }}
                    codeTagProps={{
                      style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className="px-1.5 py-0.5 bg-inset text-amber-300 rounded font-mono text-[0.6875rem] border border-line">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-inset text-indigo-300 font-semibold border-b border-line">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-line">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-fg/5 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-2 py-1.5 border-r border-line last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1.5 border-r border-line last:border-r-0 text-fg-2">{children}</td>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

// Image preview modal component
const ImagePreviewModal: React.FC<{
  imageUrl: string | null;
  altText?: string;
  onClose: () => void;
  lang?: Language;
}> = ({ imageUrl, altText, onClose, lang = 'ko' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (imageUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] w-full bg-surface border border-line-strong rounded-2xl p-3 shadow-2xl flex flex-col items-center overflow-hidden"
      >
        <div className="w-full flex items-center justify-between pb-2 border-b border-line mb-2 px-1">
          <span className="text-xs font-bold text-fg-2 truncate max-w-[80%]">
            {altText && altText !== 'AI Image' ? altText : (lang === 'ko' ? '이미지 미리보기' : 'Image Preview')}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-fg/10 rounded-lg text-fg-2 hover:text-fg text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title={lang === 'ko' ? '새 탭에서 열기' : 'Open in new tab'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-rose-500/20 text-muted hover:text-rose-300 rounded-lg cursor-pointer transition-colors"
              title={lang === 'ko' ? '닫기' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-2 w-full">
          <img
            src={imageUrl}
            alt={altText || 'Preview'}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-line"
          />
        </div>
      </div>
    </div>
  );
};

// Chat image item component with loading, fallback, and click preview
const ChatImageItem: React.FC<{
  src: string;
  alt?: string;
  onPreview?: (src: string, alt?: string) => void;
  lang?: Language;
}> = ({ src, alt, onPreview, lang = 'ko' }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div className="my-2 p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-center justify-between gap-2 max-w-full">
        <div className="flex items-center gap-2 truncate">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{alt && alt !== 'AI Image' ? alt : (lang === 'ko' ? '이미지를 불러올 수 없습니다.' : 'Failed to load image.')}</span>
        </div>
        <button
          onClick={() => {
            setHasError(false);
            setIsLoaded(false);
          }}
          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 rounded-lg text-[0.6875rem] font-medium shrink-0 cursor-pointer transition-colors"
        >
          {lang === 'ko' ? '재시도' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="my-2 relative group max-w-full overflow-hidden rounded-xl border border-line shadow-lg bg-inset inline-block">
      {!isLoaded && (
        <div className="w-full h-32 bg-fg/5 animate-pulse rounded-xl flex items-center justify-center text-muted text-xs gap-2 p-4">
          <ImageIcon className="w-4 h-4 animate-bounce text-mint" />
          <span>{lang === 'ko' ? '이미지 로딩 중...' : 'Loading image...'}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt || 'Chatbot Image'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={() => onPreview?.(src, alt)}
        className={`max-w-full h-auto max-h-[300px] object-contain rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
          isLoaded ? 'block' : 'hidden'
        }`}
      />
      {isLoaded && (
        <div
          onClick={() => onPreview?.(src, alt)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer text-fg text-xs font-bold gap-1.5 backdrop-blur-[2px]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-mint" />
          <span>{lang === 'ko' ? '원본 크기로 보기' : 'View Full Image'}</span>
        </div>
      )}
    </div>
  );
};

// Action Toast Notification
const ActionToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-surface-2 border border-mint/50 text-fg px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-md animate-bounce max-w-[90vw] text-center">
      <Check className="w-4 h-4 text-mint shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
};

// 1. Prompt Handoff Card Component
const PromptHandoffCard: React.FC<{
  data: {
    name: string;
    description: string;
    url: string;
    prompt: string;
    category?: string;
  };
  lang: 'ko' | 'en';
  onToast: (msg: string) => void;
}> = ({ data, lang, onToast }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (data.prompt) {
      navigator.clipboard.writeText(data.prompt);
      setCopied(true);
      onToast(lang === 'ko' ? '✓ 프롬프트가 복사되었습니다.' : '✓ Prompt copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToTool = () => {
    if (data.prompt) {
      navigator.clipboard.writeText(data.prompt);
    }
    onToast(lang === 'ko' ? '✓ 프롬프트 복사 완료! 추천 도구 사이트로 이동합니다.' : '✓ Prompt copied! Opening tool website.');
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="my-3 p-3.5 bg-surface border border-mint/40 rounded-2xl shadow-xl space-y-2.5 max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-mint/20 border border-mint/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
          </div>
          <span className="font-bold text-fg text-xs truncate">{data.name || '추천 AI 도구'}</span>
        </div>
        <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-mint/15 text-mint font-semibold border border-mint/30 shrink-0">
          {data.category || 'AI Tool'}
        </span>
      </div>

      <p className="text-xs text-fg-2 leading-relaxed break-words">
        {data.description || '이 프롬프트를 사용하여 해당 AI 도구에서 뛰어난 결과를 생성해 보세요.'}
      </p>

      {data.prompt && (
        <div className="bg-inset border border-line p-2.5 rounded-xl font-mono text-[0.6875rem] text-amber-200/90 break-words max-h-28 overflow-y-auto relative">
          <div className="text-[0.6875rem] text-muted font-sans mb-1">✨ 최적화된 프롬프트:</div>
          <p className="whitespace-pre-wrap">{data.prompt}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleCopyPrompt}
          className="flex-1 py-1.5 px-3 bg-fg/10 hover:bg-fg/20 text-fg rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border border-line active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-mint" />
              <span className="text-mint">{lang === 'ko' ? '복사됨' : 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-fg-2" />
              <span>{lang === 'ko' ? '프롬프트 복사' : 'Copy Prompt'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleGoToTool}
          className="flex-1 py-1.5 px-3 bg-mint hover:bg-mint text-black font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-mint/20 active:scale-95 cursor-pointer"
        >
          <span>{lang === 'ko' ? '도구로 이동 →' : 'Open Tool →'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// 2. In-Chat Image Generation Card Component
const InChatImageCard: React.FC<{
  data: {
    prompt: string;
    imageUrl?: string;
  };
  lang: 'ko' | 'en';
  onToast: (msg: string) => void;
  onPreviewImage: (url: string, alt?: string) => void;
}> = ({ data, lang, onToast, onPreviewImage }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(data.imageUrl || null);
  const [isLoading, setIsLoading] = useState<boolean>(!data.imageUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateImage = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      });
      const result = await res.json();
      if (res.ok && result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        setErrorMsg(result.error || (lang === 'ko' ? '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'Failed to generate image.'));
      }
    } catch (err) {
      console.error('Image gen error:', err);
      setErrorMsg(lang === 'ko' ? '이미지 생성 중 네트워크 오류가 발생했습니다.' : 'Network error during image generation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data.imageUrl && !imageUrl) {
      generateImage();
    }
  }, [data.prompt]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ai-generated-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast(lang === 'ko' ? '✓ 이미지가 저장되었습니다.' : '✓ Image saved.');
  };

  return (
    <div className="my-3 p-3.5 bg-surface border border-accent/40 rounded-2xl shadow-xl space-y-3 max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-brand" />
          </div>
          <span className="font-bold text-fg text-xs">
            {lang === 'ko' ? '🎨 AI 이미지 생성' : '🎨 AI Image Generation'}
          </span>
        </div>
      </div>

      <div className="text-xs text-fg-2 bg-inset p-2 rounded-xl border border-line font-mono break-words">
        <span className="text-muted font-sans mr-1">프롬프트:</span>
        <span className="text-amber-200/90">{data.prompt}</span>
      </div>

      {isLoading ? (
        <div className="h-44 bg-inset border border-line rounded-xl flex flex-col items-center justify-center p-4 space-y-2 animate-pulse">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
          <span className="text-xs text-fg-2 font-medium">
            {lang === 'ko' ? '이미지를 생성하고 있습니다...' : 'Generating image...'}
          </span>
          <span className="text-[0.6875rem] text-subtle">잠시만 기다려 주세요</span>
        </div>
      ) : errorMsg ? (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center space-y-2">
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button
            onClick={generateImage}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-medium border border-rose-500/40 transition-all cursor-pointer"
          >
            {lang === 'ko' ? '다시 시도 🔄' : 'Retry 🔄'}
          </button>
        </div>
      ) : imageUrl ? (
        <div className="space-y-2.5">
          <div
            onClick={() => onPreviewImage(imageUrl, data.prompt)}
            className="relative group rounded-xl overflow-hidden border border-line cursor-pointer bg-inset shadow-lg hover:border-accent/60 transition-all"
          >
            <img
              src={imageUrl}
              alt={data.prompt}
              className="w-full h-auto max-h-72 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white bg-black/70 px-3 py-1.5 rounded-full border border-line-strong">
                {lang === 'ko' ? '확대보기 🔍' : 'Zoom Image 🔍'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDownload}
              className="flex-1 py-1.5 px-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '이미지 저장' : 'Save Image'}</span>
            </button>

            <button
              onClick={generateImage}
              className="flex-1 py-1.5 px-3 bg-fg/10 hover:bg-fg/20 text-fg-2 hover:text-fg rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border border-line active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? '다시 생성' : 'Regenerate'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// 3. Admin Executable Action Card Component
const AdminActionCard: React.FC<{
  data: {
    actionType: 'WEBSOCKET_RESET' | 'ERROR_RESET' | 'CACHE_RESET';
    description: string;
  };
  currentUserEmail?: string;
  lang: 'ko' | 'en';
  onToast: (msg: string) => void;
}> = ({ data, currentUserEmail, lang, onToast }) => {
  const [status, setStatus] = useState<'confirming' | 'success' | 'error' | 'cancelled'>('confirming');
  const [resMsg, setResMsg] = useState<string | null>(null);

  if (status === 'confirming') {
    return (
      <div className="my-3 max-w-full overflow-hidden">
        <ExecutionConfirmation
          actionType={data.actionType}
          description={data.description}
          userEmail={currentUserEmail}
          lang={lang}
          onConfirm={() => {}}
          onCancel={() => setStatus('cancelled')}
          onSuccess={(msg) => {
            setStatus('success');
            setResMsg(msg);
            onToast(lang === 'ko' ? '✓ 관리자 시스템 조치가 완료되었습니다.' : '✓ Admin action executed.');
          }}
          onError={(err) => {
            setStatus('error');
            setResMsg(err);
          }}
        />
      </div>
    );
  }

  return (
    <div className="my-3 p-3.5 bg-surface-2 border border-amber-500/40 rounded-2xl shadow-xl space-y-2.5 max-w-full overflow-hidden font-sans">
      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <span className="font-bold text-amber-200 text-xs">
          {lang === 'ko' ? '⚠ 관리자 시스템 작업' : '⚠ Admin System Action'}
        </span>
      </div>

      {status === 'success' && (
        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-start gap-2 text-emerald-300 text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{resMsg}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
          <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{resMsg}</span>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="p-2 bg-fg/5 border border-line rounded-xl text-center text-xs text-muted">
          {lang === 'ko' ? '작업이 취소되었습니다.' : 'Action cancelled.'}
        </div>
      )}
    </div>
  );
};

// Component to render message with formatted markdown, images, interactive AITool Mini-Cards, and Action Cards
const ChatMessageContent: React.FC<{
  text: string;
  tools: AITool[];
  lang: Language;
  currentUserEmail?: string;
  onSelectTool?: (tool: AITool) => void;
  onPreviewImage?: (url: string, alt?: string) => void;
  onToast?: (msg: string) => void;
}> = ({ text, tools, lang, currentUserEmail, onSelectTool, onPreviewImage, onToast = () => {} }) => {
  const parts = useMemo(() => {
    const tagRegex = /\[\[TOOL_CARD:\s*(\d+)\]\]|\[TOOL_CARD:\s*(\d+)\]|\[\[ACTION:(PROMPT_HANDOFF|IMAGE_GENERATE|ADMIN_ACTION):([\s\S]*?)\]\]/gi;
    const result: Array<{
      type: 'text' | 'card' | 'prompt_handoff' | 'image_generate' | 'admin_action';
      content: any;
    }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }

      if (match[1] || match[2]) {
        const toolId = parseInt(match[1] || match[2], 10);
        result.push({ type: 'card', content: toolId });
      } else if (match[3]) {
        const actionType = match[3].toUpperCase();
        const jsonStr = match[4];
        try {
          const parsedData = JSON.parse(jsonStr);
          if (actionType === 'PROMPT_HANDOFF') {
            result.push({ type: 'prompt_handoff', content: parsedData });
          } else if (actionType === 'IMAGE_GENERATE') {
            result.push({ type: 'image_generate', content: parsedData });
          } else if (actionType === 'ADMIN_ACTION') {
            result.push({ type: 'admin_action', content: parsedData });
          }
        } catch (e) {
          console.warn('Failed to parse Action tag JSON:', e, jsonStr);
          result.push({ type: 'text', content: match[0] });
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return result;
  }, [text]);

  // Helper to parse images from text blocks
  const renderTextAndImages = (rawText: string) => {
    if (!rawText) return null;

    const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s\)<>]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s\)<>]*)?)/gi;
    const segments: Array<{ type: 'text' | 'image'; content: string; alt?: string }> = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = imageRegex.exec(rawText)) !== null) {
      if (match.index > lastIdx) {
        const precedingText = rawText.slice(lastIdx, match.index);
        if (precedingText) {
          segments.push({ type: 'text', content: precedingText });
        }
      }

      if (match[2]) {
        segments.push({ type: 'image', content: match[2], alt: match[1] || 'AI Image' });
      } else if (match[3]) {
        segments.push({ type: 'image', content: match[3], alt: 'AI Image' });
      }

      lastIdx = imageRegex.lastIndex;
    }

    if (lastIdx < rawText.length) {
      const trailingText = rawText.slice(lastIdx);
      if (trailingText) {
        segments.push({ type: 'text', content: trailingText });
      }
    }

    return segments.map((seg, sIdx) => {
      if (seg.type === 'image') {
        return (
          <ChatImageItem
            key={sIdx}
            src={seg.content}
            alt={seg.alt}
            onPreview={onPreviewImage}
            lang={lang}
          />
        );
      }
      return (
        <div key={sIdx} className="leading-relaxed break-words [word-break:break-word] max-w-full overflow-hidden">
          <FormattedMarkdown text={seg.content} />
        </div>
      );
    });
  };

  return (
    <div className="space-y-2 max-w-full overflow-hidden break-words [word-break:break-word]">
      {parts.map((part, idx) => {
        if (part.type === 'card') {
          const tool = tools.find((t) => t.id === Number(part.content));
          if (!tool) return null;
          return (
            <div
              key={idx}
              className="my-2.5 p-3 bg-surface border border-accent/30 rounded-xl flex flex-col gap-2 shadow-lg hover:border-accent/60 transition-all max-w-full overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <AIFavicon
                    url={tool.url}
                    name={tool.name}
                    customIcon={tool.icon || tool.iconUrl || tool.logoUrl}
                    className="w-5 h-5 rounded shrink-0 border border-line"
                  />
                  <span className="font-bold text-fg text-xs truncate">{tool.name}</span>
                </div>
                <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-accent/20 text-brand font-semibold shrink-0">
                  {getCategoryLabel(tool.category, lang)}
                </span>
              </div>
              <p className="text-xs text-fg-2 line-clamp-2 leading-relaxed break-words [word-break:break-word]">
                {getToolDescription(tool, lang)}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-line text-xs">
                <span className="text-amber-400 font-mono text-[0.6875rem] font-medium bg-amber-400/10 px-2 py-0.5 rounded-md">
                  {getPriceLabel(tool.price, lang)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectTool?.(tool)}
                    className="px-2.5 py-1 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors text-[0.6875rem] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{UI_TEXT.common.viewDetails[lang]}</span>
                  </button>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-fg/10 hover:bg-fg/20 text-fg-2 rounded-lg font-medium transition-colors text-[0.6875rem] flex items-center gap-1 cursor-pointer"
                    title={UI_TEXT.card.visitSite[lang]}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        }

        if (part.type === 'prompt_handoff') {
          return (
            <PromptHandoffCard
              key={idx}
              data={part.content}
              lang={lang}
              onToast={onToast}
            />
          );
        }

        if (part.type === 'image_generate') {
          return (
            <InChatImageCard
              key={idx}
              data={part.content}
              lang={lang}
              onToast={onToast}
              onPreviewImage={onPreviewImage || (() => {})}
            />
          );
        }

        if (part.type === 'admin_action') {
          return (
            <AdminActionCard
              key={idx}
              data={part.content}
              currentUserEmail={currentUserEmail}
              lang={lang}
              onToast={onToast}
            />
          );
        }

        return <React.Fragment key={idx}>{renderTextAndImages(part.content as string)}</React.Fragment>;
      })}
    </div>
  );
};

const CHAT_STORAGE_KEY = 'aihub_chat_messages';

const getStoredChatMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load chat history from localStorage', e);
  }
  return [];
};

export const AIChatbot: React.FC<AIChatbotProps> = ({
  onOpenInquiryModal,
  lang = 'ko',
  tools = [],
  onSelectTool,
  selectedCategory = '전체',
  searchQuery = '',
  onSelectCategory,
  onSearch,
  currentUser,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt?: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Global Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getStoredSettings());

  const activeTools = useMemo(() => {
    return (tools || []).filter(
      (t) => !t.status || t.status === 'active' || t.status === 'renamed' || t.status === 'temporarily_unavailable'
    );
  }, [tools]);

  // Attachments State & Drag-and-Drop
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; type: string; content: string; size: number }>>([]);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Diagnostic Metrics State for Admin
  const [isAdminViewEnabled, setIsAdminViewEnabled] = useState(false);
  const [diagStats, setDiagStats] = useState<{
    online: boolean;
    httpRttMs?: number;
    apiStatus: string;
    jsErrorsCount: number;
    pageUrl: string;
    timestamp: string;
  }>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    apiStatus: '대기 중',
    jsErrorsCount: 0,
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
    timestamp: new Date().toLocaleTimeString(),
  });
  const [isRefreshingDiag, setIsRefreshingDiag] = useState(false);

  // Runtime JS Error Log Collector
  const capturedJsErrorsRef = useRef<Array<{
    type: string;
    message: string;
    source?: string;
    lineno?: number;
    timestamp: string;
  }>>([]);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Scroll visibility
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isKo = lang === 'ko';
  const isAdmin = currentUser?.isAdmin === true;

  // Developer command suggestions for authenticated admins
  const devSuggestions = useMemo(() => {
    if (!isAdmin) return [];
    return getDevCommandSuggestions(inputMessage);
  }, [isAdmin, inputMessage]);

  // Window Error & UnhandledRejection Listeners
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      capturedJsErrorsRef.current.unshift({
        type: event.error?.name || 'JavaScriptError',
        message: event.message || 'Unknown runtime error',
        source: event.filename,
        lineno: event.lineno,
        timestamp: new Date().toLocaleTimeString(),
      });
      if (capturedJsErrorsRef.current.length > 20) {
        capturedJsErrorsRef.current = capturedJsErrorsRef.current.slice(0, 20);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      capturedJsErrorsRef.current.unshift({
        type: 'UnhandledPromiseRejection',
        message: String(event.reason?.message || event.reason || 'Unhandled promise rejection'),
        timestamp: new Date().toLocaleTimeString(),
      });
      if (capturedJsErrorsRef.current.length > 20) {
        capturedJsErrorsRef.current = capturedJsErrorsRef.current.slice(0, 20);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Sync settings when changed externally
  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e.detail) {
        setUserSettings(e.detail);
      }
    };
    window.addEventListener('aihub_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('aihub_settings_changed', handleSettingsChange);
  }, []);

  // Real-time Site Diagnostics Metric Collector
  const fetchDiagnosticStats = async () => {
    setIsRefreshingDiag(true);
    let httpRttMs: number | undefined = undefined;
    let apiStatus = '정상 (Healthy)';

    try {
      const start = performance.now();
      const res = await fetch('/api/ping', { cache: 'no-store' });
      const end = performance.now();
      httpRttMs = Math.round(end - start);
      if (!res.ok) apiStatus = `오류 (${res.status})`;
    } catch (e) {
      apiStatus = '연결 실패 (Failed)';
    }

    const navEntry = typeof performance !== 'undefined' ? performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined : undefined;

    const snapshot = {
      timestamp: new Date().toISOString(),
      pageUrl: window.location.pathname + window.location.search,
      online: navigator.onLine,
      httpRttMs,
      apiStatus,
      jsErrorsCount: capturedJsErrorsRef.current.length,
      recentJsErrors: capturedJsErrorsRef.current.slice(0, 5),
      browserInfo: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentTheme: userSettings.theme || 'dark',
      performanceTiming: navEntry ? {
        dnsTimeMs: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
        connectTimeMs: Math.round(navEntry.connectEnd - navEntry.connectStart),
        responseStartMs: Math.round(navEntry.responseStart - navEntry.requestStart),
        domContentLoadedMs: Math.round(navEntry.domContentLoadedEventEnd - navEntry.fetchStart),
        loadEventMs: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),
      } : undefined,
    };

    setDiagStats({
      online: navigator.onLine,
      httpRttMs,
      apiStatus,
      jsErrorsCount: capturedJsErrorsRef.current.length,
      pageUrl: window.location.pathname + window.location.search,
      timestamp: new Date().toLocaleTimeString(),
    });

    setIsRefreshingDiag(false);
    return snapshot;
  };

  // Run initial diagnostic check when open if admin
  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchDiagnosticStats();
    }
  }, [isOpen, isAdmin]);

  // Update initial welcome message
  const welcomeText = useMemo(() => {
    if (isAdmin) {
      return isKo
        ? '👑 **관리자 전용 범용 AI 어시스턴트 & 사이트 운영 진단 도구**에 오신 것을 환영합니다!\n\n일반 지식, 프로그래밍, 코드 분석, 문서/이미지 분석 질문은 물론, 아래 명령으로 현재 사이트 상태를 실시간으로 확인할 수 있습니다:\n- **"현재 사이트 상태 확인해줘"**\n- **"지금 핑 얼마나 나와?"**\n- **"현재 발생한 오류 분석해줘"**\n- **"사이트 성능 분석해줘"**\n\n파일/이미지를 첨부하여 현재 사이트 상태와 함께 분석하는 것도 가능합니다.'
        : '👑 **Welcome to the Admin Universal AI Assistant & Site Operating Diagnostics Tool**!\n\nAsk any general knowledge, coding, file analysis questions, or inspect real-time site health:\n- **"Check site status"**\n- **"Check HTTP Ping RTT"**\n- **"Analyze current errors"**\n- **"Analyze site performance"**';
    }

    return isKo
      ? '안녕하세요! AI Hub AI 도구 탐색 어시스턴트입니다.\n\n원하시는 작업 목적(글쓰기, 이미지, 영상, 코딩 등)이나 찾으시는 AI 기능을 말씀해 주시면, AI Hub의 엄선된 도구 목록에서 가장 적합한 AI를 찾아 추천해 드릴게요!'
      : 'Hello! I am your AI Hub Tool Search & Recommendation Assistant.\n\nTell me what task you want to perform (writing, image, video, coding, etc.), and I will find and recommend the best AI tools from AI Hub!';
  }, [isKo, isAdmin]);

  // Comprehensive Multimodal File Processor (Images, Videos, PDFs, Text/Code Documents)
  const processFiles = (files: File[]) => {
    const maxFileSize = 25 * 1024 * 1024; // 25MB limit per file

    files.forEach((file: File) => {
      if (file.size > maxFileSize) {
        alert(
          isKo
            ? `파일 크기가 너무 큽니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB). 25MB 이하의 파일만 첨부 가능합니다.`
            : `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is 25MB.`
        );
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf';

      const reader = new FileReader();

      if (isImage || isVideo || isPdf) {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setAttachments((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              name: file.name || (isImage ? 'pasted-image.png' : isVideo ? 'pasted-video.mp4' : 'document.pdf'),
              type: file.type || (isImage ? 'image/png' : isVideo ? 'video/mp4' : 'application/pdf'),
              content: base64,
              size: file.size,
            },
          ]);
        };
        reader.onerror = () => {
          alert(isKo ? '파일을 읽는 중 오류가 발생했습니다.' : 'Failed to read file.');
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setAttachments((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              name: file.name || 'file.txt',
              type: file.type || 'text/plain',
              content: text,
              size: file.size,
            },
          ]);
        };
        reader.onerror = () => {
          alert(isKo ? '파일을 읽는 중 오류가 발생했습니다.' : 'Failed to read file.');
        };
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    e.target.value = '';
  };

  // Clipboard Paste Handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const filesToProcess: File[] = [];
      let hasImage = false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            filesToProcess.push(file);
            if (file.type.startsWith('image/')) {
              hasImage = true;
            }
          }
        }
      }

      if (filesToProcess.length > 0) {
        processFiles(filesToProcess);
        if (hasImage) {
          const noticeMsg = isKo
            ? '📋 클립보드 이미지가 첨부되었습니다. 분석할 질문을 입력하거나 바로 전송하세요.'
            : '📋 Clipboard image attached. Type a message or click send for AI analysis.';
          setPasteNotice(noticeMsg);
          setTimeout(() => setPasteNotice(null), 4500);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, isKo]);

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      }
      if (prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  }, [lang, welcomeText, isKo]);

  // Persist chat messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
      } catch (e) {
        console.error('Failed to save chat history to localStorage', e);
      }
    }
  }, [messages]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } else if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isUp);
  };

  // Auto-scroll to bottom whenever messages update, loading state changes, or chat box opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen]);

  // STT Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'en' ? 'en-US' : 'ko-KR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert(UI_TEXT.chatbot.micUnsupported[lang]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (e) {
        console.error('Mic start error:', e);
        setIsListening(false);
      }
    }
  };

  // TTS Readout via ttsManager
  const speakText = (text: string, msgId?: string) => {
    if (msgId && speakingMsgId === msgId) {
      ttsManager.stop();
      setSpeakingMsgId(null);
      return;
    }

    if (msgId) setSpeakingMsgId(msgId);

    const activeLang: Language = lang === 'en' ? 'en' : 'ko';

    ttsManager.speak(
      text,
      userSettings.tts,
      activeLang,
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    );
  };

  const copyToClipboard = (text: string, msgId: string) => {
    const cleanCopy = cleanTextForTTS(text);
    navigator.clipboard.writeText(cleanCopy);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Handle resetting chat
  const handleResetChat = () => {
    ttsManager.stop();
    if (abortControllerRef.current) abortControllerRef.current.abort();

    setSpeakingMsgId(null);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear chat history in localStorage', e);
      }
    }
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  // Stop response generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: isKo ? '⏹ 답변 생성이 중지되었습니다.' : '⏹ Response generation stopped.',
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  // Primary send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = textToSend || inputMessage;
    let query = rawQuery.trim();
    if ((!query && attachments.length === 0) || isLoading) return;

    if (!query && attachments.length > 0) {
      query = isKo ? '첨부된 파일/이미지/영상을 분석해줘.' : 'Please analyze the attached file/image/video.';
    }

    if (query === '처음부터 다시' || query.toLowerCase() === 'reset') {
      handleResetChat();
      return;
    }

    const currentAttachments = [...attachments];

    // Handle Developer & Operator Commands (/dev, /op)
    if (isDeveloperCommandInput(query)) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!textToSend) setInputMessage('');
      setAttachments([]);

      // 1. Strict Developer Authorization Check
      if (!isAdmin) {
        logDevEvent('WARN', 'AUTH', `Unauthorized developer command attempt: "${query}"`, {
          details: `User: ${currentUser?.email || 'Anonymous'}`,
        });

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: isKo
            ? '이 명령어는 개발자 권한이 필요합니다.'
            : 'This command requires developer permissions.',
          timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOperatorCommand: true,
          permissionDenied: true,
        };

        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      // 2. Verified Admin / Developer Execution
      const parsed = parseDeveloperCommand(query);
      const startTime = Date.now();
      const currentDiag = await fetchDiagnosticStats();

      const result = await executeDeveloperCommand(parsed, {
        lang,
        currentUser,
        tools: activeTools,
        userSettings,
        selectedCategory,
        searchQuery,
        diagStats: currentDiag,
        onClearChat: () => {
          handleResetChat();
        },
        onReloadData: async () => {
          await fetchDiagnosticStats();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('aihub_refresh_data'));
          }
        },
      });

      const latency = Date.now() - startTime;
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOperatorCommand: true,
        permissionDenied: result.permissionDenied,
        debugInfo: {
          model: 'gemini-3.6-flash',
          responseTimeMs: latency,
          catalogCount: activeTools.length,
          selectedCategory,
          searchQuery: searchQuery || 'None',
          operatorEmail: currentUser?.email || 'Admin',
          status: 'SUCCESS',
        },
      };

      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    logDevEvent('INFO', 'CHAT', `User query dispatched: "${query.slice(0, 45)}"`, {
      details: `Attachments: ${currentAttachments.length}`,
    });

    const requestStartTime = Date.now();
    abortControllerRef.current = new AbortController();

    try {
      if (IS_STATIC_SITE) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: answerFromCatalog(query, activeTools, lang),
          timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (userSettings.tts.enabled && userSettings.tts.autoPlay) {
          speakText(botMsg.text, botMsg.id);
        }
        return;
      }

      const userEmail = currentUser?.email || '';

      // Collect real-time diagnostic snapshot if admin
      let siteStatusData = undefined;
      if (isAdmin) {
        siteStatusData = await fetchDiagnosticStats();
      }

      setAttachments([]);

      const response = await safeFetchJson<{
        reply: string;
        error?: string;
        isOperatorCommand?: boolean;
        permissionDenied?: boolean;
        debugInfo?: any;
      }>('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          userQuery: query,
          userEmail,
          messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
          lang,
          toolsCatalog: activeTools,
          currentCategory: selectedCategory,
          searchQuery,
          siteStatusData,
          attachments: currentAttachments,
        }),
        signal: abortControllerRef.current.signal,
      });

      const latency = Date.now() - requestStartTime;
      let botReply = response.data?.reply || response.error;
      if (!botReply) {
        botReply = UI_TEXT.chatbot.errorReply[lang];
      }

      logDevEvent('SUCCESS', 'API', 'Gemini response received', {
        responseTimeMs: latency,
        details: `Status: 200 OK`,
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOperatorCommand: response.data?.isOperatorCommand,
        permissionDenied: response.data?.permissionDenied,
        debugInfo: response.data?.debugInfo,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Auto TTS readout if enabled and not an operator permission error
      if (userSettings.tts.enabled && userSettings.tts.autoPlay && !response.data?.permissionDenied) {
        speakText(botReply, botMsg.id);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const latency = Date.now() - requestStartTime;
      logDevEvent('ERROR', 'API', `Chatbot request failed: ${err?.message || 'Network error'}`, {
        responseTimeMs: latency,
      });

      console.error('Chat error:', err);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: isKo
          ? '죄송합니다. 네트워크 요청 중 문제가 발생했습니다. 다시 시도해 주시거나 담당자에게 문의해 주세요.'
          : 'Sorry, a network error occurred. Please try again or contact support.',
        timestamp: new Date().toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isError: true,
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[90] p-4 bg-gradient-to-r from-accent to-mint text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
          title={UI_TEXT.chatbot.title[lang]}
        >
          <Bot className="w-7 h-7 animate-pulse" />
          {isAdmin && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-bg flex items-center justify-center text-[0.6875rem]">
              👑
            </span>
          )}
        </button>
      )}

      {/* Main Responsive Floating Chat Box Container */}
      {isOpen && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] bg-surface border rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5 box-border ${
            isDragging ? 'border-mint ring-2 ring-mint/40 shadow-mint/20 shadow-2xl' : 'border-line-strong'
          }`}
          style={{
            width: 'min(400px, calc(100vw - 32px))',
            height: 'min(700px, calc(100dvh - 32px))',
          }}
        >
          {/* Drag & Drop Visual Backdrop Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-md border-2 border-dashed border-mint rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in pointer-events-none">
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-full mb-3 animate-bounce">
                <UploadCloud className="w-10 h-10 text-mint" />
              </div>
              <h3 className="text-base font-bold text-fg mb-1">
                {isKo ? '파일을 여기에 놓아주세요' : 'Drop files here'}
              </h3>
              <p className="text-xs text-fg-2">
                {isKo ? '이미지, 영상, 문서, 코드 파일을 자동으로 첨부합니다' : 'Images, videos, documents, & code will be attached'}
              </p>
            </div>
          )}
          {/* Header */}
          <div className="bg-surface-2 px-4 py-3 border-b border-line flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-accent to-mint flex items-center justify-center text-white shadow-md shadow-accent/20">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-line" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-fg text-xs sm:text-sm truncate">
                    {UI_TEXT.chatbot.title[lang]}
                  </h3>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[0.6875rem] font-extrabold tracking-wider shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        DEV MODE
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[0.6875rem] font-extrabold tracking-wider shrink-0 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 fill-current text-amber-400" />
                        OP
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[0.6875rem] text-muted truncate">
                  {selectedCategory !== '전체' ? `Category: ${selectedCategory}` : UI_TEXT.chatbot.subtitle[lang]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Admin View Overlay Toggle (Operator Only) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    const next = !isAdminViewEnabled;
                    setIsAdminViewEnabled(next);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('aihub_admin_overlay_toggle', { detail: { enabled: next } }));
                    }
                  }}
                  className={`px-2 py-1 text-[0.6875rem] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isAdminViewEnabled
                      ? 'bg-amber-500/25 text-amber-300 border-amber-400/60 shadow-sm shadow-amber-500/30 ring-1 ring-amber-400/50'
                      : 'bg-fg/5 text-muted hover:text-fg-2 border-line hover:bg-fg/10'
                  }`}
                  title={isKo ? '대시보드 실시간 오버레이 패널 토글' : 'Toggle Real-time Status Overlay'}
                >
                  <Activity className={`w-3 h-3 ${isAdminViewEnabled ? 'text-amber-400 animate-pulse' : 'text-muted'}`} />
                  <span>Admin View {isAdminViewEnabled ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Reset Chat Button */}
              <button
                onClick={handleResetChat}
                className="p-1.5 text-muted hover:text-fg hover:bg-fg/10 rounded-lg transition-colors cursor-pointer"
                title={isKo ? '대화 초기화' : 'Reset Conversation'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-1.5 text-muted hover:text-fg hover:bg-fg/10 rounded-lg transition-colors cursor-pointer"
                  title={UI_TEXT.settings.title[lang]}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted hover:text-fg hover:bg-fg/10 rounded-lg transition-colors cursor-pointer"
                title={UI_TEXT.chatbot.closeBtn[lang]}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Live Site Status Diagnostic Panel (Renders smoothly in flex column when Admin View is enabled) */}
          {isAdmin && isAdminViewEnabled && (
            <div className="bg-surface border-b border-amber-400/30 p-2.5 text-[0.6875rem] font-mono text-fg-2 shrink-0 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between font-bold text-amber-300 mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>실시간 사이트 진단 패널 (OPERATOR)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={fetchDiagnosticStats}
                    disabled={isRefreshingDiag}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-[0.6875rem] font-sans font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="진단 정보 갱신"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingDiag ? 'animate-spin text-amber-300' : ''}`} />
                    <span>측정</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminViewEnabled(false);
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('aihub_admin_overlay_toggle', { detail: { enabled: false } }));
                      }
                    }}
                    className="p-1 text-muted hover:text-rose-300 hover:bg-rose-500/20 rounded cursor-pointer transition-colors"
                    title="패널 접기"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[0.6875rem] text-fg-2 bg-inset p-2 rounded-xl border border-line">
                <div className="flex items-center justify-between">
                  <span className="text-muted">네트워크:</span>
                  <span className="text-emerald-400 font-bold">{diagStats.online ? '● Online' : '○ Offline'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">HTTP RTT:</span>
                  <span className="text-amber-300 font-bold">{diagStats.httpRttMs !== undefined ? `${diagStats.httpRttMs} ms` : '측정중...'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">API Health:</span>
                  <span className="text-indigo-300 font-bold truncate max-w-[90px]">{diagStats.apiStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">JS Error:</span>
                  <span className={diagStats.jsErrorsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{diagStats.jsErrorsCount}건</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Badge Bar */}
          {(selectedCategory !== '전체' || searchQuery) && (
            <div className="bg-bg px-3 py-1.5 border-b border-line flex items-center justify-between text-[0.6875rem] text-indigo-300 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Filter className="w-3 h-3 text-mint shrink-0" />
                <span className="truncate">
                  {selectedCategory !== '전체' && `카테고리: ${selectedCategory}`}
                  {searchQuery && ` | 검색: "${searchQuery}"`}
                </span>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3.5 no-scrollbar relative min-w-0 max-w-full"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col min-w-0 max-w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 min-w-0 max-w-full">
                  {msg.sender === 'bot' ? (
                    <span className="text-[0.6875rem] font-bold text-muted flex items-center gap-1 truncate">
                      <Sparkles className="w-3 h-3 text-mint shrink-0" /> AI Hub Assistant
                    </span>
                  ) : (
                    <span className="text-[0.6875rem] font-bold text-muted flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-brand shrink-0" />
                      <span className="truncate">{currentUser?.displayName || (isKo ? '나' : 'Me')}</span>
                      {isAdmin && <Crown className="w-2.5 h-2.5 text-amber-400 fill-current shrink-0" />}
                    </span>
                  )}
                  <span className="text-[0.6875rem] text-muted font-mono shrink-0 flex items-center gap-1 bg-fg/5 px-1.5 py-0.5 rounded-md border border-line">
                    <Clock className="w-2.5 h-2.5 text-muted shrink-0" />
                    <span>{msg.timestamp || 'Just now'}</span>
                  </span>
                </div>

                <div
                  className={`max-w-[88%] sm:max-w-[85%] p-3 rounded-2xl text-xs overflow-hidden break-words [word-break:break-word] min-w-0 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-accent to-accent-hover text-white rounded-tr-none shadow-md'
                      : msg.isError || msg.permissionDenied
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-tl-none'
                      : msg.isOperatorCommand
                      ? 'bg-surface-2 border border-amber-400/40 text-amber-200 rounded-tl-none shadow-md font-mono'
                      : 'bg-surface-2 border border-line text-fg-2 rounded-tl-none shadow-md'
                  }`}
                >
                  {/* User attached files inside message bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {msg.attachments.map((att) => {
                        if (att.type.startsWith('image/')) {
                          return (
                            <div
                              key={att.id}
                              onClick={() => setPreviewImage({ url: att.content, alt: att.name })}
                              className="relative group rounded-xl overflow-hidden border border-line-strong cursor-pointer max-w-[180px] bg-inset shadow-md hover:scale-[1.02] transition-transform"
                            >
                              <img src={att.content} alt={att.name} className="w-full h-24 object-cover" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                              <div className="absolute bottom-0 inset-x-0 p-1 bg-black/70 backdrop-blur-xs text-[0.6875rem] text-gray-200 truncate">
                                {att.name}
                              </div>
                            </div>
                          );
                        }
                        if (att.type.startsWith('video/')) {
                          return (
                            <div key={att.id} className="relative rounded-xl overflow-hidden border border-amber-400/30 max-w-[220px] bg-black/80 p-1.5 shadow-md">
                              <video src={att.content} controls className="w-full max-h-32 rounded-lg" />
                              <div className="text-[0.6875rem] font-bold text-amber-300 truncate mt-1 flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span className="truncate">{att.name}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={att.id} className="px-2.5 py-1.5 bg-inset border border-line-strong rounded-xl text-[0.6875rem] text-indigo-200 flex items-center gap-1.5 max-w-[200px]">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate font-medium">{att.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <ChatMessageContent
                    text={msg.text}
                    tools={activeTools}
                    lang={lang}
                    currentUserEmail={currentUser?.email}
                    onSelectTool={onSelectTool}
                    onPreviewImage={(url, alt) => setPreviewImage({ url, alt })}
                    onToast={(m) => setToastMsg(m)}
                  />

                  {/* User message timestamp label inside bubble */}
                  {msg.sender === 'user' && (
                    <div className="flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-line text-[0.6875rem] text-indigo-100/80 font-mono">
                      <Clock className="w-2.5 h-2.5 shrink-0 text-indigo-200" />
                      <span>{msg.timestamp || 'Just now'}</span>
                    </div>
                  )}

                  {/* Operator Debug Box if present */}
                  {msg.debugInfo && (
                    <div className="mt-3 pt-2 border-t border-amber-400/20 text-[0.6875rem] font-mono space-y-1 bg-inset p-2 rounded-xl text-amber-300 max-w-full overflow-hidden min-w-0">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Bug className="w-3 h-3 shrink-0" />
                        <span>OPERATOR DEBUG METADATA</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[0.6875rem] text-fg-2 min-w-0">
                        <div className="truncate">Model: <span className="text-fg">{msg.debugInfo.model}</span></div>
                        <div className="truncate">Latency: <span className="text-emerald-400">{msg.debugInfo.responseTimeMs}ms</span></div>
                        <div className="truncate">Catalog: <span className="text-fg">{msg.debugInfo.catalogCount} tools</span></div>
                        <div className="truncate">Status: <span className="text-emerald-400">{msg.debugInfo.status}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Message Action Bar for Bot (Listen / Stop & Copy) with Timestamp */}
                  {msg.sender === 'bot' && !msg.isError && (
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-2 pt-2 border-t border-line text-[0.6875rem] text-muted min-w-0 max-w-full">
                      <span className="text-[0.6875rem] text-muted/90 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5 shrink-0 text-mint" />
                        <span>{msg.timestamp || 'Just now'}</span>
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[0.6875rem] font-medium transition-all cursor-pointer shrink-0 ${
                            speakingMsgId === msg.id
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-fg/5 hover:bg-fg/10 text-fg-2 hover:text-fg border border-line'
                          }`}
                          aria-label={speakingMsgId === msg.id ? UI_TEXT.chatbot.stop[lang] : UI_TEXT.chatbot.listen[lang]}
                          title={speakingMsgId === msg.id ? UI_TEXT.chatbot.stop[lang] : UI_TEXT.chatbot.listen[lang]}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <Square className="w-3 h-3 fill-current text-rose-400 shrink-0" />
                              <span>{UI_TEXT.chatbot.stop[lang]}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-mint shrink-0" />
                              <span>{UI_TEXT.chatbot.listen[lang]}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-fg/5 hover:bg-fg/10 text-fg-2 hover:text-fg border border-line rounded-lg text-[0.6875rem] font-medium transition-all cursor-pointer shrink-0"
                          aria-label={copiedMsgId === msg.id ? UI_TEXT.chatbot.copied[lang] : UI_TEXT.chatbot.copy[lang]}
                          title={UI_TEXT.chatbot.copy[lang]}
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-mint shrink-0" />
                              <span className="text-mint">{UI_TEXT.chatbot.copied[lang]}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 shrink-0" />
                              <span>{UI_TEXT.chatbot.copy[lang]}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Subtle Typing / Processing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3.5 h-3.5 text-mint animate-spin shrink-0" />
                  <span className="text-[0.6875rem] font-bold text-muted">
                    AI Hub Assistant
                  </span>
                </div>
                <div className="bg-surface-2 border border-line p-3 rounded-2xl rounded-tl-none flex items-center gap-3 text-xs text-fg-2 shadow-md">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-mint animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-fg-2 font-medium animate-pulse">
                    {isKo ? '답변을 작성하고 있습니다...' : 'AI is typing a response...'}
                  </span>
                  <button
                    onClick={handleStopGeneration}
                    className="ml-auto px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[0.6875rem] font-medium transition-colors cursor-pointer shrink-0"
                    title={isKo ? '생성 중단' : 'Stop response generation'}
                  >
                    {isKo ? '중단' : 'Stop'}
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom floating button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-20 right-4 z-10 p-2 bg-accent text-white rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Quick Suggested Prompts Chips */}
          <div className="bg-bg px-3 py-2 border-t border-line flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 max-h-[90px] flex-wrap">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleSendMessage(isKo ? '현재 웹사이트 상태 종합 점검해줘' : 'Check website status')}
                  className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-xl text-[0.6875rem] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>사이트 상태</span>
                </button>
                <button
                  onClick={() => handleSendMessage(isKo ? '현재 핑 및 응답 지연시간(RTT) 측정 결과를 알려줘' : 'Check ping latency RTT')}
                  className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 rounded-xl text-[0.6875rem] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>핑 / RTT</span>
                </button>
                <button
                  onClick={() => handleSendMessage(isKo ? '현재 웹사이트에 발생한 JavaScript 런타임 오류 보여줘' : 'Show recent JS errors')}
                  className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 rounded-xl text-[0.6875rem] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <Bug className="w-3 h-3 text-rose-400" />
                  <span>오류 분석</span>
                </button>
                <button
                  onClick={() => handleSendMessage(isKo ? '페이지 성능 및 로딩 시간 지표 분석해줘' : 'Analyze page performance')}
                  className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 rounded-xl text-[0.6875rem] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>성능 지표</span>
                </button>
                <button
                  onClick={() => handleSendMessage('/op help')}
                  className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-300 rounded-xl text-[0.6875rem] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3 text-purple-400" />
                  <span>/op help</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage(isKo ? '글쓰기 및 문서 작성 AI 도구를 추천해줘' : 'Recommend AI writing tools')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-accent/20 border border-line hover:border-accent/40 text-fg-2 hover:text-fg rounded-xl text-[0.6875rem] transition-all cursor-pointer whitespace-nowrap"
                >
                  {UI_TEXT.chatbot.prompts.writing[lang]}
                </button>
                <button
                  onClick={() => handleSendMessage(isKo ? '이미지 및 디자이너용 AI 도구를 알려줘' : 'Show me image generation AI tools')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-accent/20 border border-line hover:border-accent/40 text-fg-2 hover:text-fg rounded-xl text-[0.6875rem] transition-all cursor-pointer whitespace-nowrap"
                >
                  {UI_TEXT.chatbot.prompts.image[lang]}
                </button>
                <button
                  onClick={() => handleSendMessage(isKo ? '개발 및 코딩 자동화 AI 도구를 추천해줘' : 'Recommend coding AI tools')}
                  className="px-2.5 py-1 bg-surface-2 hover:bg-accent/20 border border-line hover:border-accent/40 text-fg-2 hover:text-fg rounded-xl text-[0.6875rem] transition-all cursor-pointer whitespace-nowrap"
                >
                  {UI_TEXT.chatbot.prompts.dev[lang]}
                </button>
              </>
            )}
          </div>

          {/* Clipboard Paste Notification Banner */}
          {pasteNotice && (
            <div className="bg-accent/20 text-mint px-3 py-1.5 text-xs font-medium border-t border-accent/30 flex items-center justify-between gap-2 animate-in fade-in shrink-0">
              <span className="truncate">{pasteNotice}</span>
              <button
                onClick={() => setPasteNotice(null)}
                className="text-muted hover:text-fg text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Attached Files Preview Bar */}
          {attachments.length > 0 && (
            <div className="bg-surface px-3 py-2 border-t border-line flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="px-2.5 py-1 bg-surface-2 border border-line rounded-xl text-[0.6875rem] text-fg-2 flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    {att.type.startsWith('image/') ? (
                      <div className="flex items-center gap-1.5">
                        <img src={att.content} alt={att.name} className="w-4 h-4 rounded object-cover shrink-0" />
                        <span className="max-w-[100px] truncate font-medium">{att.name}</span>
                      </div>
                    ) : att.type.startsWith('video/') ? (
                      <div className="flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="max-w-[100px] truncate font-medium">{att.name}</span>
                        <span className="text-[0.6875rem] bg-amber-400/20 text-amber-300 font-bold px-1 rounded shrink-0">VIDEO</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="max-w-[100px] truncate font-medium">{att.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                      className="p-0.5 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors cursor-pointer ml-1"
                      title={isKo ? '삭제' : 'Remove'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {attachments.length > 1 && (
                <button
                  onClick={() => setAttachments([])}
                  className="text-[0.6875rem] text-muted hover:text-rose-300 transition-colors cursor-pointer shrink-0 px-2 py-1 bg-fg/5 hover:bg-fg/10 rounded-lg whitespace-nowrap"
                >
                  {isKo ? '전체 삭제' : 'Clear All'}
                </button>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            accept="image/*,video/*,application/pdf,.txt,.json,.csv,.js,.ts,.py,.html,.css,.md,.doc,.docx,.xls,.xlsx"
          />

          {/* Developer Command Autocomplete Suggestions (Authenticated Developer Only) */}
          {isAdmin && inputMessage.startsWith('/') && devSuggestions.length > 0 && (
            <div className="bg-surface border-t border-indigo-500/30 px-3 py-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 shadow-inner">
              <div className="flex items-center justify-between mb-1.5 text-[0.6875rem] text-indigo-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  {isKo ? '개발자 전용 명령어' : 'Developer Commands'}
                </span>
                <span className="text-muted font-mono text-[0.6875rem]">/dev &lt;cmd&gt;</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {devSuggestions.map((cmd) => (
                  <button
                    key={cmd.syntax}
                    onClick={() => {
                      setInputMessage(cmd.syntax);
                    }}
                    className="px-2 py-1 bg-surface-2 hover:bg-indigo-600/30 border border-line hover:border-indigo-400/60 text-fg-2 hover:text-fg rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer text-left group"
                  >
                    <span className="text-mint group-hover:text-amber-300 font-bold">{cmd.syntax}</span>
                    <span className="text-[0.6875rem] text-muted group-hover:text-fg-2">
                      - {isKo ? cmd.descriptionKo : cmd.descriptionEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Bar */}
          <div className="bg-surface-2 p-3 border-t border-line flex items-center gap-1.5 shrink-0">
            {/* File Upload Button (attachments need the chat server) */}
            {!IS_STATIC_SITE && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-surface hover:bg-fg/10 text-muted hover:text-fg border border-line rounded-xl transition-all cursor-pointer shrink-0"
                title={isKo ? '파일/이미지 첨부' : 'Attach file/image'}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            {/* Mic STT Button */}
            <button
              onClick={toggleMicListening}
              className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-surface hover:bg-fg/10 text-muted hover:text-fg border border-line'
              }`}
              title={UI_TEXT.chatbot.voiceInput[lang]}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input Text Field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isListening
                  ? UI_TEXT.chatbot.listeningText[lang]
                  : isAdmin
                  ? '질문, 코드, 파일 분석 또는 사이트 상태 문의...'
                  : isKo
                  ? '찾으시는 AI 도구나 목적을 질문해보세요...'
                  : 'Ask about any AI tools or goals...'
              }
              disabled={isLoading}
              className="flex-1 bg-surface border border-line focus:border-accent text-fg rounded-xl px-3 py-2 text-xs focus:outline-none placeholder:text-subtle min-w-0"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputMessage.trim() && attachments.length === 0) || isLoading}
              className="p-2 bg-gradient-to-r from-accent to-mint disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-md shadow-accent/20"
              title={UI_TEXT.chatbot.send[lang]}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      <ImagePreviewModal
        imageUrl={previewImage?.url || null}
        altText={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
        lang={lang}
      />

      {/* Action Toast Notification */}
      {toastMsg && <ActionToast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </>,
    document.body
  );
};
