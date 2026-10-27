import React, { useEffect, useState } from 'react';
import { Megaphone, ArrowLeft, ChevronRight, Bell, Pin, Loader2 } from 'lucide-react';
import { NoticeItem } from '../types';
import { safeFetchJson } from '../lib/api';
import { cn } from '../lib/cn';
import { Modal, ModalBody, ModalHeader } from './ui/Modal';
import { Button, IconButton } from './ui/Button';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

const CATEGORY_META: Record<NoticeItem['category'], { ko: string; en: string; cls: string }> = {
  IMPORTANT: { ko: '중요', en: 'Important', cls: 'text-rose-400 bg-rose-400/12' },
  UPDATE: { ko: '업데이트', en: 'Update', cls: 'text-mint bg-mint/12' },
  NOTICE: { ko: '안내', en: 'Notice', cls: 'text-amber-400 bg-amber-400/12' },
};

const CategoryBadge: React.FC<{ category: NoticeItem['category']; lang: 'ko' | 'en' }> = ({ category, lang }) => {
  const meta = CATEGORY_META[category] || CATEGORY_META.NOTICE;
  return (
    <span className={cn('inline-flex items-center h-5 px-1.5 rounded text-[0.6875rem] font-bold', meta.cls)}>
      {lang === 'ko' ? meta.ko : meta.en}
    </span>
  );
};

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, lang, isAdmin, onOpenAdminModal }) => {
  const isKo = lang === 'ko';
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        if (Array.isArray(parsed)) setNotices(parsed);
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
      setSelectedNotice(null);
      loadNotices();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNoticeUpdate = () => loadNotices();
    window.addEventListener('ai_hub_notice_updated', handleNoticeUpdate);
    return () => window.removeEventListener('ai_hub_notice_updated', handleNoticeUpdate);
  }, []);

  // Escape / backdrop: step back from a notice first, then close
  const handleDismiss = () => {
    if (selectedNotice) setSelectedNotice(null);
    else onClose();
  };

  const sorted = [...notices].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="lg" zIndex={230} labelledBy="notice-title">
      {selectedNotice ? (
        <>
          <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 border-b border-line shrink-0">
            <IconButton label={isKo ? '목록으로' : 'Back to list'} onClick={() => setSelectedNotice(null)}>
              <ArrowLeft className="w-[18px] h-[18px]" />
            </IconButton>
            <span className="text-sm font-medium text-muted">{isKo ? '공지사항' : 'Announcements'}</span>
          </div>
          <ModalBody className="px-5 sm:px-8 py-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
              <CategoryBadge category={selectedNotice.category} lang={lang} />
              <time className="tabular-nums">{selectedNotice.createdAt}</time>
              <span aria-hidden="true">·</span>
              <span>{selectedNotice.author || (isKo ? '관리자' : 'Admin')}</span>
            </div>
            <h2 id="notice-title" className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-fg leading-snug">
              {selectedNotice.title}
            </h2>
            <div className="mt-5 pt-5 border-t border-line text-[0.9375rem] leading-[1.75] text-fg-2 whitespace-pre-wrap">
              {selectedNotice.content}
            </div>
          </ModalBody>
        </>
      ) : (
        <>
          <ModalHeader
            id="notice-title"
            icon={<Megaphone className="w-5 h-5" />}
            title={isKo ? '공지사항' : 'Announcements'}
            description={isKo ? 'AI Hub의 새 소식과 업데이트를 확인하세요.' : 'News and updates from AI Hub.'}
            onClose={onClose}
            closeLabel={isKo ? '닫기' : 'Close'}
          />
          <ModalBody className="px-3 sm:px-4 py-3">
            {isLoading && notices.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isKo ? '불러오는 중…' : 'Loading…'}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center text-center py-14 px-6">
                <div className="w-12 h-12 rounded-2xl bg-fg/[0.06] flex items-center justify-center text-muted">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-fg">
                  {isKo ? '등록된 공지사항이 없어요' : 'No announcements yet'}
                </h3>
                <p className="mt-1.5 text-sm text-muted max-w-xs leading-relaxed">
                  {isKo ? '새 소식이 올라오면 여기에서 가장 먼저 알려드릴게요.' : 'New posts from the team will show up here.'}
                </p>
                {isAdmin && onOpenAdminModal && (
                  <Button
                    variant="warn"
                    size="sm"
                    className="mt-5"
                    onClick={() => {
                      onClose();
                      onOpenAdminModal();
                    }}
                  >
                    {isKo ? '공지 작성하기 (관리자)' : 'Write a notice (admin)'}
                  </Button>
                )}
              </div>
            ) : (
              <ul className="space-y-1">
                {sorted.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(item)}
                      className="group w-full flex items-start gap-3 p-3 sm:p-4 rounded-xl text-left hover:bg-fg/[0.04] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {item.isPinned && <Pin className="w-3.5 h-3.5 text-brand" aria-label={isKo ? '고정됨' : 'Pinned'} />}
                          <CategoryBadge category={item.category} lang={lang} />
                          <time className="tabular-nums">{item.createdAt}</time>
                        </div>
                        <h3 className="mt-1.5 text-[0.9375rem] font-semibold text-fg line-clamp-1 group-hover:text-brand transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted leading-relaxed line-clamp-2">{item.content}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 mt-1 text-subtle shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ModalBody>
        </>
      )}
    </Modal>
  );
};
