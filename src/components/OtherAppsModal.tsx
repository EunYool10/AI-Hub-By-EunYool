import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Language } from '../lib/translations';
import { Modal, ModalBody } from './ui/Modal';
import { IconButton } from './ui/Button';

interface OtherAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

// 은율's apps. AI Hub itself is listed too, marked as the one being used.
// icon: a copy of each app's favicon in public/apps (AI Hub uses its own favicon), color: taken from that favicon,
// slow: free server that takes a while to wake up on the first visit.
const APPS: { icon: string; color: string; name: string; about: string; url: string; here?: boolean; slow?: boolean }[] = [
  {
    icon: 'favicon.png',
    color: '#6a5cff',
    name: 'AI Hub',
    about: '분야별로 정리한 AI 도구를 검색하고 비교하는 AI 도구 모음',
    url: 'https://eunyool10.github.io/AI-Hub-By-EunYool/',
    here: true,
  },
  {
    icon: 'apps/fruitarcade.png',
    color: '#f2456f',
    name: '상큼 과일 아케이드 존',
    about: '과일 미니게임 아홉 가지에 미션 · 업적 · 랭킹 · 친구 대결까지',
    url: 'https://eunyool10.github.io/FruitArcade/',
  },
  {
    icon: 'apps/egggame.png',
    color: '#f0a830',
    slow: true,
    name: '계란이의 모험',
    about: '현대 · 고대 · 미래, 세 시대의 계란이가 엄마 품을 찾아 떠나는 선택형 텍스트 어드벤처',
    url: 'https://egggame.onrender.com/',
  },
  {
    icon: 'apps/logicmaze.svg',
    color: '#b8924a',
    name: '논리 미궁: 대우의 열쇠',
    about: '원래 명제의 대우를 골라 다섯 개의 방을 탈출하는 논리 퀴즈 게임',
    url: 'https://eunyool10.github.io/LogicMaze/',
  },
  {
    icon: 'apps/schoolfix.png',
    color: '#1d4ed8',
    slow: true,
    name: 'SchoolFix',
    about: '학교의 불편한 점과 시설 안전 위험을 신고하고 처리 과정을 함께 보는 학교 시설 관리 서비스',
    url: 'https://schoolfix.onrender.com/',
  },
];

// Card in the favicon's color: a left stripe and a light tint of it.
const cardStyle = (color: string): React.CSSProperties => ({
  borderLeftColor: color,
  borderLeftWidth: 4,
  background: `color-mix(in srgb, ${color} 9%, var(--c-surface))`,
});

const AppBody: React.FC<{ app: (typeof APPS)[number]; isKo: boolean }> = ({ app, isKo }) => (
  <>
    <img
      src={`${(import.meta as any).env.BASE_URL}${app.icon}`}
      alt=""
      width={48}
      height={48}
      className="w-12 h-12 shrink-0 rounded-xl border border-line object-cover"
    />
    <span className="min-w-0 flex-1">
      <span className="block font-semibold text-fg leading-tight">{app.name}</span>
      <span className="mt-0.5 block text-xs text-muted leading-relaxed">{app.about}</span>
      {app.slow && (
        <span className="mt-1 block text-[0.6875rem] font-semibold" style={{ color: app.color }}>
          {isKo ? '무료 서버라 처음 열 때 30초쯤 걸릴 수 있어요' : 'Free server: the first load can take ~30 s'}
        </span>
      )}
    </span>
  </>
);

export const OtherAppsModal: React.FC<OtherAppsModalProps> = ({ isOpen, onClose, lang }) => {
  const isKo = lang === 'ko';
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" zIndex={240} labelledBy="apps-title">
      <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-1">
        <div className="flex-1">
          <h2 id="apps-title" className="text-lg font-bold tracking-tight text-fg">
            {isKo ? '개발자의 다른 앱' : 'More apps by the developer'}
          </h2>
          <p className="text-sm text-muted">{isKo ? '은율이 만든 앱들이에요' : 'Apps made by Yool'}</p>
        </div>
        <IconButton label={isKo ? '닫기' : 'Close'} onClick={onClose} className="-mr-2">
          <X className="w-5 h-5" />
        </IconButton>
      </div>
      <ModalBody className="py-4">
        <ul className="space-y-2.5">
          {APPS.map((app) => (
            <li key={app.url}>
              {app.here ? (
                <div className="flex items-center gap-3 rounded-xl border border-line p-3" style={cardStyle(app.color)}>
                  <AppBody app={app} isKo={isKo} />
                  <span className="shrink-0 h-7 px-2.5 inline-flex items-center rounded-full bg-surface border border-line text-[0.6875rem] font-semibold text-fg-2">
                    {isKo ? '지금 여기' : 'You are here'}
                  </span>
                </div>
              ) : (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-line p-3 transition-transform hover:-translate-y-0.5"
                  style={cardStyle(app.color)}
                >
                  <AppBody app={app} isKo={isKo} />
                  <span className="w-8 h-8 shrink-0 rounded-full text-white inline-flex items-center justify-center" style={{ background: app.color }}>
                    <ExternalLink className="w-4 h-4" aria-label={isKo ? '새 창에서 열기' : 'Opens in a new tab'} />
                  </span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  );
};
