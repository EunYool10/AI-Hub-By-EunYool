import React from 'react';
import { FileText, X } from 'lucide-react';
import { Language } from '../lib/translations';
import { cn } from '../lib/cn';
import { Modal, ModalBody } from './ui/Modal';
import { IconButton } from './ui/Button';

export type TermsTab = 'terms' | 'privacy';

interface TermsModalProps {
  isOpen: boolean;
  tab: TermsTab;
  onTabChange: (tab: TermsTab) => void;
  onClose: () => void;
  lang: Language;
}

const EFFECTIVE = '2026년 10월 27일';
const CONTACT = 'eunyool100208@gmail.com';

type Section = { title: string; body: (string | string[])[] };

const TERMS: Section[] = [
  {
    title: '제1조 (목적)',
    body: ['이 약관은 AI Hub(이하 "서비스")가 제공하는 AI 도구 안내·검색·추천 서비스의 이용 조건과 절차, 운영자와 이용자의 권리·의무를 정합니다.'],
  },
  {
    title: '제2조 (서비스 내용)',
    body: [
      '서비스는 다음 기능을 무료로 제공합니다.',
      ['분야별 AI 도구 목록, 검색, 상세 정보, 랜덤 추천', '즐겨찾기와 화면 설정(이용자의 브라우저에 저장)', '공지사항, 문의·불편 접수'],
      '서비스에 소개된 도구는 각 회사가 운영하는 외부 서비스입니다. 가격, 기능, 이용 조건은 예고 없이 바뀔 수 있으니 이용 전 각 공식 사이트에서 확인해 주세요.',
    ],
  },
  {
    title: '제3조 (회원가입과 로그인)',
    body: [
      '이용자는 Google 또는 카카오 계정으로 로그인할 수 있습니다. 로그인하지 않아도 목록 보기와 검색은 이용할 수 있습니다.',
      '로그인하면 이 약관과 개인정보 처리방침에 동의한 것으로 봅니다.',
    ],
  },
  {
    title: '제4조 (이용자의 의무)',
    body: [
      '이용자는 다음 행위를 해서는 안 됩니다.',
      ['다른 사람의 계정이나 정보를 도용하는 행위', '욕설, 비방, 광고, 스팸 등을 문의로 반복해 보내는 행위', '서비스의 정상적인 운영을 방해하거나 보안을 우회하려는 행위', '관련 법령이나 공공질서에 어긋나는 행위'],
    ],
  },
  {
    title: '제5조 (이용 제한)',
    body: ['운영자는 이용자가 제4조를 위반하면 사전 안내 없이 해당 계정의 이용을 정지할 수 있습니다. 정지에 이의가 있으면 아래 연락처로 알려 주세요.'],
  },
  {
    title: '제6조 (책임의 한계)',
    body: [
      '서비스는 도구 정보를 정확하게 안내하려고 노력하지만, 외부 도구의 이용 결과와 그 서비스의 변경·중단에 대해서는 책임을 지지 않습니다.',
      '도구 선택과 이용은 이용자의 판단에 따릅니다.',
    ],
  },
  {
    title: '제7조 (약관의 변경)',
    body: ['약관을 바꿀 때는 시행일 7일 전부터 공지사항으로 알립니다. 바뀐 약관에 동의하지 않으면 이용을 그만두고 계정 삭제를 요청할 수 있습니다.'],
  },
  {
    title: '제8조 (문의)',
    body: [`서비스와 약관에 관한 문의는 사이트의 "문의하기" 또는 ${CONTACT} 으로 보내 주세요.`],
  },
];

const PRIVACY: Section[] = [
  {
    title: '1. 수집하는 정보',
    body: [
      [
        'Google 로그인: 이름, 이메일 주소, 프로필 사진',
        '카카오 로그인: 닉네임, 프로필 사진 (이용자가 동의한 경우 이메일 주소)',
        '문의 접수: 이름, 회신받을 이메일, 문의 내용',
        '자동 기록: 가입일과 마지막 로그인 시각',
      ],
      '즐겨찾기, 최근 검색어, 화면 설정은 이용자의 브라우저에만 저장되며 운영자에게 전송되지 않습니다.',
    ],
  },
  {
    title: '2. 이용 목적',
    body: [['로그인과 계정 확인', '문의·불편 사항 처리와 회신', '서비스 운영 정책 위반 계정의 이용 제한']],
  },
  {
    title: '3. 보관 기간',
    body: [
      '계정 정보는 탈퇴(계정 삭제) 요청 시까지 보관하고, 요청을 받으면 지체 없이 삭제합니다.',
      '문의 내용은 처리 완료 후 1년간 보관한 뒤 삭제합니다.',
    ],
  },
  {
    title: '4. 처리 위탁',
    body: [['Google Firebase: 로그인 처리와 데이터 저장', '카카오: 카카오 로그인 처리'], '수집한 정보를 판매하거나 위 목적 밖으로 제3자에게 제공하지 않습니다.'],
  },
  {
    title: '5. 이용자의 권리',
    body: [`이용자는 언제든 자신의 정보 열람, 수정, 삭제를 요청할 수 있습니다. ${CONTACT} 으로 요청하면 확인 후 처리합니다.`],
  },
  {
    title: '6. 개인정보 보호 책임자',
    body: [`AI Hub 운영자 · ${CONTACT}`],
  },
];

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, tab, onTabChange, onClose, lang }) => {
  const isKo = lang === 'ko';
  const sections = tab === 'terms' ? TERMS : PRIVACY;
  const tabs: { id: TermsTab; label: string }[] = [
    { id: 'terms', label: isKo ? '이용약관' : 'Terms of Service' },
    { id: 'privacy', label: isKo ? '개인정보 처리방침' : 'Privacy Policy' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" zIndex={320} labelledBy="terms-title">
      <div className="flex items-center gap-3 px-5 sm:px-6 pt-5 pb-3 border-b border-line">
        <span className="w-9 h-9 rounded-xl bg-accent/12 text-brand inline-flex items-center justify-center">
          <FileText className="w-[18px] h-[18px]" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="terms-title" className="text-lg font-bold tracking-tight text-fg">
            {isKo ? '약관 및 정책' : 'Terms & policies'}
          </h2>
          <p className="text-xs text-muted">{isKo ? `시행일 ${EFFECTIVE}` : 'Effective October 27, 2026 (Korean original)'}</p>
        </div>
        <IconButton label={isKo ? '닫기' : 'Close'} onClick={onClose}>
          <X className="w-5 h-5" />
        </IconButton>
      </div>
      <div className="px-5 sm:px-6 pt-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-line" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                'h-8 px-3.5 rounded-lg text-sm font-medium transition-colors',
                tab === t.id ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <ModalBody className="py-5 space-y-5 text-sm leading-relaxed text-fg-2">
        {sections.map((s) => (
          <section key={s.title}>
            <h3 className="font-semibold text-fg mb-1.5">{s.title}</h3>
            {s.body.map((part, i) =>
              Array.isArray(part) ? (
                <ul key={i} className="my-1.5 pl-5 list-disc space-y-1 marker:text-subtle">
                  {part.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="mt-1">
                  {part}
                </p>
              )
            )}
          </section>
        ))}
      </ModalBody>
    </Modal>
  );
};
