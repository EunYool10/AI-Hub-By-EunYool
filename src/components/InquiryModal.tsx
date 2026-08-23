import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, Copy, ExternalLink, MessageSquare, Tag, PlusCircle } from 'lucide-react';
import { safeFetchJson } from '../lib/api';
import { Language, UI_TEXT, getCategoryLabel } from '../lib/translations';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onAddCustomTool: (tool: { name: string; category: string; description: string; url: string; price: string; isCustom: boolean }) => void;
  lang?: Language;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAddCustomTool,
  lang = 'ko',
}) => {
  const [inquiryType, setInquiryType] = useState<string>('AI 도구 추천/등록 요청');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // AI Tool specific fields if recommending an AI
  const [toolUrl, setToolUrl] = useState('');
  const [toolPrice, setToolPrice] = useState('무료/유료');
  const [toolCategory, setToolCategory] = useState('기획/글쓰기');

  const [submittedData, setSubmittedData] = useState<{
    mailtoUrl: string;
    targetEmail: string;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const fullMessage = inquiryType === 'AI 도구 추천/등록 요청' && toolUrl
      ? `${message.trim()}\n\n[추천 AI 관련 정보]\n- URL: ${toolUrl}\n- 카테고리: ${toolCategory}\n- 가격: ${toolPrice}`
      : message.trim();

    try {
      const response = await safeFetchJson<{ mailtoUrl: string; targetEmail: string; error?: string }>('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || (lang === 'ko' ? '익명' : 'Anonymous'),
          email: email.trim() || (lang === 'ko' ? '미입력' : 'Not provided'),
          type: inquiryType,
          title: title.trim(),
          message: fullMessage,
        }),
      });

      if (response.ok && response.data) {
        setSubmittedData({
          mailtoUrl: response.data.mailtoUrl,
          targetEmail: response.data.targetEmail || 'deer123424@gmail.com',
        });

        // If it was an AI tool addition request, add it to local tools preview as well!
        if (inquiryType === 'AI 도구 추천/등록 요청') {
          let formattedUrl = toolUrl.trim();
          if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
          }
          onAddCustomTool({
            name: title.trim(),
            category: toolCategory,
            description: message.trim(),
            url: formattedUrl || 'https://google.com',
            price: toolPrice,
            isCustom: true,
          });
        }

        onSuccess(lang === 'ko' ? '문의사항이 deer123424@gmail.com으로 접수되었습니다!' : 'Inquiry submitted to deer123424@gmail.com!');
      } else {
        alert(response.error || (lang === 'ko' ? '문의 접수 중 오류가 발생했습니다.' : 'An error occurred while submitting your inquiry.'));
      }
    } catch (err) {
      console.error(err);
      // Fallback offline submit
      const mailtoSubject = encodeURIComponent(`[AI Hub Inquiry] [${inquiryType}] ${title}`);
      const mailtoBody = encodeURIComponent(
        `Hello AI Hub Admin (deer123424@gmail.com).\n\n` +
        `Name: ${name || 'Anonymous'}\nEmail: ${email || 'Not provided'}\nType: ${inquiryType}\n\n` +
        `[Message]\n${fullMessage}`
      );
      const mailtoUrl = `mailto:deer123424@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      setSubmittedData({
        mailtoUrl,
        targetEmail: 'deer123424@gmail.com',
      });
      onSuccess(lang === 'ko' ? '문의사항 접수 준비 완료 (deer123424@gmail.com)' : 'Inquiry ready to send (deer123424@gmail.com)');
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('deer123424@gmail.com');
    alert(lang === 'ko' ? '담당자 이메일(deer123424@gmail.com)이 클립보드에 복사되었습니다.' : 'Contact email (deer123424@gmail.com) copied to clipboard.');
  };

  const handleReset = () => {
    setSubmittedData(null);
    setName('');
    setEmail('');
    setTitle('');
    setMessage('');
    setToolUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#13151f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title={lang === 'ko' ? '닫기' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedData ? (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00d4aa] text-white shadow-md shadow-[#6c63ff]/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                  {UI_TEXT.inquiryModal.title[lang]}
                </h2>
                <p className="text-xs text-gray-400">
                  {UI_TEXT.inquiryModal.contactEmailLabel[lang]} <strong className="text-[#00d4aa]">deer123424@gmail.com</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-2 mb-5 leading-relaxed bg-[#1a1d2a] p-3 rounded-xl border border-white/5">
              {UI_TEXT.inquiryModal.guideText[lang]}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Inquiry Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#6c63ff]" />
                  <span>{UI_TEXT.inquiryModal.typeLabel[lang]}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'AI 도구 추천/등록 요청', label: UI_TEXT.inquiryModal.typeRecommend[lang], icon: PlusCircle },
                    { id: '일반 문의', label: UI_TEXT.inquiryModal.typeGeneral[lang], icon: MessageSquare },
                    { id: '오류/개선 제보', label: UI_TEXT.inquiryModal.typeBug[lang], icon: Tag },
                  ].map((typeItem) => (
                    <button
                      type="button"
                      key={typeItem.id}
                      onClick={() => setInquiryType(typeItem.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer ${
                        inquiryType === typeItem.id
                          ? 'bg-[#6c63ff] text-white border-[#6c63ff] shadow-md shadow-[#6c63ff]/25 font-bold'
                          : 'bg-[#1a1d2a] text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {typeItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {UI_TEXT.inquiryModal.nameLabel[lang]}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={UI_TEXT.inquiryModal.namePlaceholder[lang]}
                    className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {UI_TEXT.inquiryModal.emailLabel[lang]}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={UI_TEXT.inquiryModal.emailPlaceholder[lang]}
                    className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff]"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {inquiryType === 'AI 도구 추천/등록 요청' ? UI_TEXT.inquiryModal.toolTitleLabel[lang] : UI_TEXT.inquiryModal.generalTitleLabel[lang]}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    inquiryType === 'AI 도구 추천/등록 요청'
                      ? UI_TEXT.inquiryModal.toolTitlePlaceholder[lang]
                      : UI_TEXT.inquiryModal.generalTitlePlaceholder[lang]
                  }
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              {/* AI Tool extra fields if selected */}
              {inquiryType === 'AI 도구 추천/등록 요청' && (
                <div className="grid grid-cols-2 gap-3 bg-[#1a1d2a]/50 p-3 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      {UI_TEXT.inquiryModal.urlLabel[lang]}
                    </label>
                    <input
                      type="text"
                      value={toolUrl}
                      onChange={(e) => setToolUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      {UI_TEXT.inquiryModal.categoryLabel[lang]}
                    </label>
                    <select
                      value={toolCategory}
                      onChange={(e) => setToolCategory(e.target.value)}
                      className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#6c63ff]"
                    >
                      <option value="기획/글쓰기">{getCategoryLabel('기획/글쓰기', lang)}</option>
                      <option value="디자인/이미지">{getCategoryLabel('디자인/이미지', lang)}</option>
                      <option value="영상/오디오">{getCategoryLabel('영상/오디오', lang)}</option>
                      <option value="번역/어학">{getCategoryLabel('번역/어학', lang)}</option>
                      <option value="개발/데이터">{getCategoryLabel('개발/데이터', lang)}</option>
                      <option value="생산성/협업">{getCategoryLabel('생산성/협업', lang)}</option>
                      <option value="마케팅/분석">{getCategoryLabel('마케팅/분석', lang)}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {UI_TEXT.inquiryModal.contentLabel[lang]}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={UI_TEXT.inquiryModal.contentPlaceholder[lang]}
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs text-gray-400 hover:text-[#00d4aa] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{UI_TEXT.inquiryModal.copyEmail[lang]}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 bg-[#1a1d2a] hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {UI_TEXT.inquiryModal.cancel[lang]}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-xl text-xs sm:text-sm font-bold font-['Space_Grotesk'] shadow-lg shadow-[#6c63ff]/25 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{UI_TEXT.inquiryModal.send[lang]}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Submitted Confirmation Screen */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/40 flex items-center justify-center text-[#00d4aa] mx-auto mb-3 shadow-lg shadow-[#00d4aa]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-1">
              {UI_TEXT.inquiryModal.submittedTitle[lang]}
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              {UI_TEXT.inquiryModal.submittedDesc[lang]}
            </p>

            <div className="bg-[#1a1d2a] p-4 rounded-2xl border border-white/10 text-left mb-6 space-y-2">
              <div className="text-[11px] text-gray-400 font-medium">To: deer123424@gmail.com</div>
              <div className="text-xs font-bold text-white">{lang === 'ko' ? `제목: [${inquiryType}] ${title}` : `Subject: [${inquiryType}] ${title}`}</div>
              <p className="text-xs text-gray-300 line-clamp-3 bg-[#13151f] p-2.5 rounded-xl border border-white/5">
                {message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={submittedData.mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#6c63ff] hover:bg-[#5b52e0] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#6c63ff]/20"
              >
                <Mail className="w-4 h-4" />
                <span>{UI_TEXT.inquiryModal.openMailApp[lang]}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-[#1a1d2a] hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors"
              >
                {UI_TEXT.inquiryModal.close[lang]}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
