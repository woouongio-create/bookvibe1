import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Clock, 
  User, 
  Sun, 
  Moon, 
  Coffee, 
  X, 
  Check, 
  ChevronDown,
  Sparkles,
  Music2,
  Palette,
  Plus
} from 'lucide-react';
import { AppTheme, BookGenre, ALL_GENRES } from '../types';
import { getContrastTextColor, hexToRgba } from '../utils/themeUtils';
import { BookVibeLogo } from './BookVibeLogo';

interface HeaderProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  accentColor: string;
  openAppearanceModal: () => void;
  openAddBookModal?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenres: BookGenre[];
  toggleGenre: (genre: BookGenre) => void;
  clearGenres: () => void;
  openTimerModal: () => void;
  openProfileModal: () => void;
  openYandexModal: () => void;
  timerActive: boolean;
  timerRemaining: number | null;
  isYandexMusicConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  accentColor,
  openAppearanceModal,
  openAddBookModal,
  searchQuery,
  setSearchQuery,
  selectedGenres,
  toggleGenre,
  clearGenres,
  openTimerModal,
  openProfileModal,
  openYandexModal,
  timerActive,
  timerRemaining,
  isYandexMusicConnected,
}) => {
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const themeStyles = {
    beige: {
      headerBg: 'bg-[#F7F4EB]/95 border-[#E6DEC8]',
      inputBg: 'bg-[#EFEAD9]/70 focus:bg-white text-[#2B2621] border-[#DFD8C4] placeholder-[#8A8175]',
      dropdownBg: 'bg-[#FBF9F4] border-[#E2DAC6] text-[#2B2621] shadow-xl',
      badgeActive: 'bg-[#D97706] text-white',
      badgeInactive: 'bg-[#EFEAD9] text-[#5C5346] hover:bg-[#E5DEC7]',
      btnSecondary: 'hover:bg-[#EFEAD9] text-[#2B2621]',
    },
    light: {
      headerBg: 'bg-white/95 border-slate-200',
      inputBg: 'bg-slate-100 focus:bg-white text-slate-900 border-slate-200 placeholder-slate-400',
      dropdownBg: 'bg-white border-slate-200 text-slate-900 shadow-xl',
      badgeActive: 'bg-slate-900 text-white',
      badgeInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      btnSecondary: 'hover:bg-slate-100 text-slate-800',
    },
    dark: {
      headerBg: 'bg-[#141519]/95 border-[#262833]',
      inputBg: 'bg-[#1C1E26] focus:bg-[#232530] text-slate-100 border-[#2D303E] placeholder-slate-500',
      dropdownBg: 'bg-[#1C1E26] border-[#2D303E] text-slate-100 shadow-2xl',
      badgeActive: 'bg-amber-500 text-slate-950 font-semibold',
      badgeInactive: 'bg-[#272A36] text-slate-300 hover:bg-[#323646]',
      btnSecondary: 'hover:bg-[#232530] text-slate-200',
    },
  }[theme];

  const contrastText = getContrastTextColor(accentColor);
  const accentLight = hexToRgba(accentColor, 0.16);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${themeStyles.headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Adaptive Black-Raspberry Logo in Yandex Books style */}
          <BookVibeLogo
            theme={theme}
            accentColor={accentColor}
            size="md"
            showSubtitle={true}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 opacity-50 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по книгам, авторам, сюжетам..."
                className={`w-full pl-10 pr-9 py-2 text-sm rounded-full border outline-none transition-all ${themeStyles.inputBg}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Очистить поиск"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Appearance & Accent Color Customizer Button */}
            <button
              onClick={openAppearanceModal}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 group"
              title="Оформление и акцентные цвета"
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: accentColor, color: contrastText }}
              >
                <Palette className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold hidden xl:inline pr-1">Оформление</span>
            </button>

            {/* Yandex Music Status / Subscription Button */}
            <button
              onClick={openYandexModal}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isYandexMusicConnected
                  ? 'border'
                  : 'bg-slate-500/10 hover:bg-slate-500/15 border border-transparent'
              }`}
              style={
                isYandexMusicConnected
                  ? { backgroundColor: accentLight, color: accentColor, borderColor: hexToRgba(accentColor, 0.3) }
                  : undefined
              }
              title="Яндекс Музыка подключение"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>{isYandexMusicConnected ? 'Плюс активен' : 'Яндекс Музыка'}</span>
            </button>

            {/* Add Book Button (upload file, url, text) */}
            {openAddBookModal && (
              <button
                onClick={openAddBookModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                title="Добавить свою книгу, загрузить FB2/TXT или по ссылке"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Добавить книгу</span>
              </button>
            )}

            {/* Smart Reading Timer Button */}
            <button
              onClick={openTimerModal}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                timerActive
                  ? 'font-bold shadow-md animate-pulse'
                  : `${themeStyles.btnSecondary} border border-transparent`
              }`}
              style={
                timerActive
                  ? { backgroundColor: accentColor, color: contrastText }
                  : undefined
              }
              title="Умный таймер чтения"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">
                {timerActive && timerRemaining !== null ? formatTime(timerRemaining) : 'Таймер'}
              </span>
            </button>

            {/* Theme switcher: Beige, Light, Dark */}
            <div className="flex items-center p-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <button
                onClick={() => setTheme('beige')}
                className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
                  theme === 'beige' ? 'bg-[#EFEAD9] text-[#5C5346] shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                }`}
                title="Бежевая тема (Сепия)"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
                  theme === 'light' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                }`}
                title="Светлая тема"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center ${
                  theme === 'dark' ? 'bg-[#272A36] text-amber-400 shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'
                }`}
                title="Тёмная тема"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Button */}
            <button
              onClick={openProfileModal}
              className={`p-1.5 rounded-full transition-all ${themeStyles.btnSecondary}`}
              title="Профиль и статистика"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Genre Selector Row */}
        <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          
          {/* Dropdown toggle for mobile / compact view */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-all ${
                selectedGenres.length > 0
                  ? ''
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
              style={
                selectedGenres.length > 0
                  ? { backgroundColor: accentColor, color: contrastText }
                  : undefined
              }
            >
              <span>Жанры</span>
              {selectedGenres.length > 0 && (
                <span 
                  className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: contrastText, color: accentColor }}
                >
                  {selectedGenres.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGenreDropdownOpen && (
              <div className={`absolute left-0 mt-2 w-64 p-2 rounded-2xl border z-50 animate-in fade-in zoom-in-95 ${themeStyles.dropdownBg}`}>
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-black/10 dark:border-white/10 px-2">
                  <span className="text-xs font-bold">Выбор жанров</span>
                  {selectedGenres.length > 0 && (
                    <button
                      onClick={clearGenres}
                      className="text-[11px] hover:underline"
                      style={{ color: accentColor }}
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
                  {ALL_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'font-semibold'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: accentLight, color: accentColor }
                            : undefined
                        }
                      >
                        <span>{genre}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick genre pills horizontally scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {ALL_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                    isSelected ? 'shadow-sm' : themeStyles.badgeInactive
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: accentColor, color: contrastText }
                      : undefined
                  }
                >
                  {genre}
                </button>
              );
            })}
          </div>

          {selectedGenres.length > 0 && (
            <button
              onClick={clearGenres}
              className="text-xs hover:underline shrink-0 font-medium px-2"
              style={{ color: accentColor }}
            >
              Сбросить
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
