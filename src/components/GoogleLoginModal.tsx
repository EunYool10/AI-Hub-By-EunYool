import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { safeFetchJson } from '../lib/api';
import { Language, UI_TEXT } from '../lib/translations';
import { UserProfile } from '../types';

export type { UserProfile };

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  lang?: Language;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'ko',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGisReady, setIsGisReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Send Google OAuth ID Token (credential) to backend for verification
  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setErrorMessage(lang === 'ko' ? 'Google OAuth 인증 자격 증명이 수신되지 않았습니다.' : 'Google OAuth credential not received.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiRes = await safeFetchJson<{ user: any; error?: string }>('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (apiRes.ok && apiRes.data?.user) {
        const userData = apiRes.data.user;
        const authenticatedUser: UserProfile = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          role: userData.role,
          isAdmin: userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN',
        };

        onLoginSuccess(authenticatedUser);
        onClose();
      } else {
        setErrorMessage(apiRes.error || (lang === 'ko' ? 'Google ID 토큰 백엔드 검증에 실패했습니다.' : 'Failed backend verification of Google ID Token.'));
      }
    } catch (err) {
      console.error('Google OAuth backend verification error:', err);
      setErrorMessage(lang === 'ko' ? '서버 인증 처리 중 오류가 발생했습니다.' : 'An error occurred during server authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize Google Identity Services (GIS) single official button
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const initializeClient = async () => {
      let clientId =
        (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
        '711747484809-0u95nfple024afln320mt1cglk268oi5.apps.googleusercontent.com';

      try {
        const res = await safeFetchJson<{ oAuthClientId?: string }>('/api/config');
        if (res.ok && res.data?.oAuthClientId) {
          clientId = res.data.oAuthClientId;
        }
      } catch (e) {
        console.warn('Could not fetch config endpoint, using default client ID:', e);
      }

      if (!isMounted) return;

      const initGIS = () => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              use_fedcm_for_prompt: false,
            });

            if (googleBtnRef.current) {
              googleBtnRef.current.innerHTML = '';
              window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                width: 280,
              });
              setIsGisReady(true);
            }
          } catch (e) {
            console.warn('Google Identity Services render error:', e);
          }
        }
      };

      if (window.google?.accounts?.id) {
        initGIS();
      } else {
        const timer = setInterval(() => {
          if (window.google?.accounts?.id) {
            initGIS();
            clearInterval(timer);
          }
        }, 300);
      }
    };

    initializeClient();

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      isMounted = false;
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title={lang === 'ko' ? '닫기' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header - Official OAuth Modal */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            {/* Official Google G Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white">
            {UI_TEXT.googleLoginModal.title[lang]}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {UI_TEXT.googleLoginModal.subtitle[lang]}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Single Official Google OAuth Button */}
        <div className="flex flex-col items-center justify-center my-6 min-h-[50px]">
          {isSubmitting && (
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#6c63ff]" />
              <span>{UI_TEXT.googleLoginModal.verifying[lang]}</span>
            </div>
          )}

          {!isGisReady && !isSubmitting && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span>{UI_TEXT.googleLoginModal.loadingGis[lang]}</span>
            </div>
          )}

          <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
        </div>

        {/* Security guarantee notice */}
        <div className="pt-4 border-t border-white/10 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{UI_TEXT.googleLoginModal.securityTitle[lang]}</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {UI_TEXT.googleLoginModal.securityDesc[lang]}
          </p>
        </div>
      </div>
    </div>
  );
};
