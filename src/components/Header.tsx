import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Crown,
  LogOut,
  Globe,
  Megaphone,
  Settings,
  User,
  ChevronDown,
  Shield,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../types';
import { UI_TEXT } from '../lib/translations';
import { AIHubBrandLogo } from './AIHubBrandLogo';

interface HeaderProps {
  totalCount: number;
  bookmarkCount: number;
  customCount: number;
  currentUser: UserProfile | null;
  lang: 'ko' | 'en';
  onToggleLang: () => void;
  onOpenNoticeModal: () => void;
  onOpenInquiryModal: () => void;
  onOpenGoogleLogin: () => void;
  onOpenProfileModal?: () => void;
  onOpenAdminCenter: () => void;
  onOpenAdminConsole?: () => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  bookmarkCount,
  customCount,
  currentUser,
  lang,
  onToggleLang,
  onOpenNoticeModal,
  onOpenInquiryModal,
  onOpenGoogleLogin,
  onOpenProfileModal,
  onOpenAdminCenter,
  onOpenAdminConsole,
  onLogout,
  onOpenSettings,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(pct);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Rainbow Scroll Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[9999] transition-[width] duration-75 ease-linear rounded-r-sm shadow-[0_0_10px_rgba(255,255,255,0.25)]"
        style={{
          width: `${scrollProgress}%`,
          background:
            'linear-gradient(90deg, #ff0080, #ff4500, #ffaa00, #00ff88, #00cfff, #7b2fff, #ff0080)',
          backgroundSize: '200% 100%',
          animation: 'rainbowShift 3s linear infinite',
        }}
      />

      <header className="sticky top-0 z-50 bg-[#0c0e14]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-3.5 gap-2.5 sm:gap-4">
            
            {/* Official AI Hub Brand Logo & Title */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <AIHubBrandLogo className="w-8 h-8 sm:w-9 sm:h-9" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-['Space_Grotesk'] text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white leading-none">
                      AI Hub <span className="text-[#6c63ff]">by Yool</span>
                    </h1>
                    {currentUser?.isAdmin && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] animate-pulse">
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-normal mt-0.5 leading-none">
                    {UI_TEXT.header.subtitle[lang]}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Right Action Controls */}
            <div className="flex items-center justify-start sm:justify-end gap-1.5 sm:gap-2 flex-wrap">
              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  aria-label={UI_TEXT.settings.title[lang]}
                  className="h-8.5 px-2 sm:px-2.5 bg-[#1a1d2a] hover:bg-[#232738] border border-white/10 hover:border-[#6c63ff]/40 rounded-xl text-xs text-gray-300 hover:text-white transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5 group shrink-0"
                  title={UI_TEXT.settings.title[lang]}
                >
                  <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6c63ff] group-hover:rotate-45 transition-transform" />
                  <span className="hidden md:inline font-['Space_Grotesk'] text-[11px] font-bold">
                    {UI_TEXT.settings.title[lang]}
                  </span>
                </button>
              )}

              {/* Language Toggle Switch */}
              <button
                onClick={onToggleLang}
                aria-label={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
                className="h-8.5 px-2 sm:px-2.5 bg-[#1a1d2a] hover:bg-[#232738] border border-white/10 hover:border-[#00d4aa]/40 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5 group shrink-0"
                title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
              >
                <Globe className="w-3.5 h-3.5 text-[#00d4aa]" />
                <span className="font-['Space_Grotesk'] text-[11px] font-extrabold text-gray-300 group-hover:text-white uppercase">
                  {lang === 'ko' ? 'EN' : 'KR'}
                </span>
              </button>

              {/* Notice Button */}
              <button
                onClick={onOpenNoticeModal}
                aria-label={UI_TEXT.header.notices[lang]}
                className="relative h-8.5 px-2.5 sm:px-3 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>{UI_TEXT.header.notices[lang]}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
              </button>

              {/* Inquiry Button */}
              <button
                onClick={onOpenInquiryModal}
                aria-label={UI_TEXT.header.inquiry[lang]}
                className="h-8.5 px-2.5 sm:px-3 bg-[#1a1d2a] hover:bg-[#232738] border border-white/10 hover:border-[#6c63ff]/40 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#6c63ff]" />
                <span>{UI_TEXT.header.inquiry[lang]}</span>
              </button>

              {/* Google Login & Account Controls */}
              {currentUser ? (
                <div className="relative flex items-center gap-1.5 shrink-0" ref={dropdownRef}>
                  {/* Admin Console Quick Button for immediate access */}
                  {currentUser.isAdmin && onOpenAdminConsole && (
                    <button
                      onClick={onOpenAdminConsole}
                      aria-label="Admin Console"
                      className="h-8.5 px-2.5 sm:px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                      title="전체 관리자 콘솔 열기"
                    >
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'ko' ? '운영 콘솔' : 'Console'}</span>
                    </button>
                  )}

                  {/* Profile Trigger Button */}
                  <button
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    aria-label="User Account Menu"
                    className="h-8.5 inline-flex items-center gap-1.5 bg-[#1a1d2a] hover:bg-[#232738] border border-white/10 hover:border-[#6c63ff]/40 pl-1.5 pr-2 rounded-xl text-xs transition-all cursor-pointer group shadow-sm active:scale-95"
                  >
                    {/* User Avatar */}
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#202434] border border-white/20 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white text-[10px] font-bold">
                          {currentUser.isAdmin ? '👑' : (currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span className="text-white font-medium max-w-[80px] sm:max-w-[105px] truncate text-[11px] sm:text-xs">
                      {currentUser.nickname || currentUser.displayName || currentUser.email.split('@')[0]}
                    </span>

                    <ChevronDown className={`w-3 h-3 text-gray-400 group-hover:text-white transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Account Profile Dropdown Menu */}
                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#12141c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header Info */}
                      <div className="p-3.5 bg-[#161924] border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#202434] border border-white/20 flex items-center justify-center shrink-0">
                            {currentUser.photoURL ? (
                              <img
                                src={currentUser.photoURL}
                                alt="Avatar"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] flex items-center justify-center text-white text-base font-bold">
                                {(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">
                                {currentUser.displayName || currentUser.email.split('@')[0]}
                              </h4>
                              {currentUser.isAdmin ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  ADMIN
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/10 text-gray-300 border border-white/10">
                                  USER
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>

                        {/* Status bar */}
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-gray-400">{lang === 'ko' ? '계정 상태' : 'Account Status'}</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {lang === 'ko' ? '정상 활성' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Menu List */}
                      <div className="p-1.5 space-y-0.5 text-xs">
                        {/* My Profile */}
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            onOpenProfileModal?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                        >
                          <User className="w-4 h-4 text-[#6c63ff]" />
                          <span className="font-semibold">{lang === 'ko' ? '내 프로필 관리' : 'My Profile'}</span>
                        </button>

                        {/* Settings */}
                        {onOpenSettings && (
                          <button
                            onClick={() => {
                              setIsAccountDropdownOpen(false);
                              onOpenSettings();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span>{lang === 'ko' ? '환경 설정' : 'Preferences'}</span>
                          </button>
                        )}

                        {/* Admin Console (If Admin) */}
                        {currentUser.isAdmin && onOpenAdminConsole && (
                          <button
                            onClick={() => {
                              setIsAccountDropdownOpen(false);
                              onOpenAdminConsole();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 rounded-xl transition-colors cursor-pointer text-left font-bold"
                          >
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span>{lang === 'ko' ? '운영 관리 콘솔' : 'Admin Console'}</span>
                          </button>
                        )}

                        {/* Quick Admin (If Admin) */}
                        {currentUser.isAdmin && (
                          <button
                            onClick={() => {
                              setIsAccountDropdownOpen(false);
                              onOpenAdminCenter();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                          >
                            <Shield className="w-4 h-4 text-amber-400/80" />
                            <span>{lang === 'ko' ? '빠른 관리자 팝업' : 'Quick Admin Modal'}</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-white/10" />

                        {/* Logout */}
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-left font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{lang === 'ko' ? '로그아웃' : 'Log Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenGoogleLogin}
                  aria-label={UI_TEXT.header.login[lang]}
                  className="h-8.5 px-3 sm:px-3.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-xs shadow-md shadow-white/10 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {/* Google G Icon */}
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{UI_TEXT.header.login[lang]}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

