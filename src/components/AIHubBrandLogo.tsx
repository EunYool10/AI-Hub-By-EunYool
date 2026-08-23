import React from 'react';

export interface AIHubBrandLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * AI Hub official brand logo:
 * Circular badge featuring an interconnected neural network graph being examined
 * by a search magnifying glass with node zoom magnification.
 */
export const AIHubBrandLogo: React.FC<AIHubBrandLogoProps> = ({
  className = 'w-7 h-7 sm:w-8 sm:h-8',
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden select-none ${className}`}
      title="AI Hub by Yool"
      aria-label="AI Hub Logo"
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Outer Circular Badge */}
        <circle cx="500" cy="500" r="485" fill="#000000" stroke="#FFFFFF" strokeWidth="26" />
        <circle cx="500" cy="500" r="448" fill="none" stroke="#FFFFFF" strokeWidth="14" />

        {/* 1. Left Network Connections (Graph Lines) */}
        <g stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
          {/* Main skeleton lines */}
          <line x1="412" y1="280" x2="252" y2="350" />
          <line x1="252" y1="350" x2="180" y2="506" />
          <line x1="180" y1="506" x2="278" y2="660" />
          <line x1="278" y1="660" x2="468" y2="730" />

          {/* Lines to Central Node (365, 475) */}
          <line x1="412" y1="280" x2="365" y2="475" />
          <line x1="252" y1="350" x2="365" y2="475" />
          <line x1="180" y1="506" x2="365" y2="475" />
          <line x1="278" y1="660" x2="365" y2="475" />
          <line x1="468" y1="730" x2="365" y2="475" />

          {/* Triangulation and Depth Web Lines */}
          <line x1="412" y1="280" x2="180" y2="506" strokeWidth="9" />
          <line x1="252" y1="350" x2="278" y2="660" strokeWidth="9" />
          <line x1="252" y1="350" x2="468" y2="730" strokeWidth="9" />
          <line x1="180" y1="506" x2="468" y2="730" strokeWidth="9" />

          {/* Lines extending into/behind the magnifying lens */}
          <line x1="412" y1="280" x2="520" y2="370" strokeWidth="12" />
          <line x1="365" y1="475" x2="510" y2="490" strokeWidth="12" />
          <line x1="365" y1="475" x2="470" y2="585" strokeWidth="10" />
        </g>

        {/* 2. Left Network Nodes (White Solid Dots) */}
        <g fill="#FFFFFF">
          <circle cx="412" cy="280" r="32" />
          <circle cx="252" cy="350" r="32" />
          <circle cx="180" cy="506" r="32" />
          <circle cx="278" cy="660" r="32" />
          <circle cx="468" cy="730" r="32" />
          <circle cx="365" cy="475" r="32" />
        </g>

        {/* 3. Magnifying Glass (Search Loupe) */}
        {/* Handle pointing to bottom-right */}
        <line
          x1="738"
          y1="575"
          x2="888"
          y2="725"
          stroke="#FFFFFF"
          strokeWidth="56"
          strokeLinecap="round"
        />

        {/* Outer Lens Body (Black backing with thick white rim) */}
        <circle
          cx="625"
          cy="455"
          r="195"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="38"
        />

        {/* Lens Glare / Reflection Highlight Arc (Top-Right inner rim) */}
        <path
          d="M 650 322 A 148 148 0 0 1 772 442"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* 4. Magnified Graph Inside Lens */}
        <g stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
          <line x1="500" y1="428" x2="628" y2="385" />
          <line x1="628" y1="385" x2="725" y2="490" />
          <line x1="725" y1="490" x2="615" y2="550" />
          <line x1="615" y1="550" x2="520" y2="528" />
          <line x1="520" y1="528" x2="628" y2="385" />
          <line x1="628" y1="385" x2="615" y2="550" />
        </g>

        {/* Magnified Nodes Inside Glass */}
        <g fill="#FFFFFF">
          <circle cx="628" cy="385" r="36" />
          <circle cx="725" cy="490" r="36" />
          <circle cx="615" cy="550" r="36" />
        </g>
      </svg>
    </div>
  );
};
