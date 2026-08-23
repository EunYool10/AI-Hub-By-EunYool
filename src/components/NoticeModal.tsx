import React, { useEffect, useState } from 'react';
import { X, Megaphone, Calendar, ArrowLeft, User, Sparkles, AlertCircle, ChevronRight, Bell } from 'lucide-react';
import { NoticeItem } from '../types';
import { safeFetchJson } from '../lib/api';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  lang,
  isAdmin,
  onOpenAdminModal,
}) => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load notices from API / LocalStorage
  const loadNotices = async () => {
    setIsLoading(true);
    const result = await safeFetchJson<{ notices: NoticeItem[] }>('/api/notices');
    if (result.ok && result.data?.notices && Array.isArray(result.data.notices)) {
      setNotices(result.data.notices);
      localStorage.setItem('ai_hub_notices', JSON.stringify(result.data.notices));
      setIsLoading(false);
      return;
    }

    // Fallback to localstorage
    try {
      const local = localStorage.getItem('ai_hub_notices');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setNotices(parsed);
        }
      } else {
        setNotices([]);
      }
    } catch (err) {
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setSelectedNotice(null);
      loadNotices();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Listen to custom notice update event
  useEffect(() => {
    const handleNoticeUpdate = () => {
      loadNotices();
    };
    window.addEventListener('ai_hub_notice_updated', handleNoticeUpdate);
    return () => window.removeEventListener('ai_hub_notice_updated', handleNoticeUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedNotice) {
          setSelectedNotice(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedNotice, onClose]);

  if (!isOpen) return null;

  const getCategoryBadge = (cat: 'IMPORTANT' | 'UPDATE' | 'NOTICE') => {
    switch (cat) {
      case 'IMPORTANT':
        return {
          labelKo: '중요 공지',
          labelEn: 'IMPORTANT',
          style: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'UPDATE':
        return {
          labelKo: '신규 업데이트',
          labelEn: 'NEW UPDATE',
          style: 'bg-[#00d4aa]/20 text-[#00d4aa] border-[#00d4aa]/40',
        };
      default:
        return {
          labelKo: '일반 안내',
          labelEn: 'NOTICE',
          style: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[230] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151f] border border-white/20 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl shadow-black relative my-auto animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#00d4aa] to-[#6c63ff]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
          title={lang === 'ko' ? '닫기' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODE 1: Detail View for Selected Notice */}
        {selectedNotice ? (
          <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in duration-150">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0 pr-8">
              <button
                onClick={() => setSelectedNotice(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1d2a] hover:bg-[#252a3d] text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '목록으로 돌아가기' : 'Back to Notice List'}</span>
              </button>

              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                {selectedNotice.createdAt}
              </span>
            </div>

            {/* Notice Title & Meta */}
            <div className="space-y-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getCategoryBadge(selectedNotice.category);
                  return (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                      {lang === 'ko' ? badge.labelKo : badge.labelEn}
                    </span>
                  );
                })()}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{selectedNotice.author || '관리자'}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {selectedNotice.title}
              </h2>
            </div>

            {/* Notice Content Card */}
            <div className="overflow-y-auto flex-1 bg-[#0c0e14]/70 p-4 sm:p-5 rounded-2xl border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed space-y-3 font-normal whitespace-pre-wrap no-scrollbar">
              {selectedNotice.content}
            </div>

            {/* Detail Footer */}
            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span>AI Hub Official Notice</span>
              </span>

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-[#1a1d2a] hover:bg-[#252a3d] border border-white/10 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {lang === 'ko' ? '목록 보기' : 'Show All Notices'}
              </button>
            </div>
          </div>
        ) : (
          /* MODE 2: Notice List View */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header Title */}
            <div className="flex items-center gap-3 mb-5 shrink-0 pr-8">
              <div className="p-2.5 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                <Megaphone className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>{lang === 'ko' ? '공지사항 & 소식' : 'Announcements'}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    OFFICIAL
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lang === 'ko'
                    ? '클릭하시면 공지사항의 자세한 내용을 확인하실 수 있습니다.'
                    : 'Click any announcement to view full details.'}
                </p>
              </div>
            </div>

            {/* Notice Items List OR Empty State */}
            {notices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center bg-[#1a1d2a]/40 rounded-2xl border border-white/5 my-auto space-y-3">
                <div className="p-4 rounded-2xl bg-gray-800/50 border border-white/10 text-gray-400">
                  <Bell className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {lang === 'ko' ? '등록된 공지사항이 없습니다.' : 'No Announcements Registered.'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  {lang === 'ko'
                    ? '관리자가 작성한 새로운 소식이나 업데이트 공지글이 여기에 작성되면 실시간으로 확인하실 수 있습니다.'
                    : 'Official notices published by the administrator will appear here in real time.'}
                </p>

                {isAdmin && onOpenAdminModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminModal();
                    }}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all"
                  >
                    👑 공지사항 작성하러 가기 (관리자)
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto no-scrollbar space-y-3 pr-1 flex-1">
                {notices.map((item) => {
                  const badge = getCategoryBadge(item.category);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNotice(item)}
                      className="bg-[#1a1d2a] p-4.5 rounded-2xl border border-white/10 hover:border-amber-400/50 transition-all space-y-2 group cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                          {lang === 'ko' ? badge.labelKo : badge.labelEn}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            {item.createdAt}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-400 leading-relaxed font-normal line-clamp-2">
                        {item.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span>AI Hub by Yool</span>
              </span>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                {lang === 'ko' ? '확인 및 닫기' : 'Acknowledge & Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
