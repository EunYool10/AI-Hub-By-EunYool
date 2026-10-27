import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowUp, SearchX, RotateCcw, Lightbulb } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategorySidebar, CategoryChips } from './components/CategoryNav';
import { Toolbar } from './components/Toolbar';
import { Button } from './components/ui/Button';
import { AICard } from './components/AICard';
import { AIDetailModal } from './components/AIDetailModal';
import { NoticeModal } from './components/NoticeModal';
import { RandomModal } from './components/RandomModal';
import { InquiryModal } from './components/InquiryModal';
import { GoogleLoginModal, UserProfile } from './components/GoogleLoginModal';
import { UserProfileModal, UserProfileTab } from './components/UserProfileModal';
import { AdminModal } from './components/AdminModal';
import { AdminConsole } from './components/admin/AdminConsole';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { AdminStatusPanel } from './components/AdminStatusPanel';
import { INITIAL_AI_TOOLS } from './data/aiToolsData';
import { AITool, Category, NoticeItem } from './types';
import { getStoredUser, saveStoredUser, clearStoredUser } from './lib/authStorage';
import { getStoredSettings, updateStoredSettings, UserSettings } from './lib/settings';
import { safeFetchJson } from './lib/api';
import { IS_STATIC_SITE } from './lib/runtime';
import { toolMatches } from './lib/search';
import { getSimilarTools } from './lib/toolTags';
import { finishKakaoLogin, listNotices, loadBookmarks, saveBookmarks, signOutHub, watchSession } from './lib/firebase';
import { LoginModal } from './components/LoginModal';
import { TermsModal, TermsTab } from './components/TermsModal';
import { OtherAppsModal } from './components/OtherAppsModal';
import { HubAdminModal } from './components/HubAdminModal';
import { SettingsModal } from './components/SettingsModal';
import { CATEGORIES, currentCategory } from './lib/categories';
import { getCategoryLabel } from './lib/translations';

// Uid of the account whose bookmarks this browser holds; unset for bookmarks made while signed out.
const BOOKMARK_OWNER_KEY = 'aiBookmarksOwner';
// Last tools opened in the detail window, newest first (this browser only).
const RECENT_KEY = 'aiRecentTools';
const RECENT_LIMIT = 8;

// Tools added in this browser before the categories were renamed keep showing up under the new names.
const withCurrentCategory = (tool: AITool): AITool => ({ ...tool, category: currentCategory(tool.category) });

// #tool=<id> opens that tool's detail window, so a tool can be shared by link.
const toolIdFromHash = () => {
  const m = /^#tool=(\d+)$/.exec(window.location.hash);
  return m ? Number(m[1]) : null;
};

export default function App() {
  // Google Logged In User State with resilient localStorage restoration
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => (IS_STATIC_SITE ? null : getStoredUser()));

  // Language State ('ko' | 'en') with central settings & localStorage persistence
  const [lang, setLang] = useState<'ko' | 'en'>(() => {
    try {
      const stored = getStoredSettings();
      if (stored.language === 'ko' || stored.language === 'en') return stored.language;
      const saved = localStorage.getItem('ai_hub_lang');
      if (saved === 'ko' || saved === 'en') return saved;
      if (typeof navigator !== 'undefined' && navigator.language) {
        return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
      }
      return 'ko';
    } catch {
      return 'ko';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai_hub_lang', lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }, [lang]);

  // Modals state
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<UserProfileTab>('profile');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminConsoleActive, setIsAdminConsoleActive] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<TermsTab | null>(null);
  const [isOtherAppsOpen, setIsOtherAppsOpen] = useState(false);
  const [isHubAdminOpen, setIsHubAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminViewEnabled, setIsAdminViewEnabled] = useState(false);
  const [detailModalTool, setDetailModalTool] = useState<AITool | null>(null);

  // Notices state for synchronization
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_hub_notices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const handleToggleLang = () => {
    const nextLang = lang === 'ko' ? 'en' : 'ko';
    setLang(nextLang);
    updateStoredSettings({ language: nextLang });
    showToast(nextLang === 'ko' ? '🇰🇷 한국어로 전환되었습니다.' : '🇺🇸 Switched to English language.');
  };

  // State for AI tools (combining initial tools + custom local storage tools)
  const [aiTools, setAiTools] = useState<AITool[]>(() => {
    try {
      const savedCustom = localStorage.getItem('aiCustomTools');
      if (savedCustom) {
        const parsedCustom: AITool[] = JSON.parse(savedCustom);
        return [...INITIAL_AI_TOOLS, ...parsedCustom.map(withCurrentCategory)];
      }
    } catch (e) {
      console.error('Failed to parse custom tools from localStorage:', e);
    }
    return INITIAL_AI_TOOLS;
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('aiBookmarksHub');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse bookmarks:', e);
    }
    return [];
  });

  const [recentIds, setRecentIds] = useState<number[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('default');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Back to top visibility
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Multi-tab storage synchronization and backend role re-verification
  useEffect(() => {
    const syncUserSession = () => {
      const stored = getStoredUser();
      setCurrentUser(stored);
    };

    const syncBookmarks = () => {
      try {
        const saved = localStorage.getItem('aiBookmarksHub');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setBookmarks(parsed);
          }
        } else {
          setBookmarks([]);
        }
      } catch (e) {
        console.error('Failed to sync bookmarks across tabs:', e);
      }
    };

    const syncCustomTools = () => {
      try {
        const saved = localStorage.getItem('aiCustomTools');
        if (saved) {
          const parsedCustom: AITool[] = JSON.parse(saved);
          if (Array.isArray(parsedCustom)) {
            setAiTools([...INITIAL_AI_TOOLS, ...parsedCustom.map(withCurrentCategory)]);
          }
        } else {
          setAiTools(INITIAL_AI_TOOLS);
        }
      } catch (e) {
        console.error('Failed to sync custom tools across tabs:', e);
      }
    };

    const syncSettings = (e?: any) => {
      try {
        const stored = getStoredSettings();
        if (e?.detail?.language) {
          setLang(e.detail.language);
        } else if (stored.language === 'ko' || stored.language === 'en') {
          setLang(stored.language);
        }
      } catch (e) {
        console.error('Failed to sync settings across tabs:', e);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null) {
        syncUserSession();
        syncBookmarks();
        syncCustomTools();
        syncSettings();
        return;
      }

      if (e.key === 'aihub_google_user' || e.key === 'ai_hub_google_user' || e.key === 'google_user_profile') {
        syncUserSession();
      } else if (e.key === 'aiBookmarksHub') {
        syncBookmarks();
      } else if (e.key === 'aiCustomTools') {
        syncCustomTools();
      } else if (e.key === 'ai_hub_lang' || e.key === 'ai_hub_global_settings') {
        syncSettings();
      }
    };

    const handleAdminOverlayToggle = (e: any) => {
      if (e?.detail?.enabled !== undefined) {
        setIsAdminViewEnabled(e.detail.enabled);
      } else {
        setIsAdminViewEnabled((prev) => !prev);
      }
    };

    const handleOpenAdminConsole = () => {
      setIsAdminConsoleActive(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('aihub_user_changed', syncUserSession);
    window.addEventListener('aihub_bookmarks_changed', syncBookmarks);
    window.addEventListener('aihub_tools_changed', syncCustomTools);
    window.addEventListener('aihub_settings_changed', syncSettings);
    window.addEventListener('aihub_admin_overlay_toggle', handleAdminOverlayToggle);
    window.addEventListener('aihub_open_admin_console', handleOpenAdminConsole);

    // Initial settings & theme sync
    syncSettings();

    // The static site has no server to ask for notices or the session role.
    if (IS_STATIC_SITE) {
      loadStaticNotices();
    } else {
      // Fetch initial notices
      safeFetchJson<{ notices: NoticeItem[] }>('/api/notices').then((res) => {
        if (res.ok && res.data?.notices && Array.isArray(res.data.notices)) {
          setNotices(res.data.notices);
          localStorage.setItem('ai_hub_notices', JSON.stringify(res.data.notices));
        }
      });

      // Verify session role with server on mount if user is logged in
      const initialUser = getStoredUser();
      if (initialUser?.email) {
        safeFetchJson<{ authenticated: boolean; user?: { role: 'ADMIN' | 'USER'; isAdmin: boolean } }>('/api/auth/me', {
          headers: { 'x-user-email': initialUser.email },
        }).then((res) => {
          if (res.ok && res.data?.authenticated && res.data.user) {
            const updatedUser: UserProfile = {
              ...initialUser,
              role: res.data.user.role,
              isAdmin: res.data.user.isAdmin,
            };
            setCurrentUser(updatedUser);
            saveStoredUser(updatedUser);
          }
        });
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aihub_user_changed', syncUserSession);
      window.removeEventListener('aihub_bookmarks_changed', syncBookmarks);
      window.removeEventListener('aihub_tools_changed', syncCustomTools);
      window.removeEventListener('aihub_settings_changed', syncSettings);
      window.removeEventListener('aihub_admin_overlay_toggle', handleAdminOverlayToggle);
      window.removeEventListener('aihub_open_admin_console', handleOpenAdminConsole);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredUser(user);

    if (user.isAdmin) {
      showToast(`👑 관리자 계정(${user.email})으로 로그인 되었습니다.`);
    } else {
      showToast(`Google 로그인 완료 (${user.displayName || user.email.split('@')[0]})`);
    }
  };

  const handleLogout = () => {
    if (IS_STATIC_SITE) signOutHub();
    setCurrentUser(null);
    clearStoredUser();
    showToast('로그아웃 되었습니다.');
  };

  // Account the bookmarks are saved to (static site, once its list has loaded).
  const bookmarkUidRef = useRef<string | null>(null);

  const commitBookmarks = (updated: number[], toAccount = true) => {
    setBookmarks(updated);
    try {
      localStorage.setItem('aiBookmarksHub', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('aihub_bookmarks_changed', { detail: updated }));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
    if (toAccount && bookmarkUidRef.current) saveBookmarks(updated);
  };

  const handleToggleBookmark = (id: number) => {
    if (bookmarks.includes(id)) {
      commitBookmarks(bookmarks.filter((bId) => bId !== id));
      showToast(lang === 'en' ? 'Bookmark removed' : '북마크가 해제되었습니다');
    } else {
      commitBookmarks([...bookmarks, id]);
      showToast(lang === 'en' ? '⭐ Bookmark added!' : '⭐ 북마크 등록 완료!');
    }
  };

  // Signed in: the account's list replaces this browser's copy, and bookmarks made while signed out join it.
  async function syncAccountBookmarks(uid: string) {
    try {
      const saved = await loadBookmarks();
      const local = JSON.parse(localStorage.getItem('aiBookmarksHub') || '[]');
      const guestIds: number[] =
        Array.isArray(local) && !localStorage.getItem(BOOKMARK_OWNER_KEY) ? local.filter((id) => !saved.includes(id)) : [];
      localStorage.setItem(BOOKMARK_OWNER_KEY, uid);
      bookmarkUidRef.current = uid;
      commitBookmarks([...saved, ...guestIds], guestIds.length > 0);
      if (guestIds.length) {
        showToast(lang === 'en' ? 'Bookmarks on this device were saved to your account' : `이 기기의 북마크 ${guestIds.length}개를 계정에 저장했어요`);
      }
    } catch (e) {
      console.error('[BOOKMARKS] load failed', e);
    }
  }

  // Signed out: the account's copy leaves this browser.
  function dropAccountBookmarks() {
    bookmarkUidRef.current = null;
    try {
      if (!localStorage.getItem(BOOKMARK_OWNER_KEY)) return;
      localStorage.removeItem(BOOKMARK_OWNER_KEY);
    } catch {
      return;
    }
    commitBookmarks([], false);
  }

  const handleAddTool = (newToolData: Omit<AITool, 'id'>) => {
    const newTool: AITool = {
      ...newToolData,
      id: Date.now(),
    };

    setAiTools((prev) => {
      const updated = [newTool, ...prev];
      const customOnly = updated.filter((t) => t.isCustom);
      try {
        localStorage.setItem('aiCustomTools', JSON.stringify(customOnly));
        window.dispatchEvent(new CustomEvent('aihub_tools_changed', { detail: customOnly }));
      } catch (e) {
        console.error('Failed to save custom tool:', e);
      }
      return updated;
    });

    showToast(`✨ '${newTool.name}' 도구가 목록에 등록되었습니다!`);
  };

  const handleDeleteTool = (id: number) => {
    setAiTools((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      const customOnly = updated.filter((t) => t.isCustom);
      try {
        localStorage.setItem('aiCustomTools', JSON.stringify(customOnly));
        window.dispatchEvent(new CustomEvent('aihub_tools_changed', { detail: customOnly }));
      } catch (e) {
        console.error('Failed to save custom tool:', e);
      }
      return updated;
    });
    if (bookmarks.includes(id)) commitBookmarks(bookmarks.filter((bId) => bId !== id));
    showToast('AI 도구가 삭제되었습니다.');
  };

  const handleUpdateAllTools = (updatedTools: AITool[]) => {
    setAiTools(updatedTools);
    try {
      const customOnly = updatedTools.filter((t) => t.isCustom);
      localStorage.setItem('aiCustomTools', JSON.stringify(customOnly));
      window.dispatchEvent(new CustomEvent('aihub_tools_changed', { detail: customOnly }));
    } catch (e) {
      console.error('Failed to save custom tools:', e);
    }
  };

  const handleUpdateAllNotices = (updatedNotices: NoticeItem[]) => {
    setNotices(updatedNotices);
    try {
      localStorage.setItem('ai_hub_notices', JSON.stringify(updatedNotices));
    } catch (e) {
      console.error('Failed to save notices:', e);
    }
  };

  // Active AI tools filter (excludes discontinued or merged tools)
  const activeTools = useMemo(() => {
    return aiTools.filter((item) => !item.status || item.status === 'active' || item.status === 'renamed' || item.status === 'temporarily_unavailable');
  }, [aiTools]);

  const saveRecentIds = (ids: number[]) => {
    setRecentIds(ids);
    try {
      if (ids.length) localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
      else localStorage.removeItem(RECENT_KEY);
    } catch (e) {
      console.error('Failed to save recently viewed tools:', e);
    }
  };

  useEffect(() => {
    if (!detailModalTool) return;
    const id = detailModalTool.id;
    if (recentIds[0] !== id) saveRecentIds([id, ...recentIds.filter((r) => r !== id)].slice(0, RECENT_LIMIT));
  }, [detailModalTool]);

  const recentTools = useMemo(
    () => recentIds.map((id) => activeTools.find((t) => t.id === id)).filter((t): t is AITool => Boolean(t)),
    [recentIds, activeTools]
  );

  const similarTools = useMemo(
    () => (detailModalTool ? getSimilarTools(detailModalTool, activeTools) : []),
    [detailModalTool, activeTools]
  );

  const activeBookmarksCount = useMemo(() => {
    return bookmarks.filter((id) => activeTools.some((t) => t.id === id)).length;
  }, [bookmarks, activeTools]);

  // Tools matching search, price and bookmark filters (category applied separately
  // so the category navigation can show faceted counts)
  const facetTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return activeTools.filter((item) => {
      const matchesSearch = toolMatches(item, q);

      const matchesPrice =
        selectedPrice === 'all' || item.price === selectedPrice;

      const matchesBookmark = !showBookmarksOnly || bookmarks.includes(item.id);

      return matchesSearch && matchesPrice && matchesBookmark;
    });
  }, [activeTools, searchQuery, selectedPrice, showBookmarksOnly, bookmarks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '전체': facetTools.length };
    for (const tool of facetTools) counts[tool.category] = (counts[tool.category] || 0) + 1;
    return counts;
  }, [facetTools]);

  // Filtered & sorted tools
  const filteredTools = useMemo(() => {
    let result = facetTools.filter(
      (item) => selectedCategory === '전체' || item.category === selectedCategory
    );

    if (selectedSort === 'abc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    } else {
      result = [...result].sort((a, b) => a.id - b.id);
    }

    return result;
  }, [facetTools, selectedCategory, selectedSort]);

  const customToolsCount = useMemo(
    () => activeTools.filter((t) => t.isCustom).length,
    [activeTools]
  );

  const freeToolsCount = useMemo(
    () => activeTools.filter((t) => t.price === '무료').length,
    [activeTools]
  );

  // ── Layout helpers ──────────────────────────────────────────────
  const heroSearchInputRef = useRef<HTMLInputElement>(null);
  const heroSearchAnchorRef = useRef<HTMLDivElement>(null);
  const headerSearchInputRef = useRef<HTMLInputElement>(null);
  const directoryRef = useRef<HTMLElement>(null);
  const [isHeroSearchVisible, setIsHeroSearchVisible] = useState(true);

  useEffect(() => {
    const anchor = heroSearchAnchorRef.current;
    if (!anchor || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroSearchVisible(entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [isAdminConsoleActive]);

  const scrollToDirectory = useCallback(() => {
    const el = directoryRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    if (Math.abs(window.scrollY - top) > 8) window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const focusSearch = useCallback(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isHeroSearchVisible && isDesktop && headerSearchInputRef.current) {
      headerSearchInputRef.current.focus();
      return;
    }
    heroSearchAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => heroSearchInputRef.current?.focus({ preventScroll: true }), 250);
  }, [isHeroSearchVisible]);

  // "/" or Ctrl/Cmd+K focuses search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if ((e.key === '/' && !isTyping) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        if (document.querySelector('[role="dialog"]')) return;
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusSearch]);

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    if (directoryRef.current && window.scrollY > directoryRef.current.offsetTop) scrollToDirectory();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('전체');
    setSelectedPrice('all');
    setShowBookmarksOnly(false);
  };

  const openSettings = () => setIsSettingsOpen(true);

  // Static site: Firebase holds the session (Google popup or the Kakao redirect) and the notices.
  function loadStaticNotices() {
    listNotices()
      .then(setNotices)
      .catch((e) => console.error('[NOTICES]', e));
  }

  useEffect(() => {
    if (!IS_STATIC_SITE) return;
    finishKakaoLogin().catch((e) => showToast(e.message || '카카오 로그인에 실패했어요.'));
    return watchSession((user, notice) => {
      setCurrentUser(user);
      if (notice) showToast(notice);
      if (user) syncAccountBookmarks(user.uid);
      else dropAccountBookmarks();
    });
  }, []);

  // The address follows the open detail window, so it can be copied and shared.
  const openToolDetail = (tool: AITool) => {
    setDetailModalTool(tool);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#tool=${tool.id}`);
  };

  const closeToolDetail = () => {
    setDetailModalTool(null);
    if (toolIdFromHash() !== null) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  // Opens the tool a shared link points at, on load and whenever the address changes.
  useEffect(() => {
    const openFromHash = () => {
      const id = toolIdFromHash();
      if (id === null) return;
      const tool = activeTools.find((t) => t.id === id);
      if (tool) {
        setDetailModalTool(tool);
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        showToast(lang === 'en' ? 'That tool is no longer listed.' : '목록에 없는 AI 도구예요.');
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [activeTools]);

  // If Full Admin Console is active and user is admin
  if (isAdminConsoleActive && currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-bg text-fg ">
        <AdminConsole
          currentUser={currentUser}
          lang={lang}
          tools={aiTools}
          notices={notices}
          onUpdateTools={handleUpdateAllTools}
          onUpdateNotices={handleUpdateAllNotices}
          onBackToMain={() => setIsAdminConsoleActive(false)}
          onLogout={handleLogout}
          showToast={showToast}
        />
        <Toast message={toastMessage} />
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-bg text-fg flex flex-col">
      <a
        href="#directory"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-accent-fg focus:text-sm focus:font-semibold"
      >
        {lang === 'ko' ? '본문으로 건너뛰기' : 'Skip to content'}
      </a>

      <Header
        totalCount={activeTools.length}
        bookmarkCount={activeBookmarksCount}
        customCount={customToolsCount}
        currentUser={currentUser}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
        onOpenInquiryModal={() => setIsInquiryModalOpen(true)}
        onOpenGoogleLogin={() => (IS_STATIC_SITE ? setIsLoginOpen(true) : setIsGoogleLoginOpen(true))}
        onOpenProfileModal={
          IS_STATIC_SITE
            ? undefined
            : () => {
                setProfileModalTab('profile');
                setIsProfileModalOpen(true);
              }
        }
        onOpenAdminCenter={() => (IS_STATIC_SITE ? setIsHubAdminOpen(true) : setIsAdminModalOpen(true))}
        onOpenAdminConsole={IS_STATIC_SITE ? undefined : () => setIsAdminConsoleActive(true)}
        onOpenOtherApps={() => setIsOtherAppsOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={openSettings}
        hasNotices={notices.length > 0}
        showSearch={!isHeroSearchVisible}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={headerSearchInputRef}
        onRequestSearch={focusSearch}
      />

      <main className="flex-1">
        <Hero
          lang={lang}
          tools={activeTools}
          recentTools={recentTools}
          onClearRecent={() => saveRecentIds([])}
          onSelectTool={openToolDetail}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            scrollToDirectory();
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmitSearch={scrollToDirectory}
          searchInputRef={heroSearchInputRef}
          searchAnchorRef={heroSearchAnchorRef}
        />

        <section
          id="directory"
          ref={directoryRef}
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 scroll-mt-20"
          aria-label={lang === 'ko' ? 'AI 도구 목록' : 'AI tool directory'}
        >
          <div className="lg:grid lg:grid-cols-[228px_minmax(0,1fr)] lg:gap-10 xl:gap-12">
            <CategorySidebar
              activeCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              counts={categoryCounts}
              lang={lang}
              showBookmarksOnly={showBookmarksOnly}
              onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
              bookmarkCount={activeBookmarksCount}
              onOpenRandomModal={() => setIsRandomModalOpen(true)}
            />

            <div className="min-w-0">
              {/* Mobile / tablet category chips (sticky under the header) */}
              <div className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 mb-5 bg-bg/85 backdrop-blur-xl border-b border-line">
                <CategoryChips
                  activeCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  counts={categoryCounts}
                  lang={lang}
                />
              </div>

              <Toolbar
                lang={lang}
                resultCount={filteredTools.length}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                selectedPrice={selectedPrice}
                onPriceChange={setSelectedPrice}
                selectedSort={selectedSort}
                onSortChange={setSelectedSort}
                showBookmarksOnly={showBookmarksOnly}
                onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
                bookmarkCount={activeBookmarksCount}
                onOpenRandomModal={() => setIsRandomModalOpen(true)}
                onClearSearch={() => setSearchQuery('')}
                onClearCategory={() => setSelectedCategory('전체')}
                onResetAll={handleResetFilters}
              />

              <div className="mt-6">
                {filteredTools.length === 0 ? (
                  <div className="flex flex-col items-center text-center px-6 py-16 sm:py-20 rounded-2xl border border-dashed border-line-strong">
                    <div className="w-14 h-14 rounded-2xl bg-fg/[0.06] flex items-center justify-center text-muted">
                      <SearchX className="w-7 h-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-fg">
                      {showBookmarksOnly && activeBookmarksCount === 0
                        ? lang === 'ko'
                          ? '아직 북마크한 도구가 없어요'
                          : 'No bookmarks yet'
                        : lang === 'ko'
                          ? '조건에 맞는 AI 도구가 없어요'
                          : 'No tools match your filters'}
                    </h3>
                    <p className="mt-2 text-sm text-muted max-w-sm leading-relaxed">
                      {showBookmarksOnly && activeBookmarksCount === 0
                        ? lang === 'ko'
                          ? `카드의 ☆ 버튼을 눌러 자주 쓰는 도구를 모아 보세요.${IS_STATIC_SITE && !currentUser ? ' 로그인하면 다른 기기에서도 볼 수 있어요.' : ''}`
                          : `Tap ☆ on any card to save tools you use often.${IS_STATIC_SITE && !currentUser ? ' Sign in to see them on your other devices.' : ''}`
                        : lang === 'ko'
                          ? '검색어나 필터를 바꿔 보세요. 찾는 도구가 목록에 없다면 제안해 주세요.'
                          : 'Try a different search or filter — or suggest the tool you are looking for.'}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      <Button variant="secondary" onClick={handleResetFilters}>
                        <RotateCcw className="w-4 h-4" />
                        {lang === 'ko' ? '필터 초기화' : 'Reset filters'}
                      </Button>
                      <Button variant="primary" onClick={() => setIsInquiryModalOpen(true)}>
                        <Lightbulb className="w-4 h-4" />
                        {lang === 'ko' ? 'AI 도구 제안하기' : 'Suggest a tool'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                    {filteredTools.map((tool, index) => (
                      <AICard
                        key={tool.id}
                        tool={tool}
                        isBookmarked={bookmarks.includes(tool.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onDeleteCustomTool={
                          tool.isCustom || currentUser?.isAdmin
                            ? () => handleDeleteTool(tool.id)
                            : undefined
                        }
                        onOpenDetail={openToolDetail}
                        index={index}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Back To Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={lang === 'ko' ? '맨 위로' : 'Back to top'}
        title={lang === 'ko' ? '맨 위로' : 'Back to top'}
        tabIndex={showBackTop ? 0 : -1}
        className={`fixed right-5 sm:right-7 bottom-5 sm:bottom-7 z-[80] w-11 h-11 rounded-full border border-line bg-surface/90 backdrop-blur text-fg-2 hover:text-fg hover:border-line-strong shadow-card flex items-center justify-center transition-all duration-200 ${
          showBackTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-[18px] h-[18px]" />
      </button>

      {/* Notice Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        lang={lang}
        isAdmin={currentUser?.isAdmin}
        onOpenAdminModal={() => (IS_STATIC_SITE ? setIsHubAdminOpen(true) : setIsAdminModalOpen(true))}
      />

      {/* AI Tool Detail Modal */}
      <AIDetailModal
        tool={detailModalTool}
        isOpen={Boolean(detailModalTool)}
        onClose={closeToolDetail}
        isBookmarked={detailModalTool ? bookmarks.includes(detailModalTool.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onToast={showToast}
        similarTools={similarTools}
        onSelectTool={openToolDetail}
        lang={lang}
      />

      {/* Random Recommendation Modal */}
      <RandomModal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        tools={activeTools}
        lang={lang}
      />

      {/* Inquiry & AI Suggestion Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        onSuccess={showToast}
        onAddCustomTool={handleAddTool}
        lang={lang}
        currentUser={currentUser}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isGoogleLoginOpen}
        onClose={() => setIsGoogleLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />

      {/* Integrated User Profile & Preferences Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={profileModalTab}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          saveStoredUser(updated);
        }}
        onOpenAdminConsole={() => setIsAdminConsoleActive(true)}
        onOpenLoginModal={() => setIsGoogleLoginOpen(true)}
        onSuccess={showToast}
        lang={lang}
        onLangChange={(newLang) => setLang(newLang)}
      />

      {/* Admin Dashboard Center Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        tools={aiTools}
        onAddTool={handleAddTool}
        onSuccess={showToast}
        lang={lang}
        onSelectCategory={(cat) => setSelectedCategory(cat as Category)}
        onOpenAdminConsole={() => setIsAdminConsoleActive(true)}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Admin Status Panel Overlay (Main Layout Level for Admin Users) */}
      {currentUser?.isAdmin && (
        <AdminStatusPanel
          isOpen={isAdminViewEnabled}
          onClose={() => setIsAdminViewEnabled(false)}
          lang={lang}
        />
      )}

      {/* Footer */}
      <Footer
        onOpenInquiryModal={() => setIsInquiryModalOpen(true)}
        onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
        onOpenRandomModal={() => setIsRandomModalOpen(true)}
        onOpenSettings={openSettings}
        onOpenTerms={setTermsTab}
        onOpenOtherApps={() => setIsOtherAppsOpen(true)}
        lang={lang}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} lang={lang} onToast={showToast} />
      <OtherAppsModal isOpen={isOtherAppsOpen} onClose={() => setIsOtherAppsOpen(false)} lang={lang} />
      <TermsModal isOpen={termsTab !== null} tab={termsTab || 'terms'} onTabChange={setTermsTab} onClose={() => setTermsTab(null)} lang={lang} />
      {IS_STATIC_SITE && (
        <>
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} lang={lang} onOpenTerms={setTermsTab} />
          {currentUser?.isAdmin && (
            <HubAdminModal
              isOpen={isHubAdminOpen}
              onClose={() => setIsHubAdminOpen(false)}
              currentUser={currentUser}
              lang={lang}
              onToast={showToast}
              onNoticesChanged={loadStaticNotices}
            />
          )}
        </>
      )}
    </div>
  );
}
