import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Language } from '../lib/translations';
import { isKakaoReady, signInWithGoogle, startKakaoLogin } from '../lib/firebase';
import { Modal, ModalBody } from './ui/Modal';
import { IconButton } from './ui/Button';
import { GoogleGlyph } from './ui/Identity';
import { AIHubBrandLogo } from './AIHubBrandLogo';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenTerms: (tab: 'terms' | 'policy' | 'privacy') => void;
}

const KakaoGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#000"
      fillOpacity=".9"
      d="M12 3.6c-5.2 0-9.4 3.3-9.4 7.4 0 2.6 1.7 4.9 4.3 6.2l-1.1 4c-.1.3.3.6.6.4l4.7-3.1c.3 0 .6.1.9.1 5.2 0 9.4-3.3 9.4-7.4S17.2 3.6 12 3.6z"
    />
  </svg>
);

/** Social sign-in for the static site: Google, and Kakao once its app key is set in lib/firebase.ts. */
export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, lang, onOpenTerms }) => {
  const isKo = lang === 'ko';
  const [busy, setBusy] = useState<'google' | 'kakao' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const kakaoReady = isKakaoReady();

  const google = async () => {
    setError(null);
    setBusy('google');
    try {
      await signInWithGoogle();
      onClose();
    } catch (e: any) {
      const code = String(e?.code || '');
      if (!code.includes('popup-closed') && !code.includes('cancelled-popup')) {
        setError(
          code.includes('popup-blocked')
            ? isKo ? '팝업이 차단되었어요. 브라우저에서 팝업을 허용한 뒤 다시 눌러 주세요.' : 'The popup was blocked. Allow popups and try again.'
            : isKo ? '구글 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.' : 'Google sign-in failed. Please try again.'
        );
      }
    } finally {
      setBusy(null);
    }
  };

  const kakao = () => {
    setError(null);
    setBusy('kakao');
    startKakaoLogin();
  };

  const button =
    'w-full h-12 rounded-xl inline-flex items-center justify-center gap-2.5 text-[0.9375rem] font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" zIndex={300} labelledBy="login-title">
      <div className="flex justify-end px-3 pt-3">
        <IconButton label={isKo ? '닫기' : 'Close'} onClick={onClose}>
          <X className="w-5 h-5" />
        </IconButton>
      </div>
      <ModalBody className="pt-0 pb-7 px-6 sm:px-8 text-center">
        <AIHubBrandLogo className="w-14 h-14 mx-auto" />
        <h2 id="login-title" className="mt-4 text-xl font-bold tracking-tight text-fg">
          {isKo ? 'AI Hub 시작하기' : 'Sign in to AI Hub'}
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          {isKo ? '로그인하면 공지 알림과 문의 접수를 이용할 수 있어요.' : 'Sign in to send inquiries and follow notices.'}
        </p>

        <div className="mt-7 space-y-2.5">
          <button type="button" onClick={google} disabled={!!busy} className={`${button} bg-white text-[#1f1f1f] border border-black/10 hover:bg-neutral-100`}>
            {busy === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleGlyph className="w-5 h-5" />}
            {isKo ? 'Google로 계속하기' : 'Continue with Google'}
          </button>
          <button
            type="button"
            onClick={kakao}
            disabled={!!busy || !kakaoReady}
            className={`${button} bg-[#FEE500] text-black/85 hover:brightness-95`}
          >
            {busy === 'kakao' ? <Loader2 className="w-5 h-5 animate-spin" /> : <KakaoGlyph />}
            {isKo ? '카카오로 계속하기' : 'Continue with Kakao'}
            {!kakaoReady && <span className="text-xs font-medium opacity-70">({isKo ? '준비 중' : 'coming soon'})</span>}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-rose-400">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-subtle">
          {isKo ? (
            <>
              계속하면 만 14세 이상이며{' '}
              <button type="button" onClick={() => onOpenTerms('terms')} className="underline underline-offset-2 hover:text-fg">
                이용약관
              </button>
              ,{' '}
              <button type="button" onClick={() => onOpenTerms('policy')} className="underline underline-offset-2 hover:text-fg">
                운영정책
              </button>
              ,{' '}
              <button type="button" onClick={() => onOpenTerms('privacy')} className="underline underline-offset-2 hover:text-fg">
                개인정보 처리방침
              </button>
              에 동의하는 것으로 봅니다.
            </>
          ) : (
            <>
              By continuing you confirm you are 14 or older and agree to the{' '}
              <button type="button" onClick={() => onOpenTerms('terms')} className="underline underline-offset-2 hover:text-fg">
                Terms
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => onOpenTerms('privacy')} className="underline underline-offset-2 hover:text-fg">
                Privacy Policy
              </button>
              .
            </>
          )}
        </p>
      </ModalBody>
    </Modal>
  );
};
