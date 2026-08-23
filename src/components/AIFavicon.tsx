import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getOfficialLogoSources } from '../lib/officialLogos';

export interface AIFaviconProps {
  url: string;
  name: string;
  className?: string;
  size?: number;
  customIcon?: string;
}

/**
 * Official Brand Logo & Favicon Renderer
 * Loads verified official brand vectors and high-resolution official domain favicons.
 * Never generates fake or synthetic imitation logos.
 */
export const AIFavicon: React.FC<AIFaviconProps> = ({
  url,
  name,
  className = 'w-7 h-7 rounded-lg',
  customIcon,
}) => {
  const [sourceIndex, setSourceIndex] = useState(0);

  // Re-evaluate image source chain whenever url, name or customIcon changes
  const sources = getOfficialLogoSources(name, url, customIcon);

  useEffect(() => {
    setSourceIndex(0);
  }, [url, name, customIcon]);

  const currentSrc = sources[sourceIndex];

  // Fallback UI when official sources cannot be loaded or network error occurs
  const renderFallback = () => {
    const firstChar = name ? name.trim().charAt(0).toUpperCase() : '';
    const isSpecial = !firstChar || /[^A-Z0-9가-힣]/i.test(firstChar);

    return (
      <div
        className={`bg-[#171a29] border border-white/15 flex items-center justify-center text-[#6c63ff] font-bold text-xs shrink-0 select-none shadow-sm ${className}`}
        title={name}
        aria-label={`${name} icon`}
      >
        {isSpecial ? (
          <Sparkles className="w-3.5 h-3.5 text-[#857dff]" />
        ) : (
          <span className="leading-none text-[11px] text-[#857dff] font-['Space_Grotesk']">
            {firstChar}
          </span>
        )}
      </div>
    );
  };

  // If no source exists or all attempted sources failed
  if (!currentSrc || sourceIndex >= sources.length) {
    return renderFallback();
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-[#151824] border border-white/10 ${className}`}
      title={name}
    >
      <img
        key={`${currentSrc}-${sourceIndex}`}
        src={currentSrc}
        alt={name ? `${name} logo` : 'AI Tool logo'}
        className="w-full h-full object-contain p-1 rounded-[inherit]"
        onError={() => {
          setSourceIndex((prev) => prev + 1);
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
