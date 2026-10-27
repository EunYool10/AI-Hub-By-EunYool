import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sun, X, Palette, Languages, Database } from 'lucide-react';
import { Language } from '../lib/translations';
import { getStoredSettings, resetStoredSettings, updateStoredSettings, ThemeMode, UserSettings } from '../lib/settings';
import { cn } from '../lib/cn';
import { Modal, ModalBody } from './ui/Modal';
import { Button, IconButton } from './ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToast: (message: string) => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="py-5 first:pt-1 border-b border-line last:border-0">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-fg mb-3.5">
      <span className="text-muted">{icon}</span>
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </section>
);

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm text-fg-2">{label}</p>
      {hint && <p className="text-xs text-subtle mt-0.5">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-11 h-6 rounded-full transition-colors disabled:opacity-40',
      checked ? 'bg-accent' : 'bg-fg/15'
    )}
  >
    <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
  </button>
);

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-surface-2 border border-line" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn('h-8 px-3 rounded-lg text-sm transition-colors', value === o.id ? 'bg-surface text-fg font-medium shadow-sm' : 'text-muted hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, lang, onToast }) => {
  const isKo = lang === 'ko';
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  useEffect(() => {
    if (!isOpen) return;
    setSettings(getStoredSettings());
  }, [isOpen]);

  const update = (updater: (prev: UserSettings) => UserSettings) => setSettings(updateStoredSettings(updater));

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: isKo ? '라이트' : 'Light', icon: <Sun className="w-5 h-5" /> },
    { id: 'dark', label: isKo ? '다크' : 'Dark', icon: <Moon className="w-5 h-5" /> },
    { id: 'system', label: isKo ? '시스템' : 'System', icon: <Monitor className="w-5 h-5" /> },
  ];

  const clearKey = (key: string, event: string | null, message: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
    if (event) window.dispatchEvent(new Event(event));
    onToast(message);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" zIndex={250} labelledBy="settings-title">
      <div className="flex items-center px-5 sm:px-6 pt-5 pb-2">
        <h2 id="settings-title" className="flex-1 text-lg font-bold tracking-tight text-fg">
          {isKo ? '설정' : 'Settings'}
        </h2>
        <IconButton label={isKo ? '닫기' : 'Close'} onClick={onClose} className="-mr-2">
          <X className="w-5 h-5" />
        </IconButton>
      </div>
      <ModalBody className="pt-2 pb-4">
        <Section icon={<Palette className="w-4 h-4" />} title={isKo ? '화면' : 'Display'}>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={isKo ? '테마' : 'Theme'}>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={settings.theme === t.id}
                onClick={() => update((p) => ({ ...p, theme: t.id }))}
                className={cn(
                  'h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-sm transition-colors',
                  settings.theme === t.id ? 'border-accent bg-accent/10 text-fg font-medium ring-2 ring-accent/20' : 'border-line text-muted hover:text-fg hover:border-line-strong'
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <Row label={isKo ? '글자 크기' : 'Text size'}>
            <Segmented
              value={settings.accessibility.fontSize}
              onChange={(fontSize) => update((p) => ({ ...p, accessibility: { ...p.accessibility, fontSize } }))}
              options={[
                { id: 'small', label: isKo ? '작게' : 'S' },
                { id: 'medium', label: isKo ? '보통' : 'M' },
                { id: 'large', label: isKo ? '크게' : 'L' },
              ]}
            />
          </Row>
          <Row label={isKo ? '움직임 줄이기' : 'Reduce motion'} hint={isKo ? '화면 전환 효과를 끕니다' : 'Turns off animations'}>
            <Toggle
              label={isKo ? '움직임 줄이기' : 'Reduce motion'}
              checked={!settings.accessibility.animations}
              onChange={(v) => update((p) => ({ ...p, accessibility: { ...p.accessibility, animations: !v } }))}
            />
          </Row>
        </Section>

        <Section icon={<Languages className="w-4 h-4" />} title={isKo ? '언어' : 'Language'}>
          <Row label={isKo ? '표시 언어' : 'Display language'}>
            <Segmented
              value={settings.language}
              onChange={(language) => update((p) => ({ ...p, language }))}
              options={[
                { id: 'ko', label: '한국어' },
                { id: 'en', label: 'English' },
              ]}
            />
          </Row>
        </Section>

        <Section icon={<Database className="w-4 h-4" />} title={isKo ? '이 기기에 저장된 정보' : 'Saved on this device'}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => clearKey('ai_hub_recent_searches', null, isKo ? '최근 검색어를 지웠어요.' : 'Recent searches cleared.')}>
              {isKo ? '최근 검색어 지우기' : 'Clear recent searches'}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (window.confirm(isKo ? '즐겨찾기를 모두 지울까요?' : 'Remove all bookmarks?')) {
                  clearKey('aiBookmarksHub', 'aihub_bookmarks_changed', isKo ? '즐겨찾기를 모두 지웠어요.' : 'Bookmarks cleared.');
                }
              }}
            >
              {isKo ? '즐겨찾기 모두 지우기' : 'Clear bookmarks'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setSettings(resetStoredSettings());
                onToast(isKo ? '설정을 처음 상태로 되돌렸어요.' : 'Settings reset.');
              }}
            >
              {isKo ? '설정 초기화' : 'Reset settings'}
            </Button>
          </div>
        </Section>
      </ModalBody>
    </Modal>
  );
};
