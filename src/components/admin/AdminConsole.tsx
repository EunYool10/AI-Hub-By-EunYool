import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Megaphone,
  Bot,
  Activity,
  Code2,
  Settings,
  ArrowLeft,
  Crown,
  Shield,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AdminConsoleTab, AITool, NoticeItem } from '../../types';
import { UserProfile } from '../GoogleLoginModal';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminToolsTab } from './AdminToolsTab';
import { AdminAnnouncementsTab } from './AdminAnnouncementsTab';
import { AdminChatbotTab } from './AdminChatbotTab';
import { AdminSystemTab } from './AdminSystemTab';
import { AdminDeveloperTab } from './AdminDeveloperTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminConsoleProps {
  currentUser: UserProfile;
  lang: 'ko' | 'en';
  tools: AITool[];
  notices: NoticeItem[];
  onUpdateTools: (tools: AITool[]) => void;
  onUpdateNotices: (notices: NoticeItem[]) => void;
  onBackToMain: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  lang,
  tools,
  notices,
  onUpdateTools,
  onUpdateNotices,
  onBackToMain,
  onLogout,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [activeTab, setActiveTab] = useState<AdminConsoleTab>('dashboard');

  const navItems: { id: AdminConsoleTab; labelKo: string; labelEn: string; icon: any; badge?: number | string }[] = [
    { id: 'dashboard', labelKo: '대시보드', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', labelKo: '사용자 관리', labelEn: 'Users', icon: Users },
    { id: 'tools', labelKo: 'AI 도구 관리', labelEn: 'AI Tools', icon: Wrench, badge: tools.length },
    { id: 'announcements', labelKo: '공지사항 관리', labelEn: 'Announcements', icon: Megaphone, badge: notices.length },
    { id: 'chatbot', labelKo: '관리자 챗봇', labelEn: 'Chatbot', icon: Bot },
    { id: 'system', labelKo: '시스템 모니터링', labelEn: 'System', icon: Activity },
    { id: 'developer', labelKo: '개발자 센터', labelEn: 'Developer', icon: Code2 },
    { id: 'settings', labelKo: '플랫폼 설정', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090b12] text-gray-100 flex flex-col font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0d101c]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMain}
              className="p-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
              title="AI Hub 메인으로"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isKo ? '메인 서비스로 돌아가기' : 'Back to AI Hub'}</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2">
              <h1 className="font-['Space_Grotesk'] text-lg font-black text-white tracking-tight flex items-center gap-2">
                AI Hub <span className="text-amber-400">Admin Console</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-[10px]">
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                OPERATOR
              </span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2">
            <div className="h-8 px-2.5 bg-[#171a2e] border border-white/10 rounded-xl text-xs flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold text-[10px] flex items-center justify-center">
                👑
              </div>
              <span className="font-mono text-gray-300 text-[11px] max-w-[140px] truncate">
                {currentUser.email}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="sticky top-20 bg-[#0f1220] border border-white/10 rounded-2xl p-3 space-y-1 shadow-xl">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {isKo ? '운영 관리 메뉴' : 'Management Menu'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.5]' : 'text-gray-400 group-hover:text-amber-400'}`} />
                    <span>{isKo ? item.labelKo : item.labelEn}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-[#181c30] text-amber-400 border border-amber-400/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/5 px-2 text-[11px] text-gray-500">
              <div>AI Hub Engine v2.5</div>
              <div className="text-[10px] text-gray-600">Admin Authorization Enforced</div>
            </div>
          </div>
        </aside>

        {/* Right Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              currentUserEmail={currentUser.email}
              lang={lang}
              tools={tools}
              notices={notices}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefreshData={() => {}}
              showToast={showToast}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              currentUserEmail={currentUser.email}
              lang={lang}
              showToast={showToast}
            />
          )}

          {activeTab === 'tools' && (
            <AdminToolsTab
              currentUserEmail={currentUser.email}
              lang={lang}
              tools={tools}
              onUpdateTools={onUpdateTools}
              showToast={showToast}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab
              currentUserEmail={currentUser.email}
              lang={lang}
              notices={notices}
              onUpdateNotices={onUpdateNotices}
              showToast={showToast}
            />
          )}

          {activeTab === 'chatbot' && (
            <AdminChatbotTab
              currentUserEmail={currentUser.email}
              lang={lang}
              tools={tools}
              showToast={showToast}
            />
          )}

          {activeTab === 'system' && (
            <AdminSystemTab
              currentUserEmail={currentUser.email}
              lang={lang}
              showToast={showToast}
            />
          )}

          {activeTab === 'developer' && (
            <AdminDeveloperTab
              currentUserEmail={currentUser.email}
              lang={lang}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              currentUserEmail={currentUser.email}
              lang={lang}
              showToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
};
