import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Flame, 
  Clock, 
  Compass, 
  Heart, 
  Library, 
  RotateCcw,
  Headphones,
  Plus,
  UploadCloud
} from 'lucide-react';
import { 
  AppTheme, 
  Book, 
  BookGenre, 
  AudioTemplate, 
  UserProfile, 
  AmbientSoundType,
  AppearanceSettings 
} from './types';
import { 
  INITIAL_USER_PROFILE, 
  INITIAL_AMBIENT_TRACKS 
} from './data/mockData';
import { FULL_POPULAR_BOOKS } from './data/popularBooksCatalog';
import { soundEngine } from './services/soundEngine';
import { 
  DEFAULT_APPEARANCE_SETTINGS, 
  applyAppearanceToDOM, 
  getContrastTextColor, 
  hexToRgba 
} from './utils/themeUtils';

import { Header } from './components/Header';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { BookReaderModal } from './components/BookReaderModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SmartTimerModal } from './components/SmartTimerModal';
import { SleepOverlay } from './components/SleepOverlay';
import { ProfileModal } from './components/ProfileModal';
import { ShareCardModal } from './components/ShareCardModal';
import { YandexMusicModal } from './components/YandexMusicModal';
import { AppearanceModal } from './components/AppearanceModal';
import { AddBookModal } from './components/AddBookModal';

export default function App() {
  // Theme state: beige, light, dark
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('bookvibe_theme') as AppTheme;
    return saved === 'beige' || saved === 'light' || saved === 'dark' ? saved : 'beige';
  });

  // Appearance and customization settings state
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(() => {
    try {
      const saved = localStorage.getItem('bookvibe_appearance_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_APPEARANCE_SETTINGS,
          ...parsed,
          theme: (parsed.theme || localStorage.getItem('bookvibe_theme') || 'beige') as AppTheme,
        };
      }
    } catch {
      // ignore
    }
    const initialTheme = (localStorage.getItem('bookvibe_theme') as AppTheme) || 'beige';
    return { ...DEFAULT_APPEARANCE_SETTINGS, theme: initialTheme };
  });

  // Modals state
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  // Data migration version for real popular bestsellers (155+ books catalog with 530 pages support)
  const CURRENT_DATA_VERSION = 'v5_all_pages_530';

  // Books library state (persisted to localStorage)
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const version = localStorage.getItem('bookvibe_version');
      if (version === CURRENT_DATA_VERSION) {
        const saved = localStorage.getItem('bookvibe_books');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 140) {
            return parsed;
          }
        }
      }
      localStorage.setItem('bookvibe_version', CURRENT_DATA_VERSION);
      localStorage.setItem('bookvibe_books', JSON.stringify(FULL_POPULAR_BOOKS));
      if (!localStorage.getItem('bookvibe_profile')) {
        localStorage.setItem('bookvibe_profile', JSON.stringify(INITIAL_USER_PROFILE));
      }
    } catch {
      // ignore
    }
    return FULL_POPULAR_BOOKS;
  });

  // User profile state (persisted to localStorage)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('bookvibe_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_PROFILE;
  });

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<BookGenre[]>([]);

  // Selected book for details & reader
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [shareBook, setShareBook] = useState<Book | null>(null);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isYandexModalOpen, setIsYandexModalOpen] = useState(false);

  // Audio Playback state
  const [currentBook, setCurrentBook] = useState<Book | null>(books[0] || null);
  const [activeTemplate, setActiveTemplate] = useState<AudioTemplate | null>(
    books[0]?.audioTemplates[0] || null
  );
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activeAmbients, setActiveAmbients] = useState<string[]>([]);
  const [musicVolume, setMusicVolume] = useState(0.65);
  const [ambientVolume, setAmbientVolume] = useState(0.55);

  // Smart Timer State (Requirement 3)
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(30);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  // Inactivity & Sleep Mode State (Requirement 3: "если пользователь не отвечает N минут...")
  const [isSleeping, setIsSleeping] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('bookvibe_theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  // Apply appearance settings to DOM and persist to localStorage
  useEffect(() => {
    localStorage.setItem('bookvibe_appearance_settings', JSON.stringify(appearanceSettings));
    applyAppearanceToDOM(appearanceSettings);
  }, [appearanceSettings]);

  useEffect(() => {
    localStorage.setItem('bookvibe_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bookvibe_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Track User Activity across whole app
  const recordUserActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  useEffect(() => {
    const handleEvents = () => recordUserActivity();
    window.addEventListener('mousemove', handleEvents, { passive: true });
    window.addEventListener('keydown', handleEvents, { passive: true });
    window.addEventListener('click', handleEvents, { passive: true });
    window.addEventListener('touchstart', handleEvents, { passive: true });
    window.addEventListener('scroll', handleEvents, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleEvents);
      window.removeEventListener('keydown', handleEvents);
      window.removeEventListener('click', handleEvents);
      window.removeEventListener('touchstart', handleEvents);
      window.removeEventListener('scroll', handleEvents);
    };
  }, [recordUserActivity]);

  // Inactivity Monitor: If no activity for N minutes, trigger smooth fade-out and sleep mode
  useEffect(() => {
    const timeoutMs = userProfile.inactivityTimeoutMinutes * 60 * 1000;
    const interval = setInterval(() => {
      if (isSleeping) return;

      const idleDuration = Date.now() - lastActivityTime;
      if (idleDuration > timeoutMs) {
        // Trigger smooth fade-out & sleep transition
        if (isPlayingMusic || activeAmbients.length > 0) {
          soundEngine.smoothFadeOut(4, () => {
            setIsPlayingMusic(false);
          });
        }
        setIsSleeping(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSleeping, lastActivityTime, userProfile.inactivityTimeoutMinutes, isPlayingMusic, activeAmbients.length]);

  // Wake up from sleep mode
  const handleWakeUp = () => {
    setIsSleeping(false);
    recordUserActivity();
    soundEngine.smoothFadeIn(2.5);
    if (activeTemplate) {
      soundEngine.startMusic(activeTemplate.synthPreset);
      setIsPlayingMusic(true);
    }
  };

  // Smart Timer Interval Loop
  useEffect(() => {
    if (!timerActive || timerRemaining === null) return;

    if (timerRemaining <= 0) {
      setTimerActive(false);
      setTimerRemaining(null);
      // Fade out sound and show break screen
      soundEngine.smoothFadeOut(3.5, () => {
        setIsPlayingMusic(false);
      });
      setIsBreakModalOpen(true);
      return;
    }

    const timer = setInterval(() => {
      setTimerRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timerRemaining]);

  // Audio Control Handlers
  const handleToggleMusic = () => {
    recordUserActivity();
    if (isPlayingMusic) {
      soundEngine.stopMusic();
      setIsPlayingMusic(false);
    } else {
      if (activeTemplate) {
        soundEngine.startMusic(activeTemplate.synthPreset);
        setIsPlayingMusic(true);
      } else if (currentBook && currentBook.audioTemplates[0]) {
        setActiveTemplate(currentBook.audioTemplates[0]);
        soundEngine.startMusic(currentBook.audioTemplates[0].synthPreset);
        setIsPlayingMusic(true);
      }
    }
  };

  const handleSelectAudioTemplate = (template: AudioTemplate, book: Book) => {
    recordUserActivity();
    setCurrentBook(book);
    setActiveTemplate(template);
    soundEngine.setMusicPreset(template.synthPreset);
    if (!isPlayingMusic) {
      soundEngine.startMusic(template.synthPreset);
      setIsPlayingMusic(true);
    }
  };

  const handleNextTemplate = () => {
    if (!currentBook) return;
    const templates = currentBook.audioTemplates;
    const currentIndex = templates.findIndex((t) => t.id === activeTemplate?.id);
    const nextTemplate = templates[(currentIndex + 1) % templates.length];
    handleSelectAudioTemplate(nextTemplate, currentBook);
  };

  const handleToggleAmbient = (type: AmbientSoundType) => {
    recordUserActivity();
    if (activeAmbients.includes(type)) {
      soundEngine.stopAmbient(type);
      setActiveAmbients((prev) => prev.filter((id) => id !== type));
    } else {
      soundEngine.startAmbient(type, ambientVolume);
      setActiveAmbients((prev) => [...prev, type]);
    }
  };

  const handleChangeMusicVolume = (vol: number) => {
    setMusicVolume(vol);
    soundEngine.setMusicVolume(vol);
  };

  const handleChangeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    soundEngine.setAmbientVolume(vol);
  };

  // Timer Controls
  const handleStartTimer = () => {
    recordUserActivity();
    setTimerRemaining(timerDurationMinutes * 60);
    setTimerActive(true);
    setIsTimerModalOpen(false);
  };

  const handlePauseTimer = () => {
    recordUserActivity();
    setTimerActive(false);
  };

  const handleResetTimer = () => {
    recordUserActivity();
    setTimerActive(false);
    setTimerRemaining(timerDurationMinutes * 60);
  };

  const handleDismissBreak = (addMinutes?: number) => {
    setIsBreakModalOpen(false);
    recordUserActivity();
    if (addMinutes) {
      setTimerDurationMinutes(addMinutes);
      setTimerRemaining(addMinutes * 60);
      setTimerActive(true);
      soundEngine.smoothFadeIn(2);
      if (activeTemplate) {
        soundEngine.startMusic(activeTemplate.synthPreset);
        setIsPlayingMusic(true);
      }
    }
  };

  // Genre filter toggle (multi-select: matches books containing AT LEAST ONE selected genre)
  const toggleGenre = (genre: BookGenre) => {
    recordUserActivity();
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  // Favorite toggle
  const handleToggleFavorite = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    recordUserActivity();
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  // Reading progress update with current page tracking
  const handleUpdateProgress = (bookId: string, percent: number, page?: number) => {
    recordUserActivity();
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              progressPercent: percent,
              currentPage: page ?? b.currentPage,
              isRead: percent >= 100 ? true : b.isRead,
            }
          : b
      )
    );
  };

  // Profile update
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  // Filtered Books List
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Search query check
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.annotation.toLowerCase().includes(query) ||
        book.genres.some((g) => g.toLowerCase().includes(query));

      // Multi-select Genre check: book must contain AT LEAST ONE of selected genres
      const matchesGenre =
        selectedGenres.length === 0 ||
        book.genres.some((g) => selectedGenres.includes(g));

      return matchesSearch && matchesGenre;
    });
  }, [books, searchQuery, selectedGenres]);

  // Overall Theme Container styling
  const appContainerStyles = {
    beige: 'bg-[#F7F4EB] text-[#2B2621]',
    light: 'bg-[#F8FAFC] text-slate-900',
    dark: 'bg-[#101115] text-slate-100',
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${appContainerStyles}`}>
      
      {/* 1. Header with Search, Genre Dropdown, Themes & Quick Controls */}
      <Header
        theme={theme}
        setTheme={(newTheme) => {
          setTheme(newTheme);
          setAppearanceSettings((prev) => ({ ...prev, theme: newTheme }));
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        clearGenres={clearGenres}
        openTimerModal={() => setIsTimerModalOpen(true)}
        openProfileModal={() => setIsProfileOpen(true)}
        openYandexModal={() => setIsYandexModalOpen(true)}
        openAppearanceModal={() => setIsAppearanceOpen(true)}
        openAddBookModal={() => setIsAddBookOpen(true)}
        accentColor={appearanceSettings.accentColor}
        timerActive={timerActive}
        timerRemaining={timerRemaining}
        isYandexMusicConnected={userProfile.isYandexMusicConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-32">
        
        {/* Curated Hero Banner: Immersion Reading in Yandex Books Style */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 p-6 sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(appearanceSettings.accentColor, 0.14)} 0%, ${hexToRgba(appearanceSettings.accentColor, 0.04)} 50%, transparent 100%)`
          }}
        >
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span 
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: hexToRgba(appearanceSettings.accentColor, 0.18),
                  color: appearanceSettings.accentColor
                }}
              >
                Яндекс Книги • Интерактивный звук
              </span>
              <span className="text-xs opacity-60">•</span>
              <span className="text-xs opacity-75 font-medium">Книги + ИИ-саундтрек</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight">
              Бестселлеры Яндекс Книг и тренды BookTok с адаптивным саундтреком
            </h1>

            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              Читайте популярные мировые хиты («Четвёртое крыло», «Безмолвный пациент», «Гипотеза любви», «Преследуя Аделин», «Шестёрка Воронов») с динамической звуковой атмосферой и умным таймером сна.
            </p>

            {/* BookTok & Bestseller Quick Tag Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" style={{ color: appearanceSettings.accentColor }} />
                <span>Тренды TikTok / #BookTok</span>
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Топ-10 бестселлеров 2024–2025</span>
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                <span>Только реальные популярные издания</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (books[0]) {
                    setDetailBook(books[0]);
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: appearanceSettings.accentColor,
                  color: getContrastTextColor(appearanceSettings.accentColor),
                  boxShadow: appearanceSettings.enableGlowEffects 
                    ? `0 0 16px ${hexToRgba(appearanceSettings.accentColor, 0.4)}` 
                    : undefined
                }}
              >
                <Headphones className="w-4 h-4" />
                <span>Начать «Четвёртое крыло» с аудио</span>
              </button>

              <button
                onClick={() => setIsYandexModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Яндекс Плюс для Книг
              </button>

              <button
                onClick={() => setIsAppearanceOpen(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: appearanceSettings.accentColor }} />
                <span>Настроить тему</span>
              </button>
            </div>
          </div>
        </div>

        {/* Library Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif flex items-center gap-2">
              <Library className="w-5 h-5" style={{ color: appearanceSettings.accentColor }} />
              <span>Популярные бестселлеры</span>
            </h2>
            <p className="text-xs opacity-60 mt-0.5">
              Найдено: {filteredBooks.length} {filteredBooks.length === 1 ? 'книга' : 'книг'}
              {selectedGenres.length > 0 && ` (фильтр по ${selectedGenres.length} жанрам)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddBookOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 text-white hover:opacity-95"
              style={{ backgroundColor: appearanceSettings.accentColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить книгу</span>
            </button>

            {/* Quick Active Filters Reset */}
            {(selectedGenres.length > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGenres([]);
                  setSearchQuery('');
                }}
                className="text-xs font-medium hover:underline flex items-center gap-1 self-start sm:self-auto"
                style={{ color: appearanceSettings.accentColor }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить все фильтры</span>
              </button>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                theme={theme}
                accentColor={appearanceSettings.accentColor}
                cardDensity={appearanceSettings.cardDensity}
                onSelect={(b) => setDetailBook(b)}
                onToggleFavorite={handleToggleFavorite}
                onStartReading={(b) => setReadingBook(b)}
                onQuickPlay={(e, b) => {
                  e.stopPropagation();
                  handleSelectAudioTemplate(b.audioTemplates[0], b);
                }}
                isCurrentPlaying={isPlayingMusic && currentBook?.id === book.id}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-8">
            <BookOpen className="w-12 h-12 mx-auto opacity-40" style={{ color: appearanceSettings.accentColor }} />
            <h3 className="font-bold text-lg">Книг по вашему запросу не найдено</h3>
            <p className="text-xs opacity-60 max-w-sm mx-auto">
              Попробуйте выбрать другие жанры в шапке или измените поисковый запрос.
            </p>
            <button
              onClick={() => {
                setSelectedGenres([]);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all hover:opacity-90"
              style={{
                backgroundColor: appearanceSettings.accentColor,
                color: getContrastTextColor(appearanceSettings.accentColor)
              }}
            >
              Показать все книги
            </button>
          </div>
        )}

      </main>

      {/* 2. Book Detail Modal with 3-4 Audio Templates & Yandex Music Offer */}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          isOpen={!!detailBook}
          onClose={() => setDetailBook(null)}
          theme={theme}
          accentColor={appearanceSettings.accentColor}
          onToggleFavorite={handleToggleFavorite}
          onStartReading={(b) => {
            setDetailBook(null);
            setReadingBook(b);
          }}
          onSelectAudioTemplate={handleSelectAudioTemplate}
          selectedTemplateId={activeTemplate?.id || null}
          isPlayingMusic={isPlayingMusic}
          currentPlayingBookId={currentBook?.id || null}
          isYandexMusicConnected={userProfile.isYandexMusicConnected}
          onConnectYandexMusic={() => {
            setUserProfile((prev) => ({ ...prev, isYandexMusicConnected: true }));
          }}
          onOpenShareModal={(b) => setShareBook(b)}
          onToggleAmbient={handleToggleAmbient}
          activeAmbients={activeAmbients}
        />
      )}

      {/* Reader View Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook}
          isOpen={!!readingBook}
          onClose={() => setReadingBook(null)}
          theme={theme}
          setTheme={(newTheme) => {
            setTheme(newTheme);
            setAppearanceSettings((prev) => ({ ...prev, theme: newTheme }));
          }}
          accentColor={appearanceSettings.accentColor}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
          activeTemplate={activeTemplate}
          onSelectAudioTemplate={handleSelectAudioTemplate}
          activeAmbients={activeAmbients}
          onToggleAmbient={handleToggleAmbient}
          onUpdateProgress={handleUpdateProgress}
          timerActive={timerActive}
          timerRemaining={timerRemaining}
          onUserActivity={recordUserActivity}
        />
      )}

      {/* 3. Smart Timer Modal & Sleep Break Screen */}
      <SmartTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        theme={theme}
        timerActive={timerActive}
        timerRemaining={timerRemaining}
        timerDurationMinutes={timerDurationMinutes}
        onSetTimerDuration={(m) => setTimerDurationMinutes(m)}
        onStartTimer={handleStartTimer}
        onPauseTimer={handlePauseTimer}
        onResetTimer={handleResetTimer}
        inactivityTimeoutMinutes={userProfile.inactivityTimeoutMinutes}
        onSetInactivityTimeout={(m) => handleUpdateProfile({ inactivityTimeoutMinutes: m })}
        isBreakModalOpen={isBreakModalOpen}
        onDismissBreak={handleDismissBreak}
      />

      {/* Inactivity Sleep Overlay (Smooth audio fade-out & sleep mode) */}
      <SleepOverlay
        isSleeping={isSleeping}
        onWakeUp={handleWakeUp}
        inactivityMinutes={userProfile.inactivityTimeoutMinutes}
      />

      {/* 4. Profile & Statistics Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        theme={theme}
        accentColor={appearanceSettings.accentColor}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        books={books}
        onOpenBookDetail={(b) => {
          setIsProfileOpen(false);
          setDetailBook(b);
        }}
        onOpenShareModal={(b) => setShareBook(b)}
      />

      {/* Social Card Share Generator Modal */}
      {shareBook && (
        <ShareCardModal
          book={shareBook}
          isOpen={!!shareBook}
          onClose={() => setShareBook(null)}
          theme={theme}
          userProfile={userProfile}
        />
      )}

      {/* Yandex Music Details Modal */}
      <YandexMusicModal
        isOpen={isYandexModalOpen}
        onClose={() => setIsYandexModalOpen(false)}
        theme={theme}
        isConnected={userProfile.isYandexMusicConnected}
        onToggleConnection={() => {
          setUserProfile((prev) => ({
            ...prev,
            isYandexMusicConnected: !prev.isYandexMusicConnected,
          }));
        }}
      />

      {/* Floating Bottom Audio Player Bar */}
      <AudioPlayerBar
        currentBook={currentBook}
        activeTemplate={activeTemplate}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={handleToggleMusic}
        onNextTemplate={handleNextTemplate}
        theme={theme}
        accentColor={appearanceSettings.accentColor}
        enableGlowEffects={appearanceSettings.enableGlowEffects}
        activeAmbients={activeAmbients}
        onToggleAmbient={handleToggleAmbient}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        timerActive={timerActive}
        timerRemaining={timerRemaining}
        musicVolume={musicVolume}
        onChangeMusicVolume={handleChangeMusicVolume}
        ambientVolume={ambientVolume}
        onChangeAmbientVolume={handleChangeAmbientVolume}
        onOpenBookDetail={(b) => setDetailBook(b)}
      />

      {/* 5. Custom Appearance & Accent Colors Modal */}
      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        settings={appearanceSettings}
        onUpdateSettings={(updated) => {
          setAppearanceSettings((prev) => {
            const next = { ...prev, ...updated };
            if (updated.theme) {
              setTheme(updated.theme);
            }
            return next;
          });
        }}
        onResetSettings={() => {
          const reset = { ...DEFAULT_APPEARANCE_SETTINGS, theme };
          setAppearanceSettings(reset);
          applyAppearanceToDOM(reset);
        }}
      />

      {/* 6. Upload / Add Custom Book & URL Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        theme={theme}
        accentColor={appearanceSettings.accentColor}
        onBookAdded={(newBook) => {
          setBooks((prev) => [newBook, ...prev]);
          try {
            const saved = localStorage.getItem('bookvibe_books');
            const parsed = saved ? JSON.parse(saved) : [];
            localStorage.setItem('bookvibe_books', JSON.stringify([newBook, ...parsed]));
          } catch {
            // ignore
          }
          setDetailBook(newBook);
        }}
      />

    </div>
  );
}
