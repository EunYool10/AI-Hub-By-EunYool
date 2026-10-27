import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  ArrowUpRight,
  MessageSquare,
  Lightbulb,
  Bug,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { safeFetchJson } from '../lib/api';
import { IS_STATIC_SITE } from '../lib/runtime';
import { submitInquiry } from '../lib/firebase';
import { UserProfile } from '../types';
import { Language, UI_TEXT, getCategoryLabel } from '../lib/translations';
import { CATEGORIES } from '../lib/categories';
import { cn } from '../lib/cn';
import { Modal, ModalBody, ModalFooter, ModalHeader } from './ui/Modal';
import { Button, LinkButton } from './ui/Button';
import { Field, inputClass, selectClass, textareaClass } from './ui/Field';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onAddCustomTool: (tool: { name: string; category: string; description: string; url: string; price: string; isCustom: boolean }) => void;
  lang?: Language;
  /** Static site: signed-in users file inquiries straight to the admin center. */
  currentUser?: UserProfile | null;
}

const CONTACT_EMAIL = 'eunyool100208@gmail.com';
const TYPE_RECOMMEND = 'AI 도구 추천/등록 요청';

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, onSuccess, onAddCustomTool, lang = 'ko', currentUser }) => {
  const isKo = lang === 'ko';
  const [inquiryType, setInquiryType] = useState<string>(TYPE_RECOMMEND);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // AI Tool specific fields if recommending an AI
  const [toolUrl, setToolUrl] = useState('');
  const [toolPrice, setToolPrice] = useState('무료/유료');
  const [toolCategory, setToolCategory] = useState('기획/글쓰기');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const [submittedData, setSubmittedData] = useState<{
    mailtoUrl: string;
    targetEmail: string;
    saved?: boolean;
  } | null>(null);

  const isRecommend = inquiryType === TYPE_RECOMMEND;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || isSubmitting) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    const fullMessage = isRecommend && toolUrl
      ? `${message.trim()}\n\n[추천 AI 관련 정보]\n- URL: ${toolUrl}\n- 카테고리: ${toolCategory}\n- 가격: ${toolPrice}`
      : message.trim();

    try {
      // Without a server (GitHub Pages) signed-in users file to the admin center; guests get a mail draft.
      if (IS_STATIC_SITE) {
        if (!currentUser) throw new Error('Signed out: send by mail');
        await submitInquiry({
          type: inquiryType,
          title: title.trim(),
          message: fullMessage,
          name: name.trim() || currentUser.displayName,
          email: email.trim() || currentUser.email,
        });
        setSubmittedData({ mailtoUrl: '', targetEmail: CONTACT_EMAIL, saved: true });
        onSuccess(isKo ? '문의가 접수되었어요. 확인 후 연락드릴게요.' : 'Your inquiry was received.');
        return;
      }

      const response = await safeFetchJson<{ mailtoUrl: string; targetEmail: string; error?: string }>('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || (isKo ? '익명' : 'Anonymous'),
          email: email.trim() || (isKo ? '미입력' : 'Not provided'),
          type: inquiryType,
          title: title.trim(),
          message: fullMessage,
        }),
      });

      if (response.ok && response.data) {
        setSubmittedData({
          mailtoUrl: response.data.mailtoUrl,
          targetEmail: response.data.targetEmail || CONTACT_EMAIL,
        });

        // If it was an AI tool addition request, add it to local tools preview as well!
        if (isRecommend) {
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

        onSuccess(isKo ? `문의사항이 ${CONTACT_EMAIL}으로 접수되었습니다!` : `Inquiry submitted to ${CONTACT_EMAIL}!`);
      } else {
        setErrorMessage(response.error || (isKo ? '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' : 'Something went wrong. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      // Fallback offline submit
      const mailtoSubject = encodeURIComponent(`[AI Hub Inquiry] [${inquiryType}] ${title}`);
      const mailtoBody = encodeURIComponent(
        `Hello AI Hub Admin (${CONTACT_EMAIL}).\n\n` +
        `Name: ${name || 'Anonymous'}\nEmail: ${email || 'Not provided'}\nType: ${inquiryType}\n\n` +
        `[Message]\n${fullMessage}`
      );
      setSubmittedData({
        mailtoUrl: `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`,
        targetEmail: CONTACT_EMAIL,
      });
      onSuccess(isKo ? '메일 앱에서 보내기를 누르면 전달돼요.' : `Inquiry ready to send (${CONTACT_EMAIL})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(CONTACT_EMAIL).then(() => {
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setSubmittedData(null);
    setName('');
    setEmail('');
    setTitle('');
    setMessage('');
    setToolUrl('');
    setErrorMessage(null);
    onClose();
  };

  // Closing keeps an unsent draft; it is cleared after a successful send or on cancel
  const handleClose = () => {
    if (submittedData) handleReset();
    else onClose();
  };

  const types = [
    { id: TYPE_RECOMMEND, label: isKo ? 'AI 도구 제안' : 'Suggest a tool', icon: Lightbulb },
    { id: '일반 문의', label: isKo ? '일반 문의' : 'General', icon: MessageSquare },
    { id: '오류/개선 제보', label: isKo ? '오류·개선' : 'Bug / Idea', icon: Bug },
    { id: '불편/컴플레인', label: isKo ? '불편·컴플레인' : 'Complaint', icon: AlertTriangle },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" zIndex={200} labelledBy="inquiry-title">
      {!submittedData ? (
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <ModalHeader
            id="inquiry-title"
            icon={<MessageSquare className="w-5 h-5" />}
            title={isKo ? '문의 · AI 도구 제안' : 'Contact · Suggest a tool'}
            description={
              isKo
                ? (IS_STATIC_SITE && !currentUser ? '궁금한 점, 불편한 점, 추가했으면 하는 AI 도구를 알려 주세요. 로그인하면 사이트에서 바로 접수되고, 아니면 메일로 보낼 수 있어요.' : '궁금한 점, 불편한 점, 추가했으면 하는 AI 도구를 알려 주세요. 확인 후 연락드릴게요.')
                : 'Questions or a tool we should add? Your message goes straight to our inbox.'
            }
            onClose={handleClose}
            closeLabel={isKo ? '닫기' : 'Close'}
          />

          <ModalBody className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg-2">{UI_TEXT.inquiryModal.typeLabel[lang]}</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
                {types.map(({ id, label, icon: TypeIcon }) => {
                  const isActive = inquiryType === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setInquiryType(id)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 h-[72px] px-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors',
                        isActive
                          ? 'border-accent bg-accent/10 text-fg'
                          : 'border-line bg-surface-2 text-muted hover:text-fg hover:border-line-strong'
                      )}
                    >
                      <TypeIcon className={cn('w-[18px] h-[18px]', isActive ? 'text-brand' : '')} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={UI_TEXT.inquiryModal.nameLabel[lang]} htmlFor="inq-name">
                <input
                  id="inq-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={UI_TEXT.inquiryModal.namePlaceholder[lang]}
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
              <Field label={UI_TEXT.inquiryModal.emailLabel[lang]} htmlFor="inq-email">
                <input
                  id="inq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={UI_TEXT.inquiryModal.emailPlaceholder[lang]}
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={isRecommend ? (isKo ? 'AI 도구 이름' : 'Tool name') : isKo ? '제목' : 'Subject'} htmlFor="inq-title" required>
              <input
                id="inq-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRecommend ? UI_TEXT.inquiryModal.toolTitlePlaceholder[lang] : UI_TEXT.inquiryModal.generalTitlePlaceholder[lang]}
                className={inputClass}
              />
            </Field>

            {isRecommend && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-inset border border-line">
                <Field label={UI_TEXT.inquiryModal.urlLabel[lang]} htmlFor="inq-url" className="sm:col-span-3">
                  <input
                    id="inq-url"
                    type="text"
                    inputMode="url"
                    value={toolUrl}
                    onChange={(e) => setToolUrl(e.target.value)}
                    placeholder="https://"
                    className={inputClass}
                  />
                </Field>
                <Field label={UI_TEXT.inquiryModal.categoryLabel[lang]} htmlFor="inq-cat" className="sm:col-span-2">
                  <div className="relative">
                    <select id="inq-cat" value={toolCategory} onChange={(e) => setToolCategory(e.target.value)} className={selectClass}>
                      {CATEGORIES.filter((c) => c.label !== '전체').map((c) => (
                        <option key={c.label} value={c.label}>
                          {getCategoryLabel(c.label, lang)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
                  </div>
                </Field>
                <Field label={isKo ? '가격' : 'Pricing'} htmlFor="inq-price">
                  <div className="relative">
                    <select id="inq-price" value={toolPrice} onChange={(e) => setToolPrice(e.target.value)} className={selectClass}>
                      <option value="무료">{isKo ? '무료' : 'Free'}</option>
                      <option value="무료/유료">{isKo ? '부분 무료' : 'Freemium'}</option>
                      <option value="유료">{isKo ? '유료' : 'Paid'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
                  </div>
                </Field>
              </div>
            )}

            <Field label={isKo ? '내용' : 'Message'} htmlFor="inq-message" required>
              <textarea
                id="inq-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={UI_TEXT.inquiryModal.contentPlaceholder[lang]}
                className={textareaClass}
              />
            </Field>

            {errorMessage && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="justify-between">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted hover:text-fg transition-colors"
            >
              {emailCopied ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{emailCopied ? (isKo ? '복사됨' : 'Copied') : CONTACT_EMAIL}</span>
              <span className="sm:hidden">{emailCopied ? (isKo ? '복사됨' : 'Copied') : isKo ? '메일 복사' : 'Copy email'}</span>
            </button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleReset}>
                {UI_TEXT.inquiryModal.cancel[lang]}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !title.trim() || !message.trim()}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? UI_TEXT.inquiryModal.submitting[lang] : UI_TEXT.inquiryModal.send[lang]}
              </Button>
            </div>
          </ModalFooter>
        </form>
      ) : (
        <ModalBody className="py-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-mint/12 text-mint flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 id="inquiry-title" className="mt-5 text-xl font-bold tracking-tight text-fg">
            {UI_TEXT.inquiryModal.submittedTitle[lang]}
          </h3>
          <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
            {submittedData.saved
              ? isKo
                ? '관리자 센터로 접수되었어요. 답변은 남겨 주신 이메일로 보내 드려요.'
                : 'Sent to the admin team. We will reply by email.'
              : UI_TEXT.inquiryModal.submittedDesc[lang]}
          </p>

          <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-line text-left space-y-1.5">
            <p className="text-xs text-muted">To: {submittedData.targetEmail}</p>
            <p className="text-sm font-semibold text-fg">
              [{inquiryType}] {title}
            </p>
            <p className="text-sm text-fg-2 line-clamp-3 whitespace-pre-line">{message}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            {!submittedData.saved && (
              <LinkButton href={submittedData.mailtoUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="flex-1">
                <Mail className="w-4 h-4" />
                {UI_TEXT.inquiryModal.openMailApp[lang]}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </LinkButton>
            )}
            <Button variant="secondary" onClick={handleReset} className="sm:w-28">
              {UI_TEXT.inquiryModal.close[lang]}
            </Button>
          </div>
        </ModalBody>
      )}
    </Modal>
  );
};
