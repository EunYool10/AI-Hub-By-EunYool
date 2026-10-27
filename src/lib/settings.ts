export type ThemeMode = 'dark' | 'light' | 'rainbow' | 'system';

export interface TTSSettings {
  enabled: boolean;
  voice: string; // Voice URI or name
  rate: number; // 0.75 ~ 2.0
  pitch: number; // 0.5 ~ 1.5
  autoPlay: boolean;
}

export interface AccessibilitySettings {
  animations: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserSettings {
  language: 'ko' | 'en';
  theme: ThemeMode;
  tts: TTSSettings;
  accessibility: AccessibilitySettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'ko',
  theme: 'dark',
  tts: {
    enabled: true,
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    autoPlay: false,
  },
  accessibility: {
    animations: true,
    fontSize: 'medium',
  },
};

const SETTINGS_STORAGE_KEY = 'ai_hub_global_settings';

export const applyTheme = (theme: ThemeMode): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let effectiveTheme: 'dark' | 'light' | 'rainbow' = 'dark';
  if (theme === 'system') {
    const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveTheme = isDark ? 'dark' : 'light';
  } else if (theme === 'light' || theme === 'rainbow' || theme === 'dark') {
    effectiveTheme = theme;
  }

  root.setAttribute('data-theme', effectiveTheme);

  root.classList.remove('light', 'dark', 'theme-rainbow');
  if (effectiveTheme === 'light') {
    root.classList.add('light');
  } else if (effectiveTheme === 'rainbow') {
    root.classList.add('dark', 'theme-rainbow');
  } else {
    root.classList.add('dark');
  }

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', effectiveTheme === 'light' ? '#f6f6f8' : '#0a0a0d');
  }
};

export const applyAccessibility = (accessibility: AccessibilitySettings): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-font-size', accessibility.fontSize || 'medium');
  if (accessibility.animations === false) {
    root.setAttribute('data-motion', 'reduce');
  } else {
    root.removeAttribute('data-motion');
  }
};

export const getStoredSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) {
      applyTheme(DEFAULT_SETTINGS.theme);
      applyAccessibility(DEFAULT_SETTINGS.accessibility);
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(saved);
    const validTheme: ThemeMode =
      parsed.theme === 'light' || parsed.theme === 'rainbow' || parsed.theme === 'system'
        ? parsed.theme
        : 'dark';

    const settings: UserSettings = {
      language: parsed.language === 'en' ? 'en' : 'ko',
      theme: validTheme,
      tts: {
        ...DEFAULT_SETTINGS.tts,
        ...parsed.tts,
      },
      accessibility: {
        ...DEFAULT_SETTINGS.accessibility,
        ...parsed.accessibility,
      },
    };
    applyTheme(settings.theme);
    applyAccessibility(settings.accessibility);
    return settings;
  } catch (e) {
    console.error('Failed to load settings:', e);
    applyTheme(DEFAULT_SETTINGS.theme);
    applyAccessibility(DEFAULT_SETTINGS.accessibility);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (newSettings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    localStorage.setItem('ai_hub_lang', newSettings.language);
    applyTheme(newSettings.theme);
    applyAccessibility(newSettings.accessibility);
    window.dispatchEvent(new CustomEvent('aihub_settings_changed', { detail: newSettings }));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const updateStoredSettings = (
  updater: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)
): UserSettings => {
  const current = getStoredSettings();
  const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  saveStoredSettings(updated);
  return updated;
};

export const resetStoredSettings = (): UserSettings => {
  saveStoredSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const settings = getStoredSettings();
    if (settings.theme === 'system') {
      applyTheme('system');
    }
  });
}

