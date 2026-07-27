import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const dimensions = {
    sm: { height: 32, icon: 28, font: 'text-lg' },
    md: { height: 44, icon: 40, font: 'text-2xl' },
    lg: { height: 60, icon: 54, font: 'text-4xl' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Emblem Graphic matching the MAKIMPORT logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Outer Gear Teeth (Navy Blue) */}
          <g fill="#1E293B">
            <rect x="44" y="2" width="12" height="10" rx="2" />
            <rect x="44" y="88" width="12" height="10" rx="2" />
            <rect x="2" y="44" width="10" height="12" rx="2" />
            <rect x="88" y="44" width="10" height="12" rx="2" />
            <rect x="14" y="14" width="12" height="10" rx="2" transform="rotate(45 20 19)" />
            <rect x="74" y="74" width="12" height="10" rx="2" transform="rotate(45 80 79)" />
            <rect x="14" y="74" width="12" height="10" rx="2" transform="rotate(-45 20 79)" />
            <rect x="74" y="14" width="12" height="10" rx="2" transform="rotate(-45 80 19)" />
            {/* Gear Body Circle */}
            <circle cx="50" cy="50" r="42" stroke="#1E293B" strokeWidth="6" />
          </g>

          {/* Inner Orange Globe Area */}
          <circle cx="50" cy="50" r="34" fill="#EA580C" />

          {/* Globe Lat/Long Grid Lines (White/Light Orange) */}
          <ellipse cx="50" cy="50" rx="34" ry="12" stroke="#FFEDD5" strokeWidth="1.5" fill="none" opacity="0.6" />
          <ellipse cx="50" cy="50" rx="14" ry="34" stroke="#FFEDD5" strokeWidth="1.5" fill="none" opacity="0.6" />
          <line x1="16" y1="50" x2="84" y2="50" stroke="#FFEDD5" strokeWidth="1.5" opacity="0.6" />
          <line x1="50" y1="16" x2="50" y2="84" stroke="#FFEDD5" strokeWidth="1.5" opacity="0.6" />

          {/* Excavator Arm & Bucket Graphic (Dark Navy Overlay) */}
          <path
            d="M32 68 L42 45 L62 30 L72 38 L68 44 L56 50 L48 68 Z"
            fill="#0F172A"
          />
          {/* Excavator Bucket */}
          <path
            d="M26 62 C24 66, 26 74, 34 74 L38 66 L32 60 Z"
            fill="#0F172A"
          />
          {/* Hydraulic Cylinder Accent */}
          <path
            d="M48 48 L64 36"
            stroke="#EA580C"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Swoosh Ring wrapping around */}
          <path
            d="M18 72 C 30 90, 70 92, 86 65 C 72 82, 38 82, 22 68 Z"
            fill="#1E293B"
          />
        </svg>
      </div>

      {showText && (
        <div className={`flex items-center text-white ${dimensions.font} font-extrabold tracking-wider`}>
          <span className="text-white">MAK</span>
          <span className="text-white">IMP</span>

          {/* Stylized Globe/Gear 'O' inside MAKIMPORT */}
          <span className="relative inline-flex items-center justify-center mx-0.5">
            <svg className="w-[0.9em] h-[0.9em] inline-block align-middle" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="42" fill="#EA580C" stroke="#1E293B" strokeWidth="8" />
              <ellipse cx="50" cy="50" rx="42" ry="16" stroke="#FFFFFF" strokeWidth="4" fill="none" opacity="0.8" />
              <ellipse cx="50" cy="50" rx="18" ry="42" stroke="#FFFFFF" strokeWidth="4" fill="none" opacity="0.8" />
              <line x1="50" y1="8" x2="50" y2="92" stroke="#FFFFFF" strokeWidth="4" opacity="0.8" />
            </svg>
          </span>

          <span className="text-white">RT</span>
        </div>
      )}
    </div>
  );
};
