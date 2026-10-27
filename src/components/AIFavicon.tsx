import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { extractDomain, getOfficialLogoSources } from '../lib/officialLogos';
import { TOOL_LOGOS } from '../data/toolLogos';

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

  // Official icon saved from the tool's own site comes first; the remote chain is the fallback.
  const sources = getOfficialLogoSources(name, url, customIcon);
  const local = !customIcon && TOOL_LOGOS[extractDomain(url)];
  if (local) sources.unshift(`${(import.meta as any).env.BASE_URL}logos/${local}`);

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
        className={`[container-type:size] bg-gradient-to-br from-accent/20 to-mint/15 ring-1 ring-inset ring-line flex items-center justify-center text-brand font-bold shrink-0 select-none ${className}`}
        title={name}
        aria-label={`${name} icon`}
      >
        {isSpecial ? (
          <Sparkles className="w-[45%] h-[45%] text-brand" />
        ) : (
          <span className="leading-none text-[42cqh] text-brand font-display">
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
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-white ring-1 ring-inset ring-black/[0.07] ${className}`}
      title={name}
    >
      <img
        key={`${currentSrc}-${sourceIndex}`}
        src={currentSrc}
        alt={name ? `${name} logo` : 'AI Tool logo'}
        className="w-full h-full object-contain p-[14%] rounded-[inherit]"
        onError={() => {
          setSourceIndex((prev) => prev + 1);
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
