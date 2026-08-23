import React from 'react';
import { Mail, Code2 } from 'lucide-react';
import { Language, UI_TEXT } from '../lib/translations';

interface FooterProps {
  onOpenInquiryModal?: () => void;
  lang?: Language;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInquiryModal, lang = 'ko' }) => {
  return (
    <footer className="mt-auto bg-[#13151f] border-t border-white/10 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>{UI_TEXT.footer.copyright[lang]}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#6c63ff]" />
            <span>{lang === 'ko' ? '개발:' : 'Developer:'} <strong className="text-gray-200">{lang === 'ko' ? '은율' : 'Yool'}</strong></span>
          </div>

          <button
            onClick={onOpenInquiryModal}
            className="flex items-center gap-1.5 hover:text-[#00d4aa] transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#00d4aa]" />
            <span>deer123424@gmail.com ({lang === 'ko' ? '문의하기' : 'Contact'})</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
