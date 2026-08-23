import { TTSSettings } from './settings';

export interface TTSVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
  localService: boolean;
}

export const cleanTextForTTS = (text: string): string => {
  if (!text) return '';

  let clean = text;

  // 1. Remove TOOL_CARD tags
  clean = clean.replace(/\[\[TOOL_CARD:\s*\d+\]\]/gi, '').replace(/\[TOOL_CARD:\s*\d+\]/gi, '');

  // 2. Remove code blocks
  clean = clean.replace(/```[\s\S]*?```/g, ' [코드 예시 생략] ');

  // 3. Remove Markdown images ![alt](url) -> alt or '이미지'
  clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt) => (alt.trim() ? `${alt.trim()}` : ' 이미지 '));

  // 4. Remove Markdown links [text](url) -> text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. Remove standalone image URLs or web URLs so speech synth doesn't spell out URLs
  clean = clean.replace(/https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?/gi, ' 이미지 ');
  clean = clean.replace(/https?:\/\/\S+/gi, ' 웹 링크 ');

  // 6. Remove inline code
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // 7. Remove headers, bold, italics (#, *, _)
  clean = clean.replace(/#{1,6}\s?/g, '');
  clean = clean.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  clean = clean.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');

  // 8. Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '');

  // 9. Remove multiple spaces and newlines
  clean = clean.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

  return clean;
};

export class TTSManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.initVoices();
  }

  private initVoices = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const load = () => {
      try {
        this.voices = window.speechSynthesis.getVoices();
        if (this.voices.length > 0) {
          this.isLoaded = true;
          this.notifyListeners();
        }
      } catch (err) {
        console.warn('Failed to load TTS voices:', err);
      }
    };

    load();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  };

  public subscribeVoices = (callback: () => void) => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  };

  private notifyListeners = () => {
    this.listeners.forEach((fn) => fn());
  };

  public getAvailableVoices = (lang: 'ko' | 'en' = 'ko'): SpeechSynthesisVoice[] => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];

    let all: SpeechSynthesisVoice[] = [];
    try {
      all = window.speechSynthesis.getVoices();
    } catch {
      all = [];
    }
    if (all.length === 0) {
      all = this.voices;
    }

    const targetLangPrefix = lang === 'en' ? 'en' : 'ko';

    return [...all].sort((a, b) => {
      const aMatch = a.lang.toLowerCase().startsWith(targetLangPrefix) ? 1 : 0;
      const bMatch = b.lang.toLowerCase().startsWith(targetLangPrefix) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return a.name.localeCompare(b.name);
    });
  };

  public stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Failed to cancel TTS:', e);
      }
    }
    this.currentUtterance = null;
  };

  public pause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.warn('Failed to pause TTS:', e);
      }
    }
  };

  public resume = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn('Failed to resume TTS:', e);
      }
    }
  };

  public speak = (
    text: string,
    settings: TTSSettings,
    lang: 'ko' | 'en' = 'ko',
    onEnd?: () => void,
    onError?: (err: any) => void
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.('SpeechSynthesis not supported');
      return;
    }

    if (!settings.enabled) return;

    this.stop();

    const cleanText = cleanTextForTTS(text);
    if (!cleanText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate || 1.0));
      utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch || 1.0));

      const voices = this.getAvailableVoices(lang);

      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (settings.voice) {
        selectedVoice = voices.find((v) => v.voiceURI === settings.voice || v.name === settings.voice);
      }

      if (!selectedVoice) {
        const langPrefix = lang === 'en' ? 'en' : 'ko';
        selectedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = lang === 'en' ? 'en-US' : 'ko-KR';
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        onError?.(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.currentUtterance = null;
      onError?.(err);
    }
  };

  public preview = (
    settings: TTSSettings,
    lang: 'ko' | 'en' = 'ko',
    onEnd?: () => void,
    onError?: (err: any) => void
  ) => {
    const testString = lang === 'ko' ? '안녕하세요. AI Hub 음성 테스트입니다.' : 'Hello. This is the AI Hub voice test.';
    this.speak(testString, { ...settings, enabled: true }, lang, onEnd, onError);
  };
}

export const ttsManager = new TTSManager();
