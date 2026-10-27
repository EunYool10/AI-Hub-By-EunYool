import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Megaphone, Users, Inbox, Pin, Pencil, Trash2, X, RefreshCw, Mail, Search, Loader2, ChevronDown } from 'lucide-react';
import { NoticeItem, UserProfile } from '../types';
import { Language } from '../lib/translations';
import { isDesignatedAdminEmail } from '../lib/authStorage';
import { cn } from '../lib/cn';
import {
  HubInquiry,
  HubUser,
  InquiryStatus,
  NoticeInput,
  deleteInquiry,
  deleteNotice,
  listInquiries,
  listNotices,
  listUsers,
  saveNotice,
  updateInquiry,
  updateUser,
} from '../lib/firebase';
import { Modal, ModalBody } from './ui/Modal';
import { Button, IconButton } from './ui/Button';
import { Field, inputClass, selectClass, textareaClass } from './ui/Field';
import { Avatar } from './ui/Identity';

type Tab = 'notices' | 'users' | 'inquiries';

interface HubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  lang: Language;
  onToast: (message: string) => void;
  /** Called after notices change so the header dot and notice list refresh. */
  onNoticesChanged: () => void;
}

const NOTICE_CATEGORIES: { id: NoticeItem['category']; label: string; cls: string }[] = [
  { id: 'NOTICE', label: '공지', cls: 'bg-accent/12 text-brand' },
  { id: 'UPDATE', label: '업데이트', cls: 'bg-mint/12 text-mint' },
  { id: 'IMPORTANT', label: '중요', cls: 'bg-rose-500/12 text-rose-400' },
];

const STATUS: Record<InquiryStatus, { label: string; cls: string }> = {
  open: { label: '접수', cls: 'bg-amber-400/12 text-amber-400' },
  in_progress: { label: '처리 중', cls: 'bg-sky-400/12 text-sky-400' },
  done: { label: '완료', cls: 'bg-mint/12 text-mint' },
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

const isComplaint = (type: string) => /컴플레인|불편|신고/.test(type);

const EMPTY_NOTICE: NoticeInput = { title: '', content: '', category: 'NOTICE', pinned: false };

export const HubAdminModal: React.FC<HubAdminModalProps> = ({ isOpen, onClose, currentUser, lang, onToast, onNoticesChanged }) => {
  const [tab, setTab] = useState<Tab>('inquiries');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [users, setUsers] = useState<HubUser[]>([]);
  const [inquiries, setInquiries] = useState<HubInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [n, u, q] = await Promise.all([listNotices(), listUsers(), listInquiries()]);
      setNotices(n);
      setUsers(u);
      setInquiries(q);
    } catch (e) {
      console.error(e);
      setError('데이터를 불러오지 못했어요. 관리자 Google 계정으로 로그인했는지 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const run = async (task: () => Promise<unknown>, done: string) => {
    try {
      await task();
      onToast(done);
      return true;
    } catch (e) {
      console.error(e);
      onToast('저장하지 못했어요. 입력 내용과 권한을 확인해 주세요.');
      return false;
    }
  };

  const openCount = inquiries.filter((q) => q.status === 'open').length;
  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inquiries', label: '문의 · 불편', icon: <Inbox className="w-4 h-4" />, badge: openCount },
    { id: 'notices', label: '공지 작성', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'users', label: '사용자 관리', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" zIndex={260} labelledBy="hub-admin-title">
      <div className="flex items-center gap-3 px-5 sm:px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h2 id="hub-admin-title" className="text-lg font-bold tracking-tight text-fg">
            {lang === 'ko' ? '관리자 센터' : 'Admin center'}
          </h2>
          <p className="text-xs text-muted truncate">{currentUser?.email}</p>
        </div>
        <IconButton label="새로고침" onClick={load}>
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </IconButton>
        <IconButton label="닫기" onClick={onClose} className="-mr-2">
          <X className="w-5 h-5" />
        </IconButton>
      </div>
      <div className="px-5 sm:px-6 border-b border-line flex gap-1 overflow-x-auto" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative h-11 px-3 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors',
              tab === t.id ? 'text-fg' : 'text-muted hover:text-fg'
            )}
          >
            {t.icon}
            {t.label}
            {!!t.badge && <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[0.6875rem] font-bold inline-flex items-center justify-center">{t.badge}</span>}
            {tab === t.id && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>
      <ModalBody className="py-5 min-h-[50vh]">
        {error ? (
          <p className="py-10 text-center text-sm text-rose-400">{error}</p>
        ) : loading && !notices.length && !users.length && !inquiries.length ? (
          <div className="py-16 flex justify-center text-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : tab === 'notices' ? (
          <NoticesTab
            notices={notices}
            author={currentUser?.displayName || '운영자'}
            onSave={async (input, id) => {
              const ok = await run(() => saveNotice(input, currentUser?.displayName || '운영자', id), id ? '공지를 수정했어요.' : '공지를 등록했어요.');
              if (ok) {
                await load();
                onNoticesChanged();
              }
              return ok;
            }}
            onDelete={async (id) => {
              if (!window.confirm('이 공지를 삭제할까요?')) return;
              if (await run(() => deleteNotice(id), '공지를 삭제했어요.')) {
                setNotices((list) => list.filter((n) => n.id !== id));
                onNoticesChanged();
              }
            }}
          />
        ) : tab === 'users' ? (
          <UsersTab
            users={users}
            onToggle={async (u) => {
              const next = u.status === 'suspended' ? 'active' : 'suspended';
              const msg = next === 'suspended' ? `${u.name} 님의 이용을 정지할까요?` : `${u.name} 님의 정지를 해제할까요?`;
              if (!window.confirm(msg)) return;
              if (await run(() => updateUser(u.uid, { status: next }), next === 'suspended' ? '이용을 정지했어요.' : '정지를 해제했어요.')) {
                setUsers((list) => list.map((x) => (x.uid === u.uid ? { ...x, status: next } : x)));
              }
            }}
          />
        ) : (
          <InquiriesTab
            inquiries={inquiries}
            onUpdate={async (q, patch) => {
              if (await run(() => updateInquiry(q.id, patch), patch.status ? '처리 상태를 바꿨어요.' : '메모를 저장했어요.')) {
                setInquiries((list) => list.map((x) => (x.id === q.id ? { ...x, ...patch } : x)));
              }
            }}
            onDelete={async (q) => {
              if (!window.confirm('이 문의를 삭제할까요?')) return;
              if (await run(() => deleteInquiry(q.id), '문의를 삭제했어요.')) {
                setInquiries((list) => list.filter((x) => x.id !== q.id));
              }
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

// ── Notices ──────────────────────────────────────────────────────────

const NoticesTab: React.FC<{
  notices: NoticeItem[];
  author: string;
  onSave: (input: NoticeInput, id?: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}> = ({ notices, onSave, onDelete }) => {
  const [form, setForm] = useState<NoticeInput>(EMPTY_NOTICE);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    const ok = await onSave({ ...form, title: form.title.trim(), content: form.content.trim() }, editingId);
    setSaving(false);
    if (ok) {
      setForm(EMPTY_NOTICE);
      setEditingId(undefined);
    }
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <form onSubmit={submit} className="space-y-4 p-4 rounded-xl border border-line bg-surface-2/50 h-fit">
        <h3 className="text-sm font-semibold text-fg">{editingId ? '공지 수정' : '새 공지 작성'}</h3>
        <Field label="제목" htmlFor="notice-title" required>
          <input id="notice-title" className={inputClass} maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 서비스 점검 안내" />
        </Field>
        <div className="flex gap-3 items-end">
          <Field label="분류" htmlFor="notice-category" className="flex-1">
            <select
              id="notice-category"
              className={selectClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NoticeItem['category'] })}
            >
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <label className="h-11 px-3 inline-flex items-center gap-2 rounded-xl border border-line text-sm text-fg-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="accent-[var(--c-accent)]" />
            상단 고정
          </label>
        </div>
        <Field label="내용" htmlFor="notice-content" required hint={`${form.content.length}/5000`}>
          <textarea id="notice-content" rows={8} maxLength={5000} className={textareaClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <div className="flex gap-2 justify-end">
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(undefined);
                setForm(EMPTY_NOTICE);
              }}
            >
              취소
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={saving || !form.title.trim() || !form.content.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingId ? '수정 저장' : '공지 등록'}
          </Button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-fg mb-3">등록된 공지 {notices.length}개</h3>
        {notices.length === 0 ? (
          <p className="py-10 text-center text-sm text-subtle">아직 등록된 공지가 없어요.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line overflow-hidden">
            {notices.map((n) => {
              const cat = NOTICE_CATEGORIES.find((c) => c.id === n.category) || NOTICE_CATEGORIES[0];
              return (
                <li key={n.id} className="p-3 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('px-1.5 py-px rounded text-[0.6875rem] font-semibold', cat.cls)}>{cat.label}</span>
                      {n.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400" aria-label="상단 고정" />}
                      <span className="text-xs text-subtle">{fmt(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-fg truncate">{n.title}</p>
                  </div>
                  <IconButton
                    label="수정"
                    size="sm"
                    onClick={() => {
                      setEditingId(n.id);
                      setForm({ title: n.title, content: n.content, category: n.category, pinned: !!n.isPinned });
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </IconButton>
                  <IconButton label="삭제" size="sm" onClick={() => onDelete(n.id)}>
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// ── Users ────────────────────────────────────────────────────────────

const UsersTab: React.FC<{ users: HubUser[]; onToggle: (u: HubUser) => void }> = ({ users, onToggle }) => {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(s)) : users;
  }, [users, q]);
  const suspended = users.filter((u) => u.status === 'suspended').length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
          <input className={cn(inputClass, 'pl-9')} placeholder="이름 또는 이메일로 찾기" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <p className="text-sm text-muted">
          전체 <strong className="text-fg">{users.length}</strong>명 · 정지 <strong className="text-rose-400">{suspended}</strong>명
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">{users.length ? '찾는 사용자가 없어요.' : '아직 로그인한 사용자가 없어요.'}</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line overflow-hidden">
          {shown.map((u) => {
            const admin = u.provider === 'google' && isDesignatedAdminEmail(u.email);
            return (
              <li key={u.uid} className="p-3 flex items-center gap-3">
                <Avatar user={{ uid: u.uid, email: u.email || u.name, displayName: u.name, photoURL: u.photo || undefined, role: 'USER' }} className="w-9 h-9 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-fg truncate">{u.name}</span>
                    <span className={cn('px-1.5 py-px rounded text-[0.625rem] font-bold', u.provider === 'kakao' ? 'bg-[#FEE500] text-black' : 'bg-fg/[0.07] text-fg-2')}>
                      {u.provider === 'kakao' ? '카카오' : 'Google'}
                    </span>
                    {admin && <span className="px-1.5 py-px rounded text-[0.625rem] font-bold bg-amber-400/15 text-amber-300">ADMIN</span>}
                    {u.status === 'suspended' && <span className="px-1.5 py-px rounded text-[0.625rem] font-bold bg-rose-500/15 text-rose-400">정지</span>}
                  </div>
                  <p className="text-xs text-muted truncate">
                    {u.email || '이메일 없음'} · 가입 {fmt(u.createdAt)} · 최근 {fmt(u.lastLoginAt)}
                  </p>
                </div>
                {!admin && (
                  <Button size="sm" variant={u.status === 'suspended' ? 'secondary' : 'danger'} onClick={() => onToggle(u)}>
                    {u.status === 'suspended' ? '정지 해제' : '이용 정지'}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ── Inquiries & complaints ───────────────────────────────────────────

const InquiriesTab: React.FC<{
  inquiries: HubInquiry[];
  onUpdate: (q: HubInquiry, patch: { status?: InquiryStatus; memo?: string }) => void;
  onDelete: (q: HubInquiry) => void;
}> = ({ inquiries, onUpdate, onDelete }) => {
  const [filter, setFilter] = useState<'all' | InquiryStatus | 'complaint'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [memo, setMemo] = useState('');

  const shown = inquiries.filter((q) =>
    filter === 'all' ? true : filter === 'complaint' ? isComplaint(q.type) : q.status === filter
  );
  const chips: { id: typeof filter; label: string; count: number }[] = [
    { id: 'all', label: '전체', count: inquiries.length },
    { id: 'open', label: '접수', count: inquiries.filter((q) => q.status === 'open').length },
    { id: 'in_progress', label: '처리 중', count: inquiries.filter((q) => q.status === 'in_progress').length },
    { id: 'done', label: '완료', count: inquiries.filter((q) => q.status === 'done').length },
    { id: 'complaint', label: '불편 · 컴플레인', count: inquiries.filter((q) => isComplaint(q.type)).length },
  ];

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={cn(
              'h-8 px-3 rounded-full border text-sm transition-colors',
              filter === c.id ? 'border-accent bg-accent/12 text-fg' : 'border-line text-muted hover:text-fg'
            )}
          >
            {c.label} <span className="tabular-nums text-subtle">{c.count}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">해당하는 문의가 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((q) => {
            const expanded = openId === q.id;
            const st = STATUS[q.status] || STATUS.open;
            return (
              <li key={q.id} className={cn('rounded-xl border', isComplaint(q.type) ? 'border-rose-500/30' : 'border-line')}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(expanded ? null : q.id);
                    setMemo(q.memo || '');
                  }}
                  className="w-full p-3 flex items-center gap-3 text-left"
                  aria-expanded={expanded}
                >
                  <span className={cn('shrink-0 px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold', st.cls)}>{st.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg truncate">
                      <span className={cn('mr-1.5 text-xs', isComplaint(q.type) ? 'text-rose-400' : 'text-subtle')}>[{q.type}]</span>
                      {q.title}
                    </span>
                    <span className="block text-xs text-muted truncate">
                      {q.name || '이름 없음'} · {q.email || '이메일 없음'} · {fmt(q.createdAt)}
                    </span>
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-subtle transition-transform', expanded && 'rotate-180')} />
                </button>
                {expanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-line pt-3">
                    <p className="text-sm text-fg-2 whitespace-pre-line leading-relaxed">{q.message}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted">처리 상태</span>
                      {(Object.keys(STATUS) as InquiryStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => q.status !== s && onUpdate(q, { status: s })}
                          className={cn(
                            'h-7 px-2.5 rounded-lg text-xs font-medium border transition-colors',
                            q.status === s ? cn(STATUS[s].cls, 'border-transparent') : 'border-line text-muted hover:text-fg'
                          )}
                        >
                          {STATUS[s].label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      className={textareaClass}
                      placeholder="관리자 메모 (사용자에게 보이지 않아요)"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button size="sm" variant="danger" onClick={() => onDelete(q)}>
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </Button>
                      {q.email.includes('@') && (
                        <a
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg bg-surface-2 text-fg border border-line hover:bg-surface-3"
                          href={`mailto:${q.email}?subject=${encodeURIComponent(`[AI Hub] Re: ${q.title}`)}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          메일로 답장
                        </a>
                      )}
                      <Button size="sm" variant="primary" disabled={memo === (q.memo || '')} onClick={() => onUpdate(q, { memo })}>
                        메모 저장
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
