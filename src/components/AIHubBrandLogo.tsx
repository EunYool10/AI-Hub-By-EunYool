import React, { useId } from 'react';

export interface AIHubBrandLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * AI Hub logo, the same mark as public/favicon.svg:
 * a sparkle inside an orbit with one node, on a purple → mint tile.
 */
export const AIHubBrandLogo: React.FC<AIHubBrandLogoProps> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => {
  const gradientId = useId();
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title="AI Hub by Yool"
      role="img"
      aria-label="AI Hub"
    >
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8b7dff" />
            <stop offset="0.55" stopColor="#6a5cff" />
            <stop offset="1" stopColor="#2fc9a8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
        <circle cx="32" cy="32" r="18.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3.2" />
        <circle cx="45.1" cy="18.9" r="4.8" fill="#fff" />
        <path
          d="M32 18.5c1.1 7.6 4.7 11.2 13.5 13.5-8.8 2.3-12.4 5.9-13.5 13.5-1.1-7.6-4.7-11.2-13.5-13.5 8.8-2.3 12.4-5.9 13.5-13.5z"
          fill="#fff"
        />
      </svg>
    </span>
  );
};
