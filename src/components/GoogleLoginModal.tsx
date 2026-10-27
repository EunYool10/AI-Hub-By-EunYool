import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { safeFetchJson } from '../lib/api';
import { Language, UI_TEXT } from '../lib/translations';
import { UserProfile } from '../types';
import { Modal } from './ui/Modal';
import { IconButton } from './ui/Button';
import { AIHubBrandLogo } from './AIHubBrandLogo';
import { GoogleGlyph } from './ui/Identity';

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
                theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'outline' : 'filled_black',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 300,
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


    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" zIndex={300} labelledBy="login-title">
      <div className="relative px-6 sm:px-8 pt-8 pb-7 text-center">
        <IconButton label={lang === 'ko' ? '닫기' : 'Close'} onClick={onClose} className="absolute right-3 top-3">
          <X className="w-5 h-5" />
        </IconButton>

        <div className="mx-auto w-fit flex items-center gap-2">
          <AIHubBrandLogo className="w-11 h-11" />
          <span className="w-6 h-px bg-line-strong" aria-hidden="true" />
          <span className="w-11 h-11 rounded-full bg-white ring-1 ring-black/[0.07] flex items-center justify-center">
            <GoogleGlyph className="w-5 h-5" />
          </span>
        </div>

        <h2 id="login-title" className="mt-5 text-xl font-bold tracking-tight text-fg">
          {lang === 'ko' ? 'AI Hub에 로그인' : 'Sign in to AI Hub'}
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {lang === 'ko'
            ? 'Google 계정으로 로그인하고 프로필과 설정을 관리하세요.'
            : 'Use your Google account to manage your profile and preferences.'}
        </p>

        {errorMessage && (
          <div role="alert" className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-left text-sm text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 min-h-[52px] flex flex-col items-center justify-center gap-3">
          {isSubmitting && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>{UI_TEXT.googleLoginModal.verifying[lang]}</span>
            </div>
          )}

          {!isGisReady && !isSubmitting && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{UI_TEXT.googleLoginModal.loadingGis[lang]}</span>
            </div>
          )}

          <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
        </div>
      </div>

      <div className="px-6 sm:px-8 py-4 border-t border-line bg-inset rounded-b-2xl flex items-start gap-2.5 text-left">
        <ShieldCheck className="w-4 h-4 mt-0.5 text-mint shrink-0" />
        <p className="text-xs text-muted leading-relaxed">
          <span className="font-semibold text-fg-2">{UI_TEXT.googleLoginModal.securityTitle[lang]}</span>
          <br />
          {UI_TEXT.googleLoginModal.securityDesc[lang]}
        </p>
      </div>
    </Modal>
  );
};
