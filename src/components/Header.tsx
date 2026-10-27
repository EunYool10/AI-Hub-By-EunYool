import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Crown,
  LogOut,
  Megaphone,
  Settings,
  User,
  ChevronDown,
  Shield,
  Search,
  Sun,
  Moon,
  Menu,
  Languages,
  X,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { UserProfile } from '../types';
import { UI_TEXT } from '../lib/translations';
import { getStoredSettings, updateStoredSettings } from '../lib/settings';
import { cn } from '../lib/cn';
import { AIHubBrandLogo } from './AIHubBrandLogo';
import { Button, IconButton } from './ui/Button';
import { Modal, ModalBody } from './ui/Modal';
import { Avatar, GoogleGlyph } from './ui/Identity';

interface HeaderProps {
  totalCount: number;
  bookmarkCount: number;
  customCount: number;
  currentUser: UserProfile | null;
  lang: 'ko' | 'en';
  onToggleLang: () => void;
  onOpenNoticeModal: () => void;
  onOpenInquiryModal: () => void;
  onOpenOtherApps: () => void;
  /** Left out on the static site, where there is no server to sign in against. */
  onOpenGoogleLogin?: () => void;
  onOpenProfileModal?: () => void;
  onOpenAdminCenter: () => void;
  onOpenAdminConsole?: () => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
  hasNotices?: boolean;
  /** Compact search shown in the bar once the hero search scrolls away */
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
  onRequestSearch?: () => void;
}

const useEffectiveTheme = () => {
  const read = () => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.getAttribute('data-theme') || 'dark';
  };
  const [theme, setTheme] = useState<string>(read);
  useEffect(() => {
    const sync = () => setTheme(read());
    window.addEventListener('aihub_settings_changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aihub_settings_changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return theme;
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  lang,
  onToggleLang,
  onOpenNoticeModal,
  onOpenInquiryModal,
  onOpenOtherApps,
  onOpenGoogleLogin,
  onOpenProfileModal,
  onOpenAdminCenter,
  onOpenAdminConsole,
  onLogout,
  onOpenSettings,
  hasNotices = false,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  searchInputRef,
  onRequestSearch,
}) => {
  const isKo = lang === 'ko';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const theme = useEffectiveTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setIsScrolled(scrollTop > 4);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAccountOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setIsAccountOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isAccountOpen]);

  const toggleTheme = () => {
    const current = getStoredSettings().theme;
    const next = current === 'light' || (current === 'system' && isLight) ? 'dark' : 'light';
    updateStoredSettings({ theme: next });
  };

  const displayName = currentUser
    ? currentUser.nickname || currentUser.displayName || currentUser.email.split('@')[0]
    : '';

  const runAndClose = (fn?: () => void) => () => {
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    fn?.();
  };

  const navButton =
    'relative h-9 px-3 rounded-lg text-sm font-medium text-fg-2 hover:text-fg hover:bg-fg/[0.06] transition-colors inline-flex items-center gap-2';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200',
          isScrolled ? 'bg-bg/80 backdrop-blur-xl border-line' : 'bg-bg/0 border-transparent'
        )}
      >
        <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-3">
          {/* Brand */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 shrink-0 rounded-lg -ml-1 pl-1 pr-2 py-1"
            aria-label="AI Hub"
          >
            <AIHubBrandLogo className="w-8 h-8" />
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-[1.0625rem] font-bold tracking-tight text-fg rainbow-text">AI Hub</span>
              <span className="hidden sm:inline text-xs font-medium text-subtle">by Yool</span>
            </span>
          </a>

          {currentUser?.isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 h-6 px-2 rounded-full bg-amber-400/12 border border-amber-400/30 text-amber-300 text-[0.6875rem] font-bold tracking-wide">
              <Crown className="w-3 h-3" />
              ADMIN
            </span>
          )}

          {/* Primary nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2" aria-label={isKo ? '주요 메뉴' : 'Primary'}>
            <button type="button" onClick={onOpenNoticeModal} className={navButton}>
              <Megaphone className="w-4 h-4 text-muted" />
              {UI_TEXT.header.notices[lang]}
              {hasNotices && <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />}
            </button>
            <button type="button" onClick={onOpenInquiryModal} className={navButton}>
              <MessageSquare className="w-4 h-4 text-muted" />
              {UI_TEXT.header.inquiry[lang]}
            </button>
            <button type="button" onClick={onOpenOtherApps} className={navButton}>
              <LayoutGrid className="w-4 h-4 text-muted" />
              {isKo ? '다른 앱' : 'More apps'}
            </button>
          </nav>

          <div className="flex-1" />

          {/* Compact search (desktop, after hero search scrolls away) */}
          <div
            className={cn(
              'hidden md:block w-64 lg:w-80 transition-all duration-200',
              showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
            )}
            aria-hidden={!showSearch}
          >
            <label className="relative block">
              <span className="sr-only">{UI_TEXT.controls.searchPlaceholder[lang]}</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                tabIndex={showSearch ? 0 : -1}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={isKo ? 'AI 도구 검색' : 'Search AI tools'}
                className="w-full h-9 rounded-lg bg-surface-2 border border-line pl-9 pr-10 text-sm text-fg placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center h-5 px-1.5 rounded border border-line text-[0.6875rem] font-sans text-subtle">
                /
              </kbd>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <IconButton label={isKo ? '검색' : 'Search'} onClick={onRequestSearch} className="md:hidden">
              <Search className="w-[18px] h-[18px]" />
            </IconButton>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label={isKo ? 'Switch to English' : '한국어로 전환'}
              title={isKo ? 'Switch to English' : '한국어로 전환'}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold text-muted hover:text-fg hover:bg-fg/[0.07] transition-colors"
            >
              <Languages className="w-4 h-4" />
              {isKo ? 'EN' : 'KO'}
            </button>

            <IconButton
              label={isLight ? (isKo ? '다크 모드로 전환' : 'Switch to dark mode') : isKo ? '라이트 모드로 전환' : 'Switch to light mode'}
              onClick={toggleTheme}
            >
              {isLight ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            </IconButton>

            {onOpenSettings && (
              <IconButton label={UI_TEXT.settings.title[lang]} onClick={onOpenSettings} className="max-sm:hidden">
                <Settings className="w-[18px] h-[18px]" />
              </IconButton>
            )}

            <span className="hidden sm:block w-px h-5 bg-line mx-1.5" aria-hidden="true" />

            {currentUser?.isAdmin && onOpenAdminConsole && (
              <Button
                variant="warn"
                size="sm"
                onClick={onOpenAdminConsole}
                className="max-lg:hidden mr-1"
                title={isKo ? '운영 콘솔 열기' : 'Open admin console'}
              >
                <Crown className="w-3.5 h-3.5" />
                {isKo ? '운영 콘솔' : 'Console'}
              </Button>
            )}

            {currentUser ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isAccountOpen}
                  aria-label={isKo ? '계정 메뉴' : 'Account menu'}
                  className="inline-flex items-center gap-2 h-9 pl-1 pr-1.5 sm:pr-2 rounded-full sm:rounded-lg hover:bg-fg/[0.07] transition-colors"
                >
                  <Avatar user={currentUser} className="w-7 h-7 text-sm" />
                  <span className="hidden lg:block max-w-[120px] truncate text-sm font-medium text-fg">{displayName}</span>
                  <ChevronDown
                    className={cn('hidden sm:block w-3.5 h-3.5 text-subtle transition-transform', isAccountOpen && 'rotate-180')}
                  />
                </button>

                {isAccountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-surface shadow-pop overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="p-4 flex items-center gap-3 border-b border-line">
                      <Avatar user={currentUser} className="w-10 h-10 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-fg truncate">{displayName}</p>
                          <span
                            className={cn(
                              'shrink-0 px-1.5 py-px rounded text-[0.625rem] font-bold tracking-wide',
                              currentUser.isAdmin ? 'bg-amber-400/15 text-amber-300' : 'bg-fg/[0.07] text-muted'
                            )}
                          >
                            {currentUser.isAdmin ? 'ADMIN' : 'USER'}
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate mt-0.5">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="p-1.5 text-sm">
                      {onOpenProfileModal && (
                        <MenuItem icon={<User className="w-4 h-4" />} onClick={runAndClose(onOpenProfileModal)}>
                          {isKo ? '내 프로필' : 'My profile'}
                        </MenuItem>
                      )}
                      {onOpenSettings && (
                        <MenuItem icon={<Settings className="w-4 h-4" />} onClick={runAndClose(onOpenSettings)}>
                          {isKo ? '환경 설정' : 'Preferences'}
                        </MenuItem>
                      )}
                      {currentUser.isAdmin && onOpenAdminConsole && (
                        <MenuItem icon={<Crown className="w-4 h-4 text-amber-400" />} onClick={runAndClose(onOpenAdminConsole)}>
                          {isKo ? '운영 관리 콘솔' : 'Admin console'}
                        </MenuItem>
                      )}
                      {currentUser.isAdmin && (
                        <MenuItem icon={<Shield className="w-4 h-4" />} onClick={runAndClose(onOpenAdminCenter)}>
                          {isKo ? '관리자 센터' : 'Admin center'}
                        </MenuItem>
                      )}
                      <div className="my-1.5 h-px bg-line" />
                      <MenuItem icon={<LogOut className="w-4 h-4" />} onClick={runAndClose(onLogout)} danger>
                        {isKo ? '로그아웃' : 'Log out'}
                      </MenuItem>
                    </div>
                  </div>
                )}
              </div>
            ) : onOpenGoogleLogin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenGoogleLogin}
                className="h-9 px-2.5 sm:px-3.5"
                aria-label={UI_TEXT.header.login[lang]}
              >
                <GoogleGlyph />
                <span className="hidden sm:inline">{isKo ? '로그인' : 'Sign in'}</span>
              </Button>
            )}

            <IconButton
              label={isKo ? '메뉴' : 'Menu'}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden"
              data-mobile-menu
            >
              <Menu className="w-5 h-5" />
            </IconButton>
          </div>
        </div>

        {/* Reading progress */}
        <div
          className="absolute left-0 bottom-0 h-[2px] bg-accent rainbow-accent-bg transition-[width] duration-75 ease-linear"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />
      </header>

      {/* Mobile menu sheet */}
      <Modal isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} size="sm" zIndex={260}>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span className="text-sm font-semibold text-muted">{isKo ? '메뉴' : 'Menu'}</span>
          <IconButton label={isKo ? '닫기' : 'Close'} onClick={() => setIsMobileMenuOpen(false)} className="-mr-2">
            <X className="w-5 h-5" />
          </IconButton>
        </div>
        <ModalBody className="pt-1 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4">
          {currentUser ? (
            <button
              type="button"
              onClick={runAndClose(onOpenProfileModal)}
              disabled={!onOpenProfileModal}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line text-left disabled:cursor-default"
            >
              <Avatar user={currentUser} className="w-10 h-10 text-base" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg truncate">{displayName}</span>
                <span className="block text-xs text-muted truncate">{currentUser.email}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-subtle" />
            </button>
          ) : onOpenGoogleLogin && (
            <Button variant="primary" size="lg" className="w-full" onClick={runAndClose(onOpenGoogleLogin)}>
              <span className="w-6 h-6 rounded-full bg-white inline-flex items-center justify-center">
                <GoogleGlyph />
              </span>
              {UI_TEXT.header.login[lang]}
            </Button>
          )}

          <div className="rounded-xl border border-line divide-y divide-line overflow-hidden">
            <SheetItem icon={<Megaphone className="w-[18px] h-[18px]" />} onClick={runAndClose(onOpenNoticeModal)}>
              {UI_TEXT.header.notices[lang]}
              {hasNotices && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-accent inline-block align-middle" />}
            </SheetItem>
            <SheetItem icon={<MessageSquare className="w-[18px] h-[18px]" />} onClick={runAndClose(onOpenInquiryModal)}>
              {UI_TEXT.header.inquiry[lang]}
            </SheetItem>
            <SheetItem icon={<LayoutGrid className="w-[18px] h-[18px]" />} onClick={runAndClose(onOpenOtherApps)}>
              {isKo ? '개발자의 다른 앱' : 'More apps by the developer'}
            </SheetItem>
            {onOpenSettings && (
              <SheetItem icon={<Settings className="w-[18px] h-[18px]" />} onClick={runAndClose(onOpenSettings)}>
                {UI_TEXT.settings.title[lang]}
              </SheetItem>
            )}
            <SheetItem
              icon={<Languages className="w-[18px] h-[18px]" />}
              onClick={() => onToggleLang()}
              trailing={<span className="text-xs font-semibold text-muted">{isKo ? '한국어 → EN' : 'English → KO'}</span>}
            >
              {isKo ? '언어' : 'Language'}
            </SheetItem>
          </div>

          {currentUser?.isAdmin && (
            <div className="rounded-xl border border-amber-400/30 divide-y divide-line overflow-hidden">
              {onOpenAdminConsole && (
                <SheetItem icon={<Crown className="w-[18px] h-[18px] text-amber-400" />} onClick={runAndClose(onOpenAdminConsole)}>
                  {isKo ? '운영 관리 콘솔' : 'Admin console'}
                </SheetItem>
              )}
              <SheetItem icon={<Shield className="w-[18px] h-[18px]" />} onClick={runAndClose(onOpenAdminCenter)}>
                {isKo ? '관리자 센터' : 'Admin center'}
              </SheetItem>
            </div>
          )}

          {currentUser && (
            <Button variant="danger" size="md" className="w-full" onClick={runAndClose(onLogout)}>
              <LogOut className="w-4 h-4" />
              {isKo ? '로그아웃' : 'Log out'}
            </Button>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; onClick: () => void; danger?: boolean; children: React.ReactNode }> = ({
  icon,
  onClick,
  danger,
  children,
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-left transition-colors',
      danger ? 'text-rose-400 hover:bg-rose-500/10' : 'text-fg-2 hover:text-fg hover:bg-fg/[0.06]'
    )}
  >
    <span className={cn('shrink-0', !danger && 'text-muted')}>{icon}</span>
    <span className="font-medium">{children}</span>
  </button>
);

const SheetItem: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, onClick, trailing, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 min-h-[52px] bg-surface hover:bg-surface-2 text-left transition-colors"
  >
    <span className="text-muted shrink-0">{icon}</span>
    <span className="flex-1 text-[0.9375rem] font-medium text-fg">{children}</span>
    {trailing ?? <ChevronRight className="w-4 h-4 text-subtle" />}
  </button>
);
