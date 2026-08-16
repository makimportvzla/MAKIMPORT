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
      {/* ── Isotipo Oficial: Excavadora + Globo + Engranaje ─────────────────── */}
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Gear Outer Rim & Teeth (Dark Navy & Orange) */}
        <circle cx="50" cy="50" r="46" fill="#1E293B" stroke="#EA580C" strokeWidth="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="44"
            y="1"
            width="12"
            height="10"
            rx="2"
            fill="#0F172A"
            stroke="#EA580C"
            strokeWidth="2"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Outer Swoosh Orbit (Navy Blue) */}
        <path
          d="M 12 60 C 10 90, 85 95, 92 40 C 95 20, 75 10, 50 15"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner Globe Fill (Orange Background with Grid Lines) */}
        <circle cx="50" cy="50" r="28" fill="#EA580C" />
        <ellipse cx="50" cy="50" rx="28" ry="10" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8" />
        <ellipse cx="50" cy="50" rx="12" ry="28" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.8" />
        <line x1="22" y1="50" x2="78" y2="50" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        <line x1="50" y1="22" x2="50" y2="78" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

        {/* Excavator Arm & Bucket Silhouette (Navy Blue overlay) */}
        {/* Main Boom Arm */}
        <path
          d="M 22 68 Q 32 30 52 24 Q 62 20 68 30 Q 56 42 42 54 L 30 72 Z"
          fill="#0F172A"
        />
        {/* Hydraulic Cylinder Accent */}
        <path
          d="M 38 48 L 56 32"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Excavator Bucket */}
        <path
          d="M 16 62 Q 10 74 24 76 L 32 68 Q 24 64 16 62 Z"
          fill="#0F172A"
        />
        <path
          d="M 12 70 L 17 76 M 17 73 L 22 78 M 22 75 L 26 80"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Dynamic Front Ring Swoosh Overlay */}
        <path
          d="M 18 70 C 25 88, 75 88, 88 58"
          stroke="#0F172A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
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
