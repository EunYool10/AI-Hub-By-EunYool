import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Crown,
  AlertTriangle,
  Check,
  X,
  Mail,
  Calendar,
  Activity,
  Eye,
  Lock,
  User as UserIcon,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AdminUser } from '../../types';
import { safeFetchJson } from '../../lib/api';

interface AdminUsersTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  showToast: (msg: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  currentUserEmail,
  lang,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Detailed selected user modal
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUser | null>(null);

  // Confirmation Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'STATUS' | 'ROLE';
    user: AdminUser;
    nextValue: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await safeFetchJson<{ success: boolean; users: AdminUser[] }>('/api/admin/users', {
        headers: { 'x-user-email': currentUserEmail },
      });
      if (res.ok && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUserEmail]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleExecuteStatusChange = async (user: AdminUser, nextStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const res = await safeFetchJson<any>('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({ email: user.email, status: nextStatus }),
      });

      if (res.ok && res.data?.success) {
        showToast(
          isKo
            ? `계정(${user.email}) 상태가 [${nextStatus === 'ACTIVE' ? '정상 활성' : '이용 정지'}]로 변경되었습니다.`
            : `User status changed to ${nextStatus}.`
        );
        fetchUsers();
        if (selectedUserDetail?.email === user.email) {
          setSelectedUserDetail({ ...selectedUserDetail, status: nextStatus });
        }
      } else {
        showToast(isKo ? `상태 변경 실패: ${res.data?.error || '권한 오류'}` : `Failed: ${res.data?.error || 'Permission denied'}`);
      }
    } catch (e) {
      showToast(isKo ? '요청 중 오류가 발생했습니다.' : 'Request failed.');
    } finally {
      setConfirmAction(null);
    }
  };

  const handleExecuteRoleChange = async (user: AdminUser, nextRole: 'ADMIN' | 'USER') => {
    try {
      const res = await safeFetchJson<any>('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({ email: user.email, role: nextRole }),
      });

      if (res.ok && res.data?.success) {
        showToast(
          isKo
            ? `계정(${user.email}) 권한이 [${nextRole}]로 업데이트되었습니다.`
            : `User role changed to ${nextRole}.`
        );
        fetchUsers();
        if (selectedUserDetail?.email === user.email) {
          setSelectedUserDetail({ ...selectedUserDetail, role: nextRole });
        }
      } else {
        showToast(isKo ? `권한 변경 실패: ${res.data?.error || '권한 오류'}` : `Failed: ${res.data?.error || 'Permission denied'}`);
      }
    } catch (e) {
      showToast(isKo ? '요청 중 오류가 발생했습니다.' : 'Request failed.');
    } finally {
      setConfirmAction(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.nickname && u.nickname.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsers = users.filter((u) => u.status === 'SUSPENDED').length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-surface-2 to-surface border border-indigo-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
              USER MANAGEMENT
            </span>
            <span className="text-xs text-muted">
              {isKo ? '사용자 계정 상태 및 권한 제어' : 'User Account & Roles Control'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? '사용자 계정 및 프로필 관리' : 'User Profiles & Accounts'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isKo
              ? `총 ${totalUsers}명 (활성 ${activeUsers}명, 정지 ${suspendedUsers}명, 관리자 ${adminUsers}명)`
              : `Total ${totalUsers} (Active: ${activeUsers}, Suspended: ${suspendedUsers}, Admins: ${adminUsers})`}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 bg-surface-3 hover:bg-surface-3 border border-line text-fg rounded-xl text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : 'text-fg-2'}`} />
          <span>{isKo ? '새로고침' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-line">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKo ? '이름, 닉네임 또는 이메일 검색...' : 'Search by name, nickname, or email...'}
            className="w-full pl-9 pr-3.5 py-2 bg-surface-2 border border-line rounded-xl text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-line text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '전체 상태' : 'All Status'}
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '정상 활성' : 'Active'}
            </button>
            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'SUSPENDED' ? 'bg-rose-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '이용 정지' : 'Suspended'}
            </button>
          </div>

          <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-line text-xs">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                roleFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '전체 역할' : 'All Roles'}
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                roleFilter === 'ADMIN' ? 'bg-amber-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '관리자' : 'Admins'}
            </button>
            <button
              onClick={() => setRoleFilter('USER')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                roleFilter === 'USER' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
              }`}
            >
              {isKo ? '일반' : 'Users'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 text-muted font-bold border-b border-line uppercase text-[0.6875rem]">
              <tr>
                <th className="py-3 px-4">{isKo ? '사용자 프로필' : 'User Profile'}</th>
                <th className="py-3 px-4">{isKo ? '권한' : 'Role'}</th>
                <th className="py-3 px-4">{isKo ? '계정 상태' : 'Account Status'}</th>
                <th className="py-3 px-4">{isKo ? '가입일 / 최근 활동' : 'Joined / Last Active'}</th>
                <th className="py-3 px-4 text-right">{isKo ? '계정 관리' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-subtle">
                    {isKo ? '등록된 사용자가 없습니다.' : 'No registered users found.'}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-subtle">
                    {isKo ? '검색 조건과 일치하는 사용자가 없습니다.' : 'No users match the search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                  const isProtected = user.isProtected || [
                    'ayun24song@gmail.com',
                    'teamdevstudiont@gmail.com',
                    'deer123424@gmail.com',
                  ].includes(user.email.toLowerCase());
                  const isSuspended = user.status === 'SUSPENDED';

                  return (
                    <tr key={user.email} className="hover:bg-fg/[0.02] transition-colors">
                      {/* User Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-3 border border-line flex items-center justify-center font-bold text-fg text-xs shrink-0">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || 'Avatar'}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                {user.role === 'ADMIN' ? '👑' : (user.displayName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-fg flex items-center gap-1.5 flex-wrap">
                              <span>{user.nickname || user.displayName || (isKo ? '이름 없음' : 'No name')}</span>
                              {user.nickname && user.displayName && (
                                <span className="text-[0.6875rem] text-muted font-normal">({user.displayName})</span>
                              )}
                              {isCurrentAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[0.6875rem] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  {isKo ? '본인' : 'You'}
                                </span>
                              )}
                              {isProtected && (
                                <span className="px-1.5 py-0.2 rounded text-[0.6875rem] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-0.5" title="핵심 운영자 보호 계정">
                                  <Lock className="w-2.5 h-2.5" /> {isKo ? '보호됨' : 'Protected'}
                                </span>
                              )}
                            </div>
                            <div className="text-muted font-mono text-xs flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-subtle" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-400/20">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <UserX className="w-3 h-3" /> {isKo ? '이용 정지' : 'Suspended'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <UserCheck className="w-3 h-3" /> {isKo ? '정상 활성' : 'Active'}
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 text-muted text-xs font-mono">
                        <div>
                          {isKo ? '가입' : 'Joined'}:{' '}
                          {user.role === 'ADMIN' || user.isAdmin || user.email.toLowerCase() === 'deer123424@gmail.com' || user.joinedAt === '-'
                            ? '-'
                            : user.joinedAt
                            ? (isNaN(Date.parse(user.joinedAt)) ? user.joinedAt : new Date(user.joinedAt).toLocaleDateString())
                            : (isKo ? '가입일 정보 없음' : 'N/A')}
                        </div>
                        <div className="text-subtle text-[0.6875rem]">{isKo ? '최근' : 'Active'}: {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : (isKo ? '기록 없음' : 'N/A')}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Profile */}
                          <button
                            onClick={() => setSelectedUserDetail(user)}
                            className="p-1.5 bg-surface-2 hover:bg-surface-3 text-fg-2 hover:text-fg rounded-lg border border-line transition-colors cursor-pointer"
                            title={isKo ? '프로필 상세 정보' : 'View Profile Details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status (Active / Suspended) */}
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'STATUS',
                                user,
                                nextValue: isSuspended ? 'ACTIVE' : 'SUSPENDED',
                              })
                            }
                            disabled={isCurrentAdmin || isProtected}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                            } ${isCurrentAdmin || isProtected ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={
                              isCurrentAdmin
                                ? isKo ? '본인 계정은 정지할 수 없습니다' : 'Cannot suspend self'
                                : isProtected
                                ? isKo ? '보호된 관리자 계정은 정지할 수 없습니다' : 'Protected account cannot be suspended'
                                : isKo ? '상태 전환' : 'Toggle Status'
                            }
                          >
                            {isSuspended ? (isKo ? '정지 해제' : 'Unsuspend') : (isKo ? '계정 정지' : 'Suspend')}
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'ROLE',
                                user,
                                nextValue: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                              })
                            }
                            disabled={isCurrentAdmin || isProtected}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-fg/5 hover:bg-fg/10 text-fg-2 border border-line transition-all cursor-pointer ${
                              isCurrentAdmin || isProtected ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            title={
                              isCurrentAdmin
                                ? isKo ? '본인 권한은 변경할 수 없습니다' : 'Cannot change self role'
                                : isProtected
                                ? isKo ? '보호된 관리자 계정의 권한은 변경할 수 없습니다' : 'Protected account role is locked'
                                : isKo ? '권한 변경' : 'Change Role'
                            }
                          >
                            {user.role === 'ADMIN' ? (isKo ? '일반으로 강등' : 'Demote') : (isKo ? '관리자 승격' : 'Promote')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Drawer Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface border border-line rounded-3xl p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-fg">
                  {isKo ? '사용자 상세 프로필' : 'User Profile Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-fg/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-2 border border-line">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-3 border border-line-strong flex items-center justify-center shrink-0">
                {selectedUserDetail.photoURL ? (
                  <img
                    src={selectedUserDetail.photoURL}
                    alt={selectedUserDetail.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                    {selectedUserDetail.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-fg truncate">
                    {selectedUserDetail.displayName}
                  </h4>
                  {selectedUserDetail.role === 'ADMIN' ? (
                    <span className="px-2 py-0.5 text-[0.6875rem] font-extrabold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[0.6875rem] font-bold rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                      USER
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted font-mono mt-0.5 truncate">{selectedUserDetail.email}</p>
                {selectedUserDetail.nickname && (
                  <p className="text-xs text-indigo-300 mt-1">
                    {isKo ? '활동 닉네임' : 'Nickname'}: <span className="font-semibold text-fg">{selectedUserDetail.nickname}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bio / Description */}
            {selectedUserDetail.bio && (
              <div className="p-3.5 bg-surface-2 border border-line rounded-2xl">
                <span className="text-[0.6875rem] font-bold text-muted uppercase tracking-wider block mb-1">
                  {isKo ? '자기소개 (Bio)' : 'Biography'}
                </span>
                <p className="text-xs text-fg-2 leading-relaxed italic">
                  "{selectedUserDetail.bio}"
                </p>
              </div>
            )}

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-2 rounded-xl border border-line">
                <span className="text-[0.6875rem] text-muted block">{isKo ? '계정 상태' : 'Account Status'}</span>
                <span className={`font-bold mt-1 inline-block ${selectedUserDetail.status === 'SUSPENDED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedUserDetail.status === 'SUSPENDED' ? (isKo ? '이용 정지' : 'Suspended') : (isKo ? '정상 활성' : 'Active')}
                </span>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl border border-line">
                <span className="text-[0.6875rem] text-muted block">{isKo ? '총 로그인 횟수' : 'Login Count'}</span>
                <span className="font-bold text-fg mt-1 inline-block font-mono">
                  {selectedUserDetail.loginCount || 1} 회
                </span>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl border border-line">
                <span className="text-[0.6875rem] text-muted block">{isKo ? '최초 가입일시' : 'Joined Date'}</span>
                <span className="font-mono text-fg-2 mt-1 inline-block text-xs">
                  {selectedUserDetail.role === 'ADMIN' || selectedUserDetail.isAdmin || selectedUserDetail.email.toLowerCase() === 'deer123424@gmail.com' || selectedUserDetail.joinedAt === '-'
                    ? '-'
                    : selectedUserDetail.joinedAt
                    ? (isNaN(Date.parse(selectedUserDetail.joinedAt)) ? selectedUserDetail.joinedAt : new Date(selectedUserDetail.joinedAt).toLocaleString())
                    : (isKo ? '가입일 정보 없음' : 'N/A')}
                </span>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl border border-line">
                <span className="text-[0.6875rem] text-muted block">{isKo ? '최근 접속일시' : 'Last Active'}</span>
                <span className="font-mono text-fg-2 mt-1 inline-block text-xs">
                  {selectedUserDetail.lastActiveAt ? new Date(selectedUserDetail.lastActiveAt).toLocaleString() : (isKo ? '기록 없음' : 'N/A')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-fg/10 hover:bg-fg/20 text-fg rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isKo ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-2 border border-amber-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-fg">
                {confirmAction.type === 'STATUS'
                  ? confirmAction.nextValue === 'SUSPENDED'
                    ? (isKo ? '계정 이용 정지 확인' : 'Confirm Account Suspension')
                    : (isKo ? '계정 정지 해제 확인' : 'Confirm Account Unsuspension')
                  : (isKo ? '관리자 권한 변경 확인' : 'Confirm Role Change')}
              </h3>
            </div>

            <p className="text-xs text-fg-2 leading-relaxed">
              {isKo ? '대상 계정' : 'Target Account'}: <span className="font-bold text-fg">{confirmAction.user.email}</span>
              <br />
              {confirmAction.type === 'STATUS'
                ? confirmAction.nextValue === 'SUSPENDED'
                  ? (isKo ? '해당 사용자의 로그인이 차단되며 챗봇 및 모든 서비스 이용이 중단됩니다. 계속하시겠습니까?' : 'This user will be blocked from logging in and using services. Proceed?')
                  : (isKo ? '해당 사용자의 계정 정지를 해제하고 정상 상태로 복구합니다.' : 'Unsuspend this user account and restore active status.')
                : confirmAction.nextValue === 'ADMIN'
                ? (isKo ? '해당 사용자에게 전체 관리자 권한을 부여합니다.' : 'Grant full administrative privileges to this user.')
                : (isKo ? '해당 사용자의 관리자 권한을 회수하여 일반 사용자로 변경합니다.' : 'Revoke administrative privileges and demote to standard user.')}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isKo ? '취소' : 'Cancel'}
              </button>

              <button
                onClick={() => {
                  if (confirmAction.type === 'STATUS') {
                    handleExecuteStatusChange(
                      confirmAction.user,
                      confirmAction.nextValue as 'ACTIVE' | 'SUSPENDED'
                    );
                  } else {
                    handleExecuteRoleChange(
                      confirmAction.user,
                      confirmAction.nextValue as 'ADMIN' | 'USER'
                    );
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                {isKo ? '확인 및 실행' : 'Confirm & Execute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
