import React from 'react';
import { AppTheme } from '../types';
import { hexToRgba } from '../utils/themeUtils';

interface BookVibeLogoProps {
  theme: AppTheme;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BookVibeLogo: React.FC<BookVibeLogoProps> = ({
  theme,
  accentColor = '#E11D48',
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  // Dimensions according to size
  const dimensions = {
    sm: { iconBox: 'w-7 h-7', iconSvg: 'w-4 h-4', title: 'text-base', sub: 'text-[9px]', badge: 'text-[9px] px-1 py-0.2' },
    md: { iconBox: 'w-9 h-9', iconSvg: 'w-5 h-5', title: 'text-lg', sub: 'text-[10px]', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { iconBox: 'w-12 h-12', iconSvg: 'w-7 h-7', title: 'text-2xl', sub: 'text-xs', badge: 'text-xs px-2 py-0.5' },
  }[size];

  // Theme-adaptive styling for the black-and-raspberry aesthetic
  const isDark = theme === 'dark';
  const isBeige = theme === 'beige';

  // Primary text color for "Book"
  const bookTextColor = isDark ? 'text-white' : isBeige ? 'text-[#1F1914]' : 'text-slate-950';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none transition-transform active:scale-98 cursor-pointer group ${className}`}
      title="BookVibe — Чтение с динамическим звуком"
    >
      {/* Iconic Black & Raspberry Audio-Book Emblem */}
      <div
        className={`relative ${dimensions.iconBox} rounded-xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-105 overflow-hidden`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #09090B 0%, #18181B 60%, #27272A 100%)'
            : isBeige
            ? 'linear-gradient(135deg, #261F1A 0%, #1A1512 100%)'
            : 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
          boxShadow: isDark
            ? `0 0 14px ${hexToRgba(accentColor, 0.45)}, inset 0 1px 1px rgba(255,255,255,0.15)`
            : `0 4px 10px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.1)`,
          border: `1px solid ${isDark ? hexToRgba(accentColor, 0.4) : 'rgba(0,0,0,0.4)'}`,
        }}
      >
        {/* Subtle Ambient Backlight inside emblem */}
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full blur-sm opacity-80 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Custom SVG: Open Book + Audio Vibration Soundwaves */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`${dimensions.iconSvg} relative z-10 transition-transform group-hover:scale-110 duration-200`}
        >
          {/* Left Book Page */}
          <path
            d="M3 6.5C3 5.11929 4.11929 4 5.5 4H11V18.5H5.5C4.11929 18.5 3 17.3807 3 16V6.5Z"
            fill="currentColor"
            className="text-white/90"
          />
          {/* Right Book Page */}
          <path
            d="M21 6.5C21 5.11929 19.8807 4 18.5 4H13V18.5H18.5C19.8807 18.5 21 17.3807 21 16V6.5Z"
            fill="currentColor"
            className="text-white/70"
          />
          {/* Spine Divider */}
          <line
            x1="12"
            y1="3"
            x2="12"
            y2="19.5"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Dynamic Audio Waves / Equalizer Frequency Bars in Raspberry */}
          <rect x="5.5" y="11" width="1.5" height="4" rx="0.75" fill={accentColor} />
          <rect x="8" y="8" width="1.5" height="7" rx="0.75" fill={accentColor} />
          <rect x="14.5" y="7" width="1.5" height="8" rx="0.75" fill={accentColor} />
          <rect x="17" y="10" width="1.5" height="5" rx="0.75" fill={accentColor} />

          {/* Tiny sound pulse spark */}
          <circle cx="12" cy="2" r="1.2" fill={accentColor} />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight font-sans ${dimensions.title} ${bookTextColor}`}>
            Book<span style={{ color: accentColor }}>Vibe</span>
          </span>

          {/* Adaptive Audio Pill Badge */}
          <span
            className={`${dimensions.badge} font-bold rounded-md uppercase tracking-wider transition-colors`}
            style={{
              backgroundColor: hexToRgba(accentColor, 0.15),
              color: accentColor,
              border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
            }}
          >
            Аудио
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`${dimensions.sub} opacity-60 font-medium tracking-tight truncate hidden sm:block`}
          >
            Яндекс Книги • Интерактивный звук
          </p>
        )}
      </div>
    </div>
  );
};
