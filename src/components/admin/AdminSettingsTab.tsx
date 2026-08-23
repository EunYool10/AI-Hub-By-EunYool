import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Globe,
  Sliders,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { getStoredSettings, updateStoredSettings } from '../../lib/settings';

interface AdminSettingsTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  showToast: (msg: string) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  currentUserEmail,
  lang,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [settings, setSettings] = useState({
    defaultSort: 'default',
    maintenanceBanner: false,
    bannerText: '📢 서비스 정기 점검이 예정되어 있습니다.',
    aiModel: 'gemini-3.6-flash',
    temperature: 0.7,
    maxTokens: 8192,
    enableTTS: true,
    enableWebSearch: true,
    auditLogging: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_hub_admin_site_settings');
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('ai_hub_admin_site_settings', JSON.stringify(settings));
      showToast(isKo ? '✅ 관리자 설정이 저장되었습니다.' : 'Admin settings saved.');
    } catch (e) {
      showToast('설정 저장 실패');
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      defaultSort: 'default',
      maintenanceBanner: false,
      bannerText: '📢 서비스 정기 점검이 예정되어 있습니다.',
      aiModel: 'gemini-3.6-flash',
      temperature: 0.7,
      maxTokens: 8192,
      enableTTS: true,
      enableWebSearch: true,
      auditLogging: true,
    };
    setSettings(defaultSettings);
    localStorage.setItem('ai_hub_admin_site_settings', JSON.stringify(defaultSettings));
    showToast(isKo ? '기본값으로 재설정되었습니다.' : 'Reset to defaults.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#16192b] to-[#121422] border border-amber-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              PLATFORM SETTINGS
            </span>
            <span className="text-xs text-gray-400">
              {isKo ? '운영 시스템 전역 환경설정' : 'Global Platform Configurations'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {isKo ? '관리자 플랫폼 설정' : 'Admin Settings'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Admin: <span className="text-amber-300 font-mono">{currentUserEmail}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: AI Engine & Model Settings */}
        <div className="p-5 rounded-2xl bg-[#121424] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {isKo ? 'AI 모델 및 추론 파라미터 (AI Engine Settings)' : 'AI Model Parameters'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 font-bold mb-1">AI 모델 엔진</label>
              <select
                value={settings.aiModel}
                onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                className="w-full px-3 py-2 bg-[#171a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (권장)</option>
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Temperature ({settings.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[#171a2e] rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">Max Output Tokens</label>
              <select
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#171a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value={4096}>4096 Tokens</option>
                <option value={8192}>8192 Tokens (표준)</option>
                <option value={16384}>16384 Tokens</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 bg-[#171a2e] rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableWebSearch}
                onChange={(e) => setSettings({ ...settings, enableWebSearch: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 bg-[#121424] border-white/10"
              />
              <span className="text-gray-300 font-bold">🌐 실시간 구글 웹 검색 연동 (Search Grounding)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-[#171a2e] rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableTTS}
                onChange={(e) => setSettings({ ...settings, enableTTS: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 bg-[#121424] border-white/10"
              />
              <span className="text-gray-300 font-bold">🔊 음성 합성(TTS) 음성 지원 활성화</span>
            </label>
          </div>
        </div>

        {/* Section 2: Platform Maintenance & Banner */}
        <div className="p-5 rounded-2xl bg-[#121424] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {isKo ? '서비스 공지 및 점검 배너 설정' : 'Maintenance & Banner'}
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceBanner}
                onChange={(e) => setSettings({ ...settings, maintenanceBanner: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-[#121424] border-white/10"
              />
              <span className="text-gray-200 font-bold">
                ⚠️ 상단 점검 안내 배너 활성화 (Maintenance Notice Banner)
              </span>
            </label>

            {settings.maintenanceBanner && (
              <div>
                <label className="block text-gray-400 font-bold mb-1">배너 안내 문구</label>
                <input
                  type="text"
                  value={settings.bannerText}
                  onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                  placeholder="배너에 노출될 문구를 입력하세요."
                  className="w-full px-3 py-2 bg-[#171a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isKo ? '기본값 초기화' : 'Reset Defaults'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isKo ? '설정 내용 저장' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
