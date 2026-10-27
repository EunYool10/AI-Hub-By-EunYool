import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Camera,
  Check,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles,
  Lock,
  Upload,
  RefreshCw,
  Edit3,
  Globe,
  Palette,
  Moon,
  Sun,
  Volume2,
  Play,
  Square,
  Eye,
  RotateCcw,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../types';
import { Language, UI_TEXT } from '../lib/translations';
import { safeFetchJson } from '../lib/api';
import { saveStoredUser } from '../lib/authStorage';
import {
  getStoredSettings,
  saveStoredSettings,
  resetStoredSettings,
  UserSettings,
} from '../lib/settings';
import { ttsManager } from '../lib/ttsManager';

export type UserProfileTab = 'profile' | 'general' | 'chatbot' | 'accessibility';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: UserProfileTab;
  currentUser: UserProfile | null;
  onProfileUpdated?: (updatedUser: UserProfile) => void;
  onOpenAdminConsole?: () => void;
  onOpenLoginModal?: () => void;
  onSuccess?: (msg: string) => void;
  lang?: Language;
  onLangChange?: (newLang: Language) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aiden',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cosmo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Spark',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Atlas',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  currentUser,
  onProfileUpdated,
  onOpenAdminConsole,
  onOpenLoginModal,
  onSuccess,
  lang = 'ko',
  onLangChange,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<UserProfileTab>(initialTab);

  // Profile Form States
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings States
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset tab and populate inputs on open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Default to general tab if not logged in and profile tab was requested
      if (!currentUser && initialTab === 'profile') {
        setActiveTab('general');
      } else {
        setActiveTab(initialTab);
      }

      if (currentUser) {
        setDisplayName(currentUser.displayName || '');
        setNickname(currentUser.nickname || '');
        setBio(currentUser.bio || '');
        setPhotoURL(currentUser.photoURL || '');
      }

      setSettings(getStoredSettings());
      setSuccessMessage(null);
      setErrorMessage(null);
      setShowAvatarPicker(false);

      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, initialTab, currentUser]);

  // Sync settings when external changes fire
  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      } else {
        setSettings(getStoredSettings());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai_hub_global_settings' || e.key === 'ai_hub_lang' || e.key === null) {
        setSettings(getStoredSettings());
      }
    };

    window.addEventListener('aihub_settings_changed', handleSettingsChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('aihub_settings_changed', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load browser voices for TTS
  useEffect(() => {
    const updateVoices = () => {
      const voices = ttsManager.getAvailableVoices(lang);
      setAvailableVoices(voices);
    };

    updateVoices();
    const unsubscribe = ttsManager.subscribeVoices(updateVoices);
    return () => unsubscribe();
  }, [lang]);

  // ESC key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isPreviewPlaying) ttsManager.stop();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPreviewPlaying, onClose]);

  if (!isOpen) return null;

  // Settings update handler
  const handleUpdateSettings = (updater: (prev: UserSettings) => UserSettings) => {
    const updated = updater(settings);
    setSettings(updated);
    saveStoredSettings(updated);

    if (updated.language !== lang && onLangChange) {
      onLangChange(updated.language);
    }
  };

  const handleToggleLanguage = (newLang: Language) => {
    handleUpdateSettings((prev) => ({ ...prev, language: newLang }));
  };

  const handlePreviewVoice = () => {
    if (isPreviewPlaying) {
      ttsManager.stop();
      setIsPreviewPlaying(false);
      return;
    }

    setIsPreviewPlaying(true);
    ttsManager.preview(
      settings.tts,
      settings.language || lang,
      () => setIsPreviewPlaying(false),
      () => setIsPreviewPlaying(false)
    );
  };

  const handleResetSettings = () => {
    ttsManager.stop();
    setIsPreviewPlaying(false);
    const defaults = resetStoredSettings();
    setSettings(defaults);
    if (onLangChange) onLangChange(defaults.language);
    setShowResetConfirm(false);
    onSuccess?.(lang === 'ko' ? '설정이 기본값으로 초기화되었습니다.' : 'Settings restored to defaults.');
  };

  // Avatar file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'ko' ? '이미지 파일만 업로드할 수 있습니다.' : 'Only image files are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(lang === 'ko' ? '이미지 크기는 최대 2MB 이하여야 합니다.' : 'Image size must be 2MB or less.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoURL(event.target.result as string);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setErrorMessage(lang === 'ko' ? '이름을 입력해주세요.' : 'Please enter your name.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await safeFetchJson<{ success: boolean; user?: any; error?: string }>(
        '/api/user/profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
          },
          body: JSON.stringify({
            displayName: trimmedName,
            nickname: nickname.trim(),
            bio: bio.trim(),
            photoURL: photoURL.trim(),
          }),
        }
      );

      if (res.ok && res.data?.success && res.data?.user) {
        const updated: UserProfile = {
          ...currentUser,
          displayName: res.data.user.displayName,
          nickname: res.data.user.nickname,
          bio: res.data.user.bio,
          photoURL: res.data.user.photoURL,
          lastActiveAt: res.data.user.lastActiveAt,
        };

        saveStoredUser(updated);
        onProfileUpdated?.(updated);
        onSuccess?.(lang === 'ko' ? '프로필이 성공적으로 저장되었습니다.' : 'Profile updated successfully.');
        setSuccessMessage(lang === 'ko' ? '프로필이 성공적으로 저장되었습니다.' : 'Profile updated successfully.');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setErrorMessage(res.data?.error || (lang === 'ko' ? '프로필 저장에 실패했습니다.' : 'Failed to update profile.'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (lang === 'ko' ? '오류가 발생했습니다.' : 'An error occurred.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaultPhoto = () => {
    if (!currentUser) return;
    setPhotoURL(`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-surface border border-line-strong rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixed) */}
        <div className="bg-surface-2 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-accent to-mint flex items-center justify-center text-white shadow-md shadow-accent/20 shrink-0">
              {activeTab === 'profile' ? (
                <User className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-fg tracking-tight">
                  {lang === 'ko' ? '설정 및 프로필' : 'Settings & Profile'}
                </h2>
                {currentUser?.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[0.6875rem] font-extrabold bg-amber-400/20 border border-amber-400/40 text-amber-300 inline-flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-muted font-normal mt-0.5">
                {lang === 'ko'
                  ? '프로필 정보, 테마, 음성 합성 및 시스템 환경을 설정합니다.'
                  : 'Manage profile details, theme, voice synthesis, and preferences.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isPreviewPlaying) ttsManager.stop();
              onClose();
            }}
            aria-label="Close"
            className="p-2 text-muted hover:text-fg hover:bg-fg/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-bg px-4 py-2 border-b border-line flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-accent text-white shadow-md shadow-accent/30'
                : 'text-muted hover:text-fg hover:bg-fg/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '내 프로필' : 'Profile'}</span>
            {!currentUser && (
              <span className="text-[0.6875rem] px-1.5 py-0.2 rounded bg-fg/10 text-muted">
                {lang === 'ko' ? '로그인 필요' : 'Login'}
              </span>
            )}
          </button>

          {/* General & Theme Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-accent text-white shadow-md shadow-accent/30'
                : 'text-muted hover:text-fg hover:bg-fg/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{UI_TEXT.settings.tabGeneral[lang]}</span>
          </button>

          {/* Chatbot & TTS Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('chatbot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chatbot'
                ? 'bg-accent text-white shadow-md shadow-accent/30'
                : 'text-muted hover:text-fg hover:bg-fg/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{UI_TEXT.settings.tabChatbot[lang]}</span>
          </button>

          {/* Accessibility Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('accessibility')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'accessibility'
                ? 'bg-accent text-white shadow-md shadow-accent/30'
                : 'text-muted hover:text-fg hover:bg-fg/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{UI_TEXT.settings.tabAccessibility[lang]}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 box-border no-scrollbar">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in">
              {currentUser ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Notifications */}
                  {successMessage && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold animate-in fade-in">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Admin Banner */}
                  {currentUser.isAdmin && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-400/30 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                          <Crown className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-amber-200">
                            {lang === 'ko' ? '시스템 관리자 권한 활성화' : 'Administrator Privileges Active'}
                          </h4>
                          <p className="text-xs text-amber-300/80">
                            {lang === 'ko'
                              ? 'AI Hub 전체 시스템 및 사용자 관리 콘솔에 대한 모든 권한이 부여되어 있습니다.'
                              : 'You have full access to the AI Hub system and user management console.'}
                          </p>
                        </div>
                      </div>

                      {onOpenAdminConsole && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAdminConsole();
                          }}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                        >
                          {lang === 'ko' ? '운영 콘솔 이동' : 'Open Console'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Profile Picture Card */}
                  <div className="p-4 bg-surface-2 border border-line rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-fg-2 uppercase tracking-wider">
                        {lang === 'ko' ? '프로필 이미지' : 'Profile Image'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="text-xs text-brand hover:text-brand font-semibold transition-colors cursor-pointer"
                        >
                          {showAvatarPicker
                            ? lang === 'ko'
                              ? '선택창 닫기'
                              : 'Close Avatars'
                            : lang === 'ko'
                            ? '아바타 프리셋'
                            : 'Preset Avatars'}
                        </button>
                        <span className="text-subtle">|</span>
                        <button
                          type="button"
                          onClick={handleRestoreDefaultPhoto}
                          className="text-xs text-muted hover:text-fg font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {lang === 'ko' ? '기본값 복원' : 'Reset'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-3 border-2 border-line-strong shadow-md flex items-center justify-center shrink-0">
                          {photoURL ? (
                            <img
                              src={photoURL}
                              alt="Avatar"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent to-mint flex items-center justify-center text-white text-2xl font-bold">
                              {(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-accent hover:bg-accent text-white rounded-lg shadow-md transition-transform active:scale-95 cursor-pointer"
                          title="사진 파일 업로드"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full text-left">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-fg/10 hover:bg-fg/15 border border-line text-fg-2 hover:text-fg rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {lang === 'ko' ? '사진 파일 선택 (최대 2MB)' : 'Upload File (Max 2MB)'}
                          </button>
                        </div>

                        {/* Direct Image URL input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder={lang === 'ko' ? '직접 이미지 URL 입력 (https://...)' : 'Image URL (https://...)'}
                            className="flex-1 bg-surface border border-line rounded-lg px-3 py-1.5 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-accent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUrlInput.trim()) {
                                setPhotoURL(customUrlInput.trim());
                                setCustomUrlInput('');
                              }
                            }}
                            className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-brand hover:text-fg rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                          >
                            {lang === 'ko' ? '적용' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preset Avatar Selection Grid */}
                    {showAvatarPicker && (
                      <div className="pt-3 border-t border-line animate-in fade-in">
                        <p className="text-xs text-muted mb-2">
                          {lang === 'ko' ? '원하는 아바타 아이콘을 선택하세요:' : 'Select an avatar preset:'}
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {PRESET_AVATARS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPhotoURL(url)}
                              className={`p-1 rounded-xl border transition-all cursor-pointer aspect-square flex items-center justify-center bg-surface-3 hover:scale-105 ${
                                photoURL === url
                                  ? 'border-accent ring-2 ring-accent/40'
                                  : 'border-line hover:border-line-strong'
                              }`}
                            >
                              <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4">
                    {/* Display Name */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-fg-2">
                          {lang === 'ko' ? '이름 (Display Name)' : 'Display Name'} <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[0.6875rem] text-subtle">{displayName.length}/50</span>
                      </div>
                      <div className="relative">
                        <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={50}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={lang === 'ko' ? '사용자 이름을 입력하세요' : 'Enter your name'}
                          className="w-full bg-surface-2 border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-accent transition-all"
                        />
                      </div>
                    </div>

                    {/* Nickname / Alias */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-fg-2">
                          {lang === 'ko' ? '닉네임 (별칭)' : 'Nickname (Alias)'}
                        </label>
                        <span className="text-[0.6875rem] text-subtle">{nickname.length}/30</span>
                      </div>
                      <div className="relative">
                        <Sparkles className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={30}
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder={
                            lang === 'ko'
                              ? '커뮤니티 및 대화에 표시될 닉네임 (선택사항)'
                              : 'Nickname or alias (optional)'
                          }
                          className="w-full bg-surface-2 border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-accent transition-all"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-fg-2">
                          {lang === 'ko' ? '한 줄 소개 (Bio)' : 'Bio / Introduction'}
                        </label>
                        <span className="text-[0.6875rem] text-subtle">{bio.length}/250</span>
                      </div>
                      <div className="relative">
                        <Edit3 className="w-4 h-4 text-muted absolute left-3 top-3" />
                        <textarea
                          maxLength={250}
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={
                            lang === 'ko'
                              ? '자신을 소개하는 간단한 문구를 작성하세요.'
                              : 'Write a short description about yourself.'
                          }
                          className="w-full bg-surface-2 border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-accent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Account Security & Metadata */}
                  <div className="p-4 bg-surface-2 border border-line rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-fg-2 uppercase tracking-wider block">
                      {lang === 'ko' ? '계정 및 인증 정보' : 'Account & Authentication Info'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Authenticated Email */}
                      <div className="p-2.5 bg-surface border border-line rounded-xl">
                        <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
                          <Mail className="w-3.5 h-3.5 text-muted" />
                          {lang === 'ko' ? '인증된 이메일' : 'Verified Email'}
                          <span title="수정 불가" className="ml-auto flex items-center">
                            <Lock className="w-3 h-3 text-subtle" />
                          </span>
                        </span>
                        <span className="font-mono text-fg-2 font-semibold break-all">
                          {currentUser.email}
                        </span>
                      </div>

                      {/* Account Status */}
                      <div className="p-2.5 bg-surface border border-line rounded-xl">
                        <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
                          <Shield className="w-3.5 h-3.5 text-muted" />
                          {lang === 'ko' ? '계정 상태' : 'Account Status'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 font-bold">
                            {lang === 'ko' ? '정상 활성화 (Active)' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Joined At */}
                      <div className="p-2.5 bg-surface border border-line rounded-xl">
                        <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          {lang === 'ko' ? '계정 생성일' : 'Joined Date'}
                        </span>
                        <span className="text-fg-2 font-medium">
                          {(currentUser.isAdmin || currentUser.role === 'ADMIN' || currentUser.email?.toLowerCase() === 'deer123424@gmail.com' || currentUser.joinedAt === '-')
                            ? '-'
                            : (currentUser.joinedAt || (lang === 'ko' ? '가입일 정보 없음' : 'N/A'))}
                        </span>
                      </div>

                      {/* Last Active */}
                      <div className="p-2.5 bg-surface border border-line rounded-xl">
                        <span className="text-xs text-muted flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-muted" />
                          {lang === 'ko' ? '최근 접속일' : 'Last Active'}
                        </span>
                        <span className="text-fg-2 font-medium">
                          {currentUser.lastActiveAt || (lang === 'ko' ? '기록 없음' : 'N/A')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSaving}
                      className="px-4 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 hover:text-fg rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      {lang === 'ko' ? '취소' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accent/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'ko' ? '저장 중...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'ko' ? '프로필 저장' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center bg-surface-2 border border-line rounded-2xl space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-mint flex items-center justify-center mx-auto text-white shadow-lg">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-fg">
                      {lang === 'ko' ? '로그인이 필요한 서비스입니다' : 'Sign in Required'}
                    </h3>
                    <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                      {lang === 'ko'
                        ? 'Google 계정으로 로그인하여 나만의 커스텀 프로필 아바타와 닉네임을 설정해보세요.'
                        : 'Sign in with your Google account to customize your personal avatar and profile nickname.'}
                    </p>
                  </div>

                  {onOpenLoginModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLoginModal();
                      }}
                      className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-lg shadow-accent/30 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{lang === 'ko' ? 'Google 로그인하기' : 'Sign in with Google'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GENERAL & THEME */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Language Switch */}
              <div className="bg-surface-2 p-4.5 rounded-2xl border border-line space-y-3">
                <label className="text-xs font-bold text-fg-2 block flex items-center gap-2">
                  <Globe className="w-4 h-4 text-mint" />
                  <span>{UI_TEXT.settings.languageLabel[lang]}</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleLanguage('ko')}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.language === 'ko'
                        ? 'bg-accent/20 border-accent text-fg shadow-md'
                        : 'bg-surface border-line text-muted hover:text-fg'
                    }`}
                  >
                    <span>🇰🇷 {UI_TEXT.settings.languageKo[lang]}</span>
                    {settings.language === 'ko' && <Check className="w-4 h-4 text-mint" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLanguage('en')}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.language === 'en'
                        ? 'bg-accent/20 border-accent text-fg shadow-md'
                        : 'bg-surface border-line text-muted hover:text-fg'
                    }`}
                  >
                    <span>🇺🇸 {UI_TEXT.settings.languageEn[lang]}</span>
                    {settings.language === 'en' && <Check className="w-4 h-4 text-mint" />}
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="bg-surface-2 p-4.5 rounded-2xl border border-line space-y-3">
                <label className="text-xs font-bold text-fg-2 block flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand" />
                  <span>{UI_TEXT.settings.themeLabel[lang]}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateSettings((p) => ({ ...p, theme: 'dark' }))}
                    className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-accent/20 border-accent text-fg shadow-md'
                        : 'bg-surface border-line text-muted hover:text-fg'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-brand" />
                    <span className="text-xs">{UI_TEXT.settings.themeDark[lang]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateSettings((p) => ({ ...p, theme: 'light' }))}
                    className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md font-bold'
                        : 'bg-surface border-line text-muted hover:text-fg'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs">{UI_TEXT.settings.themeLight[lang]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateSettings((p) => ({ ...p, theme: 'system' }))}
                    className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      settings.theme === 'system'
                        ? 'bg-mint/20 border-mint text-mint shadow-md'
                        : 'bg-surface border-line text-muted hover:text-fg'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-mint" />
                    <span className="text-xs">{UI_TEXT.settings.themeSystem[lang]}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHATBOT & TTS */}
          {activeTab === 'chatbot' && (
            <div className="space-y-5 animate-in fade-in">
              {/* TTS Enable Toggle */}
              <div className="bg-surface-2 p-4.5 rounded-2xl border border-line flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-fg flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-mint" />
                    <span>{UI_TEXT.settings.ttsEnableLabel[lang]}</span>
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {lang === 'ko'
                      ? 'AI 답변을 사람의 목소리로 생생하게 읽어줍니다.'
                      : 'Read AI responses aloud with natural voice.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSettings((p) => ({
                      ...p,
                      tts: { ...p.tts, enabled: !p.tts.enabled },
                    }))
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                    settings.tts.enabled ? 'bg-mint' : 'bg-line-strong'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.tts.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* TTS Voice Selector & Sliders */}
              {settings.tts.enabled && (
                <div className="bg-surface-2 p-4.5 rounded-2xl border border-line space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-fg-2 block">
                      {UI_TEXT.settings.ttsVoiceLabel[lang]}
                    </label>
                    {availableVoices.length > 0 ? (
                      <select
                        value={settings.tts.voice}
                        onChange={(e) =>
                          handleUpdateSettings((p) => ({
                            ...p,
                            tts: { ...p.tts, voice: e.target.value },
                          }))
                        }
                        className="w-full bg-surface border border-line focus:border-accent text-fg rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">
                          {lang === 'ko' ? '기본 브라우저 권장 음성' : 'Default Browser Recommended Voice'}
                        </option>
                        {availableVoices.map((v) => (
                          <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-amber-300/80 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20">
                        {UI_TEXT.settings.ttsVoiceLoading[lang]}
                      </p>
                    )}
                  </div>

                  {/* Speed Rate Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-fg-2">
                      <span>{UI_TEXT.settings.ttsRateLabel[lang]}</span>
                      <span className="text-mint font-mono font-bold">{settings.tts.rate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="2.0"
                      step="0.25"
                      value={settings.tts.rate}
                      onChange={(e) =>
                        handleUpdateSettings((p) => ({
                          ...p,
                          tts: { ...p.tts, rate: parseFloat(e.target.value) },
                        }))
                      }
                      className="w-full accent-[#00d4aa] cursor-pointer"
                    />
                    <div className="flex justify-between text-[0.6875rem] text-subtle font-mono">
                      <span>0.75x (Slow)</span>
                      <span>1.0x (Normal)</span>
                      <span>2.0x (Fast)</span>
                    </div>
                  </div>

                  {/* Pitch Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-fg-2">
                      <span>{UI_TEXT.settings.ttsPitchLabel[lang]}</span>
                      <span className="text-brand font-mono font-bold">{settings.tts.pitch.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={settings.tts.pitch}
                      onChange={(e) =>
                        handleUpdateSettings((p) => ({
                          ...p,
                          tts: { ...p.tts, pitch: parseFloat(e.target.value) },
                        }))
                      }
                      className="w-full accent-[#6c63ff] cursor-pointer"
                    />
                  </div>

                  {/* Voice Preview Button */}
                  <div className="pt-2 border-t border-line flex flex-wrap items-center justify-between gap-2 max-w-full">
                    <button
                      type="button"
                      onClick={handlePreviewVoice}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0 ${
                        isPreviewPlaying
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-accent hover:bg-accent-hover text-white'
                      }`}
                    >
                      {isPreviewPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>{UI_TEXT.settings.ttsPreviewStopBtn[lang]}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>{UI_TEXT.settings.ttsPreviewBtn[lang]}</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs text-muted italic break-words [word-break:break-word] min-w-0 max-w-full">
                      "{UI_TEXT.settings.ttsPreviewText[lang]}"
                    </span>
                  </div>
                </div>
              )}

              {/* Auto Read Toggle */}
              <div className="bg-surface-2 p-4.5 rounded-2xl border border-line flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-fg">
                    {UI_TEXT.settings.ttsAutoPlayLabel[lang]}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {lang === 'ko'
                      ? 'AI 답변이 생성되면 자동으로 음성을 재생합니다.'
                      : 'Automatically play voice upon receiving AI response.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSettings((p) => ({
                      ...p,
                      tts: { ...p.tts, autoPlay: !p.tts.autoPlay },
                    }))
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                    settings.tts.autoPlay ? 'bg-accent' : 'bg-line-strong'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.tts.autoPlay ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-surface-2 p-4.5 rounded-2xl border border-line flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-fg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{UI_TEXT.settings.animationLabel[lang]}</span>
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {lang === 'ko'
                      ? '화면 전환 및 호버 애니메이션 효과를 활성화합니다.'
                      : 'Enable smooth UI motion and hover effects.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSettings((p) => ({
                      ...p,
                      accessibility: {
                        ...p.accessibility,
                        animations: !p.accessibility.animations,
                      },
                    }))
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                    settings.accessibility.animations ? 'bg-mint' : 'bg-line-strong'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.accessibility.animations ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls (Fixed) */}
        <div className="bg-surface-2 px-4 py-3.5 sm:px-6 sm:py-4 border-t border-line flex items-center justify-between shrink-0">
          {activeTab !== 'profile' ? (
            <>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-semibold text-muted hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{UI_TEXT.settings.resetBtn[lang]}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPreviewPlaying) ttsManager.stop();
                  onClose();
                }}
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-xs shadow-md shadow-accent/20 transition-all cursor-pointer"
              >
                {UI_TEXT.settings.saveBtn[lang]}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-muted">
              <span>{currentUser ? `${currentUser.displayName || currentUser.email}` : (lang === 'ko' ? '비로그인 사용자' : 'Guest')}</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-fg/10 hover:bg-fg/15 text-fg-2 hover:text-fg rounded-xl font-semibold transition-all cursor-pointer"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          )}
        </div>

        {/* Reset Confirmation Overlay */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[50] flex items-center justify-center p-6 animate-in fade-in box-border">
            <div className="bg-surface-2 border border-rose-500/30 rounded-2xl p-5 max-w-sm w-full space-y-4 text-center">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto animate-bounce" />
              <div>
                <h3 className="text-sm font-bold text-fg">{UI_TEXT.settings.resetConfirmTitle[lang]}</h3>
                <p className="text-xs text-muted mt-1">{UI_TEXT.settings.resetConfirmDesc[lang]}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-fg/10 hover:bg-fg/20 text-fg-2 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {UI_TEXT.settings.cancelBtn[lang]}
                </button>
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-500/30 transition-colors cursor-pointer"
                >
                  {UI_TEXT.settings.resetConfirmBtn[lang]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
