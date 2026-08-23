import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUp, Sparkles, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { AICard } from './components/AICard';
import { AIDetailModal } from './components/AIDetailModal';
import { NoticeModal } from './components/NoticeModal';
import { RandomModal } from './components/RandomModal';
import { InquiryModal } from './components/InquiryModal';
import { GoogleLoginModal, UserProfile } from './components/GoogleLoginModal';
import { UserProfileModal, UserProfileTab } from './components/UserProfileModal';
import { AdminModal } from './components/AdminModal';
import { AdminConsole } from './components/admin/AdminConsole';
import { AIChatbot } from './components/AIChatbot';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { AdminStatusPanel } from './components/AdminStatusPanel';
import { INITIAL_AI_TOOLS } from './data/aiToolsData';
import { AITool, Category, NoticeItem } from './types';
import { getStoredUser, saveStoredUser, clearStoredUser } from './lib/authStorage';
import { getStoredSettings, updateStoredSettings, UserSettings } from './lib/settings';
import { safeFetchJson } from './lib/api';
import { getCategoryLabel } from './lib/translations';

export default function App() {
  // Google Logged In User State with resilient localStorage restoration
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());

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
        return [...INITIAL_AI_TOOLS, ...parsedCustom];
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
            setAiTools([...INITIAL_AI_TOOLS, ...parsedCustom]);
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
    setCurrentUser(null);
    clearStoredUser();
    showToast('로그아웃 되었습니다.');
  };

  const handleToggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      let updated: number[];
      if (prev.includes(id)) {
        updated = prev.filter((bId) => bId !== id);
        showToast(lang === 'en' ? 'Bookmark removed' : '북마크가 해제되었습니다');
      } else {
        updated = [...prev, id];
        showToast(lang === 'en' ? '⭐ Bookmark added!' : '⭐ 북마크 등록 완료!');
      }
      try {
        localStorage.setItem('aiBookmarksHub', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('aihub_bookmarks_changed', { detail: updated }));
      } catch (e) {
        console.error('Failed to save bookmarks:', e);
      }
      return updated;
    });
  };

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
    setBookmarks((prev) => {
      const updated = prev.filter((bId) => bId !== id);
      try {
        localStorage.setItem('aiBookmarksHub', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('aihub_bookmarks_changed', { detail: updated }));
      } catch (e) {
        console.error('Failed to save bookmarks:', e);
      }
      return updated;
    });
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

  const activeBookmarksCount = useMemo(() => {
    return bookmarks.filter((id) => activeTools.some((t) => t.id === id)).length;
  }, [bookmarks, activeTools]);

  // Filtered & sorted tools
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let result = activeTools.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q)) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q))) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === '전체' || item.category === selectedCategory;

      const matchesPrice =
        selectedPrice === 'all' || item.price === selectedPrice;

      const matchesBookmark = !showBookmarksOnly || bookmarks.includes(item.id);

      return matchesSearch && matchesCategory && matchesPrice && matchesBookmark;
    });

    if (selectedSort === 'abc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    } else {
      result = [...result].sort((a, b) => a.id - b.id);
    }

    return result;
  }, [
    activeTools,
    searchQuery,
    selectedCategory,
    selectedPrice,
    selectedSort,
    showBookmarksOnly,
    bookmarks,
  ]);

  const customToolsCount = useMemo(
    () => activeTools.filter((t) => t.isCustom).length,
    [activeTools]
  );

  // If Full Admin Console is active and user is admin
  if (isAdminConsoleActive && currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0c0e14] text-[#e8eaf2] font-['Noto_Sans_KR',sans-serif]">
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
    <div className="min-h-screen bg-[#0c0e14] text-[#e8eaf2] font-['Noto_Sans_KR',sans-serif] flex flex-col selection:bg-[#6c63ff] selection:text-white">
      {/* Header */}
      <Header
        totalCount={activeTools.length}
        bookmarkCount={activeBookmarksCount}
        customCount={customToolsCount}
        currentUser={currentUser}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
        onOpenInquiryModal={() => setIsInquiryModalOpen(true)}
        onOpenGoogleLogin={() => setIsGoogleLoginOpen(true)}
        onOpenProfileModal={() => {
          setProfileModalTab('profile');
          setIsProfileModalOpen(true);
        }}
        onOpenAdminCenter={() => setIsAdminModalOpen(true)}
        onOpenAdminConsole={() => setIsAdminConsoleActive(true)}
        onLogout={handleLogout}
        onOpenSettings={() => {
          setProfileModalTab('general');
          setIsProfileModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 flex-1 w-full">
        {/* Controls and Category Filters */}
        <Controls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPrice={selectedPrice}
          onPriceChange={setSelectedPrice}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          showBookmarksOnly={showBookmarksOnly}
          onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
          onOpenRandomModal={() => setIsRandomModalOpen(true)}
          lang={lang}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mt-5 sm:mt-6 mb-4 flex-wrap gap-2">
          <div className="text-xs sm:text-sm text-gray-300 flex items-center flex-wrap gap-1.5">
            {searchQuery.trim() ? (
              lang === 'ko' ? (
                <span>
                  검색 결과 <strong className="text-[#00d4aa] font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong>개
                </span>
              ) : (
                <span>
                  Search results: <strong className="text-[#00d4aa] font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong>
                </span>
              )
            ) : selectedCategory !== '전체' ? (
              lang === 'ko' ? (
                <span>
                  <span className="text-[#00d4aa] font-semibold">{getCategoryLabel(selectedCategory, lang)}</span>: 총 <strong className="text-white font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong>개 AI 도구
                </span>
              ) : (
                <span>
                  <span className="text-[#00d4aa] font-semibold">{getCategoryLabel(selectedCategory, lang)}</span>: <strong className="text-white font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong> AI tools
                </span>
              )
            ) : (
              lang === 'ko' ? (
                <span>
                  총 <strong className="text-white font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong>개의 AI 도구
                </span>
              ) : (
                <span>
                  Total <strong className="text-white font-extrabold text-sm sm:text-base px-0.5">{filteredTools.length}</strong> AI tools
                </span>
              )
            )}
            {showBookmarksOnly && (
              <span className="text-amber-400 font-semibold text-xs ml-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                {lang === 'ko' ? '⭐ 북마크 항목만' : '⭐ Bookmarks Only'}
              </span>
            )}
          </div>

          {(searchQuery || selectedCategory !== '전체' || selectedPrice !== 'all' || showBookmarksOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('전체');
                setSelectedPrice('all');
                setShowBookmarksOnly(false);
              }}
              className="text-xs text-[#6c63ff] hover:text-[#00d4aa] hover:underline transition-colors cursor-pointer font-medium"
            >
              {lang === 'ko' ? '필터 초기화 ↺' : 'Reset Filters ↺'}
            </button>
          )}
        </div>

        {/* AI Tools Cards Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#13151f]/50 rounded-3xl border border-white/5 my-4">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {lang === 'ko' ? '검색 결과가 없습니다' : 'No results found'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              {lang === 'ko'
                ? '검색어나 필터 조건을 변경해 보거나, 원하는 AI 도구가 있다면 문의하기로 제안해 주세요!'
                : 'Try changing your search or filters, or suggest an AI tool via Contact!'}
            </p>
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] shadow-md transition-all cursor-pointer"
            >
              <span>{lang === 'ko' ? '문의 / AI 도구 제안하기' : 'Suggest AI Tool / Contact'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
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
                onOpenDetail={(t) => setDetailModalTool(t)}
                index={index}
                lang={lang}
              />
            ))}
          </div>
        )}
      </main>

      {/* Back To Top Button */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-[#1a1d2a] hover:bg-[#6c63ff] border border-white/10 hover:border-[#6c63ff] text-gray-300 hover:text-white rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer hover:-translate-y-1"
          title={lang === 'ko' ? '맨 위로 스크롤' : 'Scroll to top'}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating AI Assistant Chatbot */}
      <AIChatbot
        lang={lang}
        tools={activeTools}
        onSelectTool={(tool) => setDetailModalTool(tool)}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSelectCategory={setSelectedCategory}
        onSearch={setSearchQuery}
        onOpenInquiryModal={() => setIsInquiryModalOpen(true)}
        currentUser={currentUser}
        onOpenSettings={() => {
          setProfileModalTab('chatbot');
          setIsProfileModalOpen(true);
        }}
      />

      {/* Notice Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        lang={lang}
        isAdmin={currentUser?.isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* AI Tool Detail Modal */}
      <AIDetailModal
        tool={detailModalTool}
        isOpen={Boolean(detailModalTool)}
        onClose={() => setDetailModalTool(null)}
        isBookmarked={detailModalTool ? bookmarks.includes(detailModalTool.id) : false}
        onToggleBookmark={handleToggleBookmark}
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
      <Footer onOpenInquiryModal={() => setIsInquiryModalOpen(true)} lang={lang} />
    </div>
  );
}
