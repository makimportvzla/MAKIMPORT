import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const dimensions = {
    sm: { iconSize: 28, textClass: 'text-base', gap: 'gap-2' },
    md: { iconSize: 38, textClass: 'text-xl',  gap: 'gap-2.5' },
    lg: { iconSize: 52, textClass: 'text-3xl', gap: 'gap-3' },
  }[size];

  return (
    <div
      className={`inline-flex items-center ${dimensions.gap} select-none ${className}`}
      aria-label="MAKIMPORT Venezuela"
    >
      {/* ── Isotipo: Engranaje + Globo + Excavadora ─────────────────── */}
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* --- Gear ring (orange) with 8 teeth --- */}
        <circle cx="50" cy="50" r="46" fill="#EA580C" />
        {/* Teeth via clip-path trick: 8 rectangles rotated */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="44"
            y="2"
            width="12"
            height="12"
            rx="2.5"
            fill="#EA580C"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* --- Gear inner dark ring (nav blue) --- */}
        <circle cx="50" cy="50" r="38" fill="#0F172A" />

        {/* --- Globe fill (orange circle) --- */}
        <circle cx="50" cy="50" r="30" fill="#EA580C" />

        {/* --- Globe grid lines (white, subtle) --- */}
        <ellipse cx="50" cy="50" rx="30" ry="11" stroke="#FFEDD5" strokeWidth="1.4" fill="none" opacity="0.7" />
        <ellipse cx="50" cy="50" rx="13" ry="30" stroke="#FFEDD5" strokeWidth="1.4" fill="none" opacity="0.7" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="#FFEDD5" strokeWidth="1.4" opacity="0.7" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="#FFEDD5" strokeWidth="1.4" opacity="0.7" />

        {/* --- Excavator arm silhouette (dark navy over globe) --- */}
        {/* Main boom */}
        <path
          d="M30 72 L38 52 L55 36 L64 43 L60 49 L47 56 L42 72 Z"
          fill="#0F172A"
        />
        {/* Bucket */}
        <path
          d="M24 65 C22 70, 24 77, 33 77 L38 69 L30 62 Z"
          fill="#0F172A"
        />
        {/* Hydraulic arm accent (orange) */}
        <line x1="47" y1="54" x2="61" y2="41" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />

        {/* --- Bottom swoosh / base shadow --- */}
        <path
          d="M22 75 C32 90 68 90 78 75 C68 84 32 84 22 75 Z"
          fill="#0F172A"
          opacity="0.8"
        />
      </svg>

      {/* ── Wordmark: clean MAKIMPORT text ─────────────────────────── */}
      {showText && (
        <span
          className={`${dimensions.textClass} font-extrabold tracking-widest uppercase text-white leading-none`}
          style={{ letterSpacing: '0.12em' }}
        >
          MAKIMPORT
        </span>
      )}
    </div>
  );
};
