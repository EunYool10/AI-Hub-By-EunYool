import React, { useEffect, useState } from 'react';
import { X, Crown, Trash2, Mail, CheckCircle2, MessageSquare, Plus, RefreshCw, Shield, AlertCircle, Copy, Megaphone, FileText, BarChart2 } from 'lucide-react';
import { UserProfile } from './GoogleLoginModal';
import { NoticeItem, AITool } from '../types';
import { safeFetchJson } from '../lib/api';
import { CategoryChartDashboard } from './CategoryChartDashboard';
import { Language } from '../lib/translations';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  tools: AITool[];
  onAddTool: (tool: { name: string; category: string; description: string; url: string; price: string; isCustom: boolean }) => void;
  onSuccess: (msg: string) => void;
  lang?: Language;
  onSelectCategory?: (cat: string) => void;
  onOpenAdminConsole?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tools,
  onAddTool,
  onSuccess,
  lang = 'ko',
  onSelectCategory,
  onOpenAdminConsole,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'addTool' | 'addNotice' | 'stats'>('inquiries');

  // New tool form state
  const [toolName, setToolName] = useState('');
  const [toolCategory, setToolCategory] = useState('기획/글쓰기');
  const [toolDesc, setToolDesc] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [toolPrice, setToolPrice] = useState('무료');

  // New notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'IMPORTANT' | 'UPDATE' | 'NOTICE'>('NOTICE');
  const [noticeContent, setNoticeContent] = useState('');

  const fetchNotices = async () => {
    const res = await safeFetchJson<{ notices: NoticeItem[] }>('/api/notices');
    if (res.ok && res.data?.notices && Array.isArray(res.data.notices)) {
      setNotices(res.data.notices);
      localStorage.setItem('ai_hub_notices', JSON.stringify(res.data.notices));
      return;
    }

    try {
      const local = localStorage.getItem('ai_hub_notices');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) setNotices(parsed);
      } else {
        setNotices([]);
      }
    } catch (e) {
      setNotices([]);
    }
  };

  const fetchInquiries = async () => {
    if (!currentUser || !currentUser.isAdmin) return;
    setIsLoading(true);

    try {
      const response = await safeFetchJson<{ inquiries: Inquiry[] }>('/api/admin/inquiries', {
        headers: {
          'x-user-email': currentUser.email,
        },
      });
      if (response.ok && response.data) {
        setInquiries(response.data.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin inquiries', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.isAdmin) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      fetchInquiries();
      fetchNotices();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser?.isAdmin) return null;

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    try {
      const response = await safeFetchJson<{ notice: NoticeItem }>('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          category: noticeCategory,
          content: noticeContent.trim(),
        }),
      });

      if (response.ok && response.data?.notice) {
        const updated = [response.data.notice, ...notices];
        setNotices(updated);
        localStorage.setItem('ai_hub_notices', JSON.stringify(updated));
        window.dispatchEvent(new Event('ai_hub_notice_updated'));
        onSuccess('새로운 공식 공지사항이 성공적으로 등록되었습니다!');
      } else {
        // Fallback local creation
        const newNoticeItem: NoticeItem = {
          id: `notice-${Date.now()}`,
          title: noticeTitle.trim(),
          category: noticeCategory,
          content: noticeContent.trim(),
          createdAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          author: '관리자',
        };
        const updated = [newNoticeItem, ...notices];
        setNotices(updated);
        localStorage.setItem('ai_hub_notices', JSON.stringify(updated));
        window.dispatchEvent(new Event('ai_hub_notice_updated'));
        onSuccess('공지사항이 등록되었습니다 (로컬 저장이 완료되었습니다).');
      }
    } catch (err) {
      console.error(err);
      const newNoticeItem: NoticeItem = {
        id: `notice-${Date.now()}`,
        title: noticeTitle.trim(),
        category: noticeCategory,
        content: noticeContent.trim(),
        createdAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        author: '관리자',
      };
      const updated = [newNoticeItem, ...notices];
      setNotices(updated);
      localStorage.setItem('ai_hub_notices', JSON.stringify(updated));
      window.dispatchEvent(new Event('ai_hub_notice_updated'));
      onSuccess('공지사항이 추가되었습니다.');
    } finally {
      setNoticeTitle('');
      setNoticeContent('');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

    try {
      await safeFetchJson(`/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email,
        },
      });
    } catch (e) {
      console.warn(e);
    }

    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    localStorage.setItem('ai_hub_notices', JSON.stringify(updated));
    window.dispatchEvent(new Event('ai_hub_notice_updated'));
    onSuccess('공지사항이 삭제되었습니다.');
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('이 문의사항 내역을 삭제하시겠습니까?')) return;

    try {
      const response = await safeFetchJson(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email,
        },
      });

      if (response.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        onSuccess('문의 내역이 삭제되었습니다.');
      } else {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        onSuccess('문의 내역 삭제 처리 완료');
      }
    } catch (err) {
      console.error(err);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      onSuccess('문의 내역 삭제 처리 완료');
    }
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !toolDesc.trim()) return;

    let formattedUrl = toolUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAddTool({
      name: toolName.trim(),
      category: toolCategory,
      description: toolDesc.trim(),
      url: formattedUrl || 'https://google.com',
      price: toolPrice,
      isCustom: true,
    });

    setToolName('');
    setToolDesc('');
    setToolUrl('');
    onSuccess(`관리자 권한으로 '${toolName}' AI 도구가 성공적으로 등록되었습니다!`);
    setActiveTab('inquiries');
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    onSuccess(`이메일(${email})이 복사되었습니다.`);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151f] border border-amber-400/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Space_Grotesk'] text-xl font-extrabold text-white">
                  최고 관리자 대시보드
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-gray-400">
                로그인 계정: <strong className="text-amber-300">{currentUser.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminConsole && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminConsole();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                title="전체 통합 관리자 콘솔로 전환"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>전체 콘솔 열기</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-[#1a1d2a] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>접수된 문의사항 ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addTool')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'addTool'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-[#1a1d2a] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>AI 도구 즉시 등록</span>
          </button>

          <button
            onClick={() => setActiveTab('addNotice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'addNotice'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-[#1a1d2a] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>공지사항 관리 ({notices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-[#1a1d2a] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>카테고리 통계</span>
          </button>
        </div>

        {/* Tab 1: Inquiries List */}
        {activeTab === 'inquiries' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>수신처: deer123424@gmail.com</span>
              <button
                onClick={fetchInquiries}
                className="flex items-center gap-1 text-[#00d4aa] hover:underline cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-10 bg-[#1a1d2a]/50 rounded-2xl border border-white/5">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-gray-400 font-medium">
                  현재 대기 중인 문의사항이 없습니다.
                </p>
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#1a1d2a] border border-white/10 rounded-2xl p-4 space-y-2 hover:border-amber-400/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/30">
                        {inq.type}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {inq.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteInquiry(inq.id)}
                      className="p-1 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="문의 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-[#13151f] p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                    {inq.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span>작성자: <strong className="text-gray-200">{inq.name}</strong></span>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyEmail(inq.email)}
                        className="flex items-center gap-1 text-amber-300 hover:underline cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{inq.email}</span>
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <span className="text-gray-500">
                      {new Date(inq.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Add AI Tool */}
        {activeTab === 'addTool' && (
          <form onSubmit={handleCreateTool} className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>관리자 전용 기능: 여기서 등록한 AI 도구는 메인 화면에 즉시 공개 등록됩니다.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  AI 도구명 *
                </label>
                <input
                  type="text"
                  required
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="예: Claude 3.5 Sonnet"
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  카테고리
                </label>
                <select
                  value={toolCategory}
                  onChange={(e) => setToolCategory(e.target.value)}
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="기획/글쓰기">기획/글쓰기</option>
                  <option value="디자인/이미지">디자인/이미지</option>
                  <option value="영상/오디오">영상/오디오</option>
                  <option value="번역/어학">번역/어학</option>
                  <option value="개발/데이터">개발/데이터</option>
                  <option value="생산성/협업">생산성/협업</option>
                  <option value="마케팅/분석">마케팅/분석</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  웹사이트 URL
                </label>
                <input
                  type="text"
                  value={toolUrl}
                  onChange={(e) => setToolUrl(e.target.value)}
                  placeholder="https://claude.ai"
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  가격 정책
                </label>
                <select
                  value={toolPrice}
                  onChange={(e) => setToolPrice(e.target.value)}
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="무료">무료 (Free)</option>
                  <option value="유료">유료 (Paid)</option>
                  <option value="부분무료">부분무료 (Freemium)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                도구 설명 *
              </label>
              <textarea
                required
                rows={3}
                value={toolDesc}
                onChange={(e) => setToolDesc(e.target.value)}
                placeholder="AI 도구의 핵심 기능과 주요 활용 사례를 간략히 설명하세요."
                className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              👑 즉시 공개 등록하기
            </button>
          </form>
        )}

        {/* Tab 3: Notice Management */}
        {activeTab === 'addNotice' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {/* Create Notice Form */}
            <form onSubmit={handleCreateNotice} className="bg-[#1a1d2a] p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>새로운 공식 공지사항 작성</span>
                </span>
                <span className="text-[10px] text-gray-400">작성 즉시 공지사항 모달에 게재됩니다</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    공지사항 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="예: [안내] AI Hub 서비스 점검 및 기능 업데이트 안내"
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    분류 태그
                  </label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full bg-[#13151f] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="NOTICE">일반 안내 (NOTICE)</option>
                    <option value="UPDATE">신규 업데이트 (UPDATE)</option>
                    <option value="IMPORTANT">중요 공지 (IMPORTANT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  공지사항 본문 내용 *
                </label>
                <textarea
                  required
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="사용자들에게 전달할 공지사항 상세 내용을 입력하세요."
                  className="w-full bg-[#13151f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                📢 공식 공지사항 즉시 게시하기
              </button>
            </form>

            {/* Existing Notice List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-300 font-bold">
                <span>등록된 공지사항 목록 ({notices.length}개)</span>
              </div>

              {notices.length === 0 ? (
                <div className="text-center py-6 bg-[#1a1d2a]/50 rounded-xl border border-white/5 text-xs text-gray-400">
                  현재 등록된 공지사항이 없습니다. 위 서식에서 새 공지사항을 작성해보세요.
                </div>
              ) : (
                notices.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1a1d2a] border border-white/10 p-3.5 rounded-xl space-y-1.5 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-gray-400">{item.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed bg-[#13151f] p-2 rounded-lg border border-white/5">
                        {item.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="공지 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Category Distribution Chart */}
        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3">
            <CategoryChartDashboard
              tools={tools}
              selectedCategory="전체"
              onSelectCategory={(cat) => {
                if (onSelectCategory) onSelectCategory(cat);
                onClose();
              }}
              lang={lang}
            />
          </div>
        )}
      </div>
    </div>
  );
};
