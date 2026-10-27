import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Pin,
  Check,
  X,
  Calendar,
  Eye,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { NoticeItem } from '../../types';
import { safeFetchJson } from '../../lib/api';

interface AdminAnnouncementsTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  notices: NoticeItem[];
  onUpdateNotices: (notices: NoticeItem[]) => void;
  showToast: (msg: string) => void;
}

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({
  currentUserEmail,
  lang,
  notices,
  onUpdateNotices,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'IMPORTANT' | 'UPDATE' | 'NOTICE'>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: 'IMPORTANT' | 'UPDATE' | 'NOTICE';
    content: string;
    status: 'PUBLISHED' | 'DRAFT';
    isPinned: boolean;
    lang: 'ko' | 'en' | 'all';
  }>({
    title: '',
    category: 'NOTICE',
    content: '',
    status: 'PUBLISHED',
    isPinned: false,
    lang: 'all',
  });

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      category: 'NOTICE',
      content: '',
      status: 'PUBLISHED',
      isPinned: false,
      lang: 'all',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      content: notice.content,
      status: notice.status || 'PUBLISHED',
      isPinned: Boolean(notice.isPinned),
      lang: notice.lang || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('제목과 내용은 필수 입력 항목입니다.');
      return;
    }

    if (editingNotice) {
      // Edit existing
      const updatedList = notices.map((n) => {
        if (n.id === editingNotice.id) {
          return {
            ...n,
            title: formData.title.trim(),
            category: formData.category,
            content: formData.content.trim(),
            status: formData.status,
            isPinned: formData.isPinned,
            lang: formData.lang,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return n;
      });

      onUpdateNotices(updatedList);
      saveNotices(updatedList);
      showToast(isKo ? '✅ 공지사항이 수정되었습니다.' : 'Notice updated successfully.');

      // Server API Call
      safeFetchJson(`/api/admin/notices/${editingNotice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          content: formData.content.trim(),
          status: formData.status,
          isPinned: formData.isPinned,
          lang: formData.lang,
        }),
      });
    } else {
      // Create new
      const newNotice: NoticeItem = {
        id: `notice_${Date.now()}`,
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
        author: 'AI Hub Admin',
        status: formData.status,
        isPinned: formData.isPinned,
        lang: formData.lang,
      };

      const updatedList = [newNotice, ...notices];
      onUpdateNotices(updatedList);
      saveNotices(updatedList);
      showToast(isKo ? '✅ 새 공지사항이 등록되었습니다.' : 'Notice published successfully.');

      // Server API Call
      safeFetchJson('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify(newNotice),
      });
    }

    setIsModalOpen(false);
  };

  const handleTogglePin = (notice: NoticeItem) => {
    const nextPinned = !notice.isPinned;
    const updatedList = notices.map((n) => {
      if (n.id === notice.id) {
        return { ...n, isPinned: nextPinned };
      }
      return n;
    });

    onUpdateNotices(updatedList);
    saveNotices(updatedList);
    showToast(isKo ? (nextPinned ? '📌 상단에 고정되었습니다.' : '고정이 해제되었습니다.') : 'Pin status updated.');
  };

  const handleDeleteNotice = async (id: string) => {
    const updatedList = notices.filter((n) => n.id !== id);
    onUpdateNotices(updatedList);
    saveNotices(updatedList);
    showToast(isKo ? '🗑️ 공지사항이 삭제되었습니다.' : 'Notice deleted.');
    setDeleteConfirmId(null);

    safeFetchJson(`/api/admin/notices/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-email': currentUserEmail },
    });
  };

  const saveNotices = (updatedList: NoticeItem[]) => {
    try {
      localStorage.setItem('ai_hub_notices', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('aihub_notices_changed'));
    } catch (e) {
      console.error('Failed to save notices:', e);
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (categoryFilter === 'ALL') return true;
    return n.category === categoryFilter;
  });

  const getCategoryBadge = (cat: 'IMPORTANT' | 'UPDATE' | 'NOTICE') => {
    if (cat === 'IMPORTANT') {
      return (
        <span className="px-2 py-0.5 rounded text-[0.6875rem] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          중요
        </span>
      );
    }
    if (cat === 'UPDATE') {
      return (
        <span className="px-2 py-0.5 rounded text-[0.6875rem] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          업데이트
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[0.6875rem] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        안내
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-surface-2 to-surface border border-purple-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-purple-400/20 text-purple-300 border border-purple-400/30">
              ANNOUNCEMENTS & NOTICES
            </span>
            <span className="text-xs text-muted">
              {isKo ? '서비스 공지사항 게시 및 상단 고정 제어' : 'Notices & Service Updates'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? '공지사항 관리' : 'Announcements'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isKo
              ? `총 ${notices.length}개 공지 등록됨 (게시 중: ${notices.filter((n) => n.status !== 'DRAFT').length}개)`
              : `Total ${notices.length} notices`}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isKo ? '새 공지사항 작성' : 'New Notice'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-surface p-2 rounded-2xl border border-line overflow-x-auto text-xs">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            categoryFilter === 'ALL' ? 'bg-purple-600 text-white' : 'text-muted hover:text-fg'
          }`}
        >
          {isKo ? '전체 공지' : 'All'} ({notices.length})
        </button>
        <button
          onClick={() => setCategoryFilter('IMPORTANT')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            categoryFilter === 'IMPORTANT' ? 'bg-rose-600 text-white' : 'text-muted hover:text-fg'
          }`}
        >
          {isKo ? '중요 공지' : 'Important'} ({notices.filter((n) => n.category === 'IMPORTANT').length})
        </button>
        <button
          onClick={() => setCategoryFilter('UPDATE')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            categoryFilter === 'UPDATE' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
          }`}
        >
          {isKo ? '기능 업데이트' : 'Updates'} ({notices.filter((n) => n.category === 'UPDATE').length})
        </button>
        <button
          onClick={() => setCategoryFilter('NOTICE')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            categoryFilter === 'NOTICE' ? 'bg-amber-600 text-white' : 'text-muted hover:text-fg'
          }`}
        >
          {isKo ? '일반 안내' : 'General'} ({notices.filter((n) => n.category === 'NOTICE').length})
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-2xl border border-line text-subtle text-xs">
            {isKo ? '등록된 공지사항이 없습니다.' : 'No notices found.'}
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 rounded-2xl bg-surface border transition-all ${
                notice.isPinned ? 'border-amber-400/40 bg-gradient-to-r from-amber-500/5 to-transparent' : 'border-line'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {notice.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Pin className="w-3 h-3 fill-amber-300" /> 고정 공지
                    </span>
                  )}
                  {getCategoryBadge(notice.category)}
                  {notice.status === 'DRAFT' && (
                    <span className="px-2 py-0.5 rounded text-[0.6875rem] font-bold bg-gray-500/20 text-muted border border-gray-500/30">
                      임시 저장 (Draft)
                    </span>
                  )}
                  <h3 className="font-bold text-fg text-sm">{notice.title}</h3>
                </div>

                <div className="flex items-center gap-1 text-muted text-xs self-end sm:self-auto">
                  <span className="font-mono text-xs mr-2">{notice.createdAt}</span>

                  <button
                    onClick={() => handleTogglePin(notice)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      notice.isPinned ? 'bg-amber-400/20 text-amber-300' : 'hover:bg-fg/10 text-muted hover:text-fg'
                    }`}
                    title={notice.isPinned ? '고정 해제' : '상단 고정'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(notice)}
                    className="p-1.5 hover:bg-fg/10 rounded-lg text-muted hover:text-indigo-300 transition-colors cursor-pointer"
                    title="수정하기"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(notice.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-muted hover:text-rose-400 transition-colors cursor-pointer"
                    title="삭제하기"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-fg-2 whitespace-pre-wrap leading-relaxed mt-2.5 pt-2 border-t border-line font-sans">
                {notice.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-2 border border-purple-400/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Megaphone className="w-5 h-5" />
                <h3 className="text-base font-bold text-fg">
                  {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-fg/10 rounded-lg text-muted hover:text-fg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
              <div>
                <label className="block text-fg-2 font-bold mb-1">공지 제목 (Title)</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="공지사항 제목을 입력하세요."
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-fg-2 font-bold mb-1">분류 (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="NOTICE">일반 안내 (NOTICE)</option>
                    <option value="UPDATE">기능 업데이트 (UPDATE)</option>
                    <option value="IMPORTANT">중요 공지 (IMPORTANT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-fg-2 font-bold mb-1">게시 상태 (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value="PUBLISHED">즉시 게시 (Published)</option>
                    <option value="DRAFT">임시 저장 (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-fg-2 font-bold mb-1">공지 본문 내용 (Content)</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="공지할 내용을 작성하세요. 줄바꿈 및 서식이 그대로 적용됩니다."
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-purple-400 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded border-line bg-surface text-purple-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isPinnedCheck" className="text-fg-2 font-bold cursor-pointer">
                  📌 상단 고정 공지로 등록하기
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  {editingNotice ? '수정 내용 저장' : '공지사항 게시'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-2 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-fg">공지사항 삭제 확인</h3>
            </div>
            <p className="text-xs text-fg-2">
              해당 공지사항을 완전히 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteNotice(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
