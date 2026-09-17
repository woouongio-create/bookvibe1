import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Settings2, 
  Play, 
  Pause, 
  CloudRain, 
  Flame, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  CheckCircle2,
  ListOrdered,
  X,
  Sliders,
  Share2,
  Search,
  Maximize2,
  Minimize2,
  Highlighter,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignJustify,
  ScrollText,
  BookOpen,
  MessageSquareText,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ListMusic,
  Trash2,
  ExternalLink,
  Info,
  Download
} from 'lucide-react';
import { Book, AppTheme, AudioTemplate, AmbientSoundType } from '../types';
import { getContrastTextColor, hexToRgba } from '../utils/themeUtils';
import { getPageContent, getBookChapters, ChapterMeta, searchInBook, SearchMatch } from '../services/bookContentService';
import { openAudioService, getBookPlaylist, OpenTrack, AudioPlayerState } from '../services/openAudioService';
import { downloadBook } from '../services/downloadBookService';

export interface SavedQuote {
  id: string;
  bookId: string;
  text: string;
  pageNumber: number;
  chapterTitle: string;
  color: 'yellow' | 'pink' | 'mint' | 'lavender';
  createdAt: string;
}

interface BookReaderModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  accentColor?: string;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  activeTemplate: AudioTemplate | null;
  onSelectAudioTemplate: (template: AudioTemplate, book: Book) => void;
  activeAmbients: string[];
  onToggleAmbient: (type: AmbientSoundType) => void;
  onUpdateProgress: (bookId: string, percent: number, currentPage?: number) => void;
  timerActive: boolean;
  timerRemaining: number | null;
  onUserActivity: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  theme,
  setTheme,
  accentColor = '#E11D48',
  isPlayingMusic,
  onToggleMusic,
  activeTemplate,
  onSelectAudioTemplate,
  activeAmbients,
  onToggleAmbient,
  onUpdateProgress,
  timerActive,
  timerRemaining,
  onUserActivity,
}) => {
  // Base page count (e.g. 530), dynamically expands if user reads beyond - NO BOUNDARIES!
  const basePages = Math.max(1, book.pages || 530);

  // Initialize current page from saved book state or localStorage
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const savedPage = localStorage.getItem(`bookvibe_page_${book.id}`);
      if (savedPage) {
        const num = parseInt(savedPage, 10);
        if (!isNaN(num) && num >= 1) {
          return num;
        }
      }
      if (book.currentPage && book.currentPage >= 1) {
        return book.currentPage;
      }
      if (book.progressPercent && book.progressPercent > 0) {
        return Math.max(1, Math.round((book.progressPercent / 100) * basePages));
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const totalPages = Math.max(basePages, currentPage);

  // Reader Customization & Typography Settings (Yandex Books styled)
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const s = localStorage.getItem('bookvibe_pref_fontsize');
      return s ? parseInt(s, 10) : 18;
    } catch {
      return 18;
    }
  });

  const [pageZoom, setPageZoom] = useState<number>(() => {
    try {
      const s = localStorage.getItem('bookvibe_pref_zoom');
      return s ? parseInt(s, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'georgia' | 'mono'>('serif');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [pageWidth, setPageWidth] = useState<'compact' | 'standard' | 'wide'>('standard');
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify');
  const [readingMode, setReadingMode] = useState<'paginated' | 'scroll'>('paginated');
  const [readerThemePreset, setReaderThemePreset] = useState<'paper' | 'light' | 'graphite' | 'dark' | 'black'>(
    theme === 'beige' ? 'paper' : theme === 'light' ? 'light' : 'dark'
  );

  // UI Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Search in book state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);

  // Open Audio Service State
  const [audioState, setAudioState] = useState<AudioPlayerState>(openAudioService.getState());
  const bookPlaylist = useMemo(() => getBookPlaylist(book.id, book.genres), [book.id, book.genres]);

  // Saved Bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`bookvibe_bookmarks_${book.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saved Quotes & Highlights
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try {
      const saved = localStorage.getItem(`bookvibe_quotes_${book.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Floating Selection Popover for Quotes
  const [selectionRange, setSelectionRange] = useState<{ text: string; x: number; y: number } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const contrastText = getContrastTextColor(accentColor);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to Open Audio Player
  useEffect(() => {
    return openAudioService.subscribe((st) => {
      setAudioState(st);
    });
  }, []);

  // Save font size and zoom to storage
  useEffect(() => {
    try {
      localStorage.setItem('bookvibe_pref_fontsize', String(fontSize));
      localStorage.setItem('bookvibe_pref_zoom', String(pageZoom));
    } catch {
      // ignore
    }
  }, [fontSize, pageZoom]);

  // Compute chapters and current page content
  const chapters: ChapterMeta[] = useMemo(() => getBookChapters({ ...book, pages: totalPages }), [book, totalPages]);
  const pageContent = useMemo(() => getPageContent(book, currentPage), [book, currentPage]);

  const currentChapter = useMemo(() => {
    return chapters.find((c) => currentPage >= c.startPage && currentPage <= c.endPage) || chapters[0];
  }, [chapters, currentPage]);

  // Estimated reading time remaining for current chapter
  const minutesLeftInChapter = useMemo(() => {
    if (!currentChapter) return 5;
    const pagesLeft = Math.max(1, currentChapter.endPage - currentPage + 1);
    return Math.max(1, Math.round(pagesLeft * 1.5)); // ~1.5 min per page
  }, [currentChapter, currentPage]);

  const isCurrentPageBookmarked = bookmarks.includes(currentPage);

  // Navigate to any page (NO BOUNDARIES!)
  const navigateToPage = (newPage: number) => {
    const target = Math.max(1, newPage);
    setCurrentPage(target);
    onUserActivity();

    // Scroll reader to top smoothly
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Persist to localStorage
    try {
      localStorage.setItem(`bookvibe_page_${book.id}`, String(target));
    } catch {
      // ignore
    }

    // Update progress
    const progress = Math.min(100, Math.round((target / Math.max(basePages, target)) * 100));
    onUpdateProgress(book.id, progress, target);
  };

  const handleNextPage = () => {
    // Unbounded: keeps reading continuously!
    navigateToPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  };

  const handleToggleBookmark = () => {
    onUserActivity();
    setBookmarks((prev) => {
      let updated: number[];
      if (prev.includes(currentPage)) {
        updated = prev.filter((p) => p !== currentPage);
      } else {
        updated = [...prev, currentPage].sort((a, b) => a - b);
      }
      try {
        localStorage.setItem(`bookvibe_bookmarks_${book.id}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Text selection detection for quotes
  const handleTextMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionRange(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5) {
      setSelectionRange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionRange({
      text,
      x: Math.min(window.innerWidth - 180, Math.max(20, rect.left + rect.width / 2 - 100)),
      y: Math.max(60, rect.top - 50),
    });
  };

  const handleSaveQuote = (color: 'yellow' | 'pink' | 'mint' | 'lavender') => {
    if (!selectionRange) return;
    const newQuote: SavedQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      bookId: book.id,
      text: selectionRange.text,
      pageNumber: currentPage,
      chapterTitle: pageContent.chapterTitle,
      color,
      createdAt: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    };

    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    try {
      localStorage.setItem(`bookvibe_quotes_${book.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteQuote = (id: string) => {
    const updated = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(updated);
    try {
      localStorage.setItem(`bookvibe_quotes_${book.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Search logic
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const matches = searchInBook(book, searchQuery, 15);
    setSearchResults(matches);
  };

  // Keyboard navigation: Left/Right arrows, PageUp/PageDown, F for fullscreen, ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showJumpDialog || isSettingsOpen || isSearchOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (isTocOpen) setIsTocOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isSearchOpen) setIsSearchOpen(false);
        else if (isQuotesOpen) setIsQuotesOpen(false);
        else if (isPlaylistDrawerOpen) setIsPlaylistDrawerOpen(false);
        else if (showJumpDialog) setShowJumpDialog(false);
        else setSelectionRange(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, showJumpDialog, isSettingsOpen, isTocOpen, isSearchOpen, isQuotesOpen, isPlaylistDrawerOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Colors & visual themes (Yandex Books Presets)
  const themePalette = {
    paper: {
      bg: 'bg-[#F7F4EB]',
      text: 'text-[#2C2723]',
      headerBg: 'bg-[#EFE9DC]/95 border-[#E2D8C3]',
      cardBg: 'bg-[#EFEAD9]',
      panelBg: 'bg-[#FDFBF7] border-[#DFD5BF] text-[#2C2723]',
      subtext: 'text-[#6C6252]',
      pageBackground: '#F7F4EB',
      textColor: '#2C2723',
    },
    light: {
      bg: 'bg-[#FAFBFD]',
      text: 'text-slate-900',
      headerBg: 'bg-white/95 border-slate-200',
      cardBg: 'bg-slate-100',
      panelBg: 'bg-white border-slate-200 text-slate-900',
      subtext: 'text-slate-500',
      pageBackground: '#FAFBFD',
      textColor: '#0F172A',
    },
    graphite: {
      bg: 'bg-[#23272F]',
      text: 'text-[#E3E6EB]',
      headerBg: 'bg-[#1C2026]/95 border-[#2F3440]',
      cardBg: 'bg-[#2B303A]',
      panelBg: 'bg-[#23272F] border-[#373E4D] text-[#E3E6EB]',
      subtext: 'text-[#9BA3AF]',
      pageBackground: '#23272F',
      textColor: '#E3E6EB',
    },
    dark: {
      bg: 'bg-[#15171F]',
      text: 'text-slate-200',
      headerBg: 'bg-[#111218]/95 border-[#232634]',
      cardBg: 'bg-[#1C1E29]',
      panelBg: 'bg-[#15171F] border-[#2A2E3E] text-slate-100',
      subtext: 'text-slate-400',
      pageBackground: '#15171F',
      textColor: '#E2E8F0',
    },
    black: {
      bg: 'bg-[#000000]',
      text: 'text-neutral-300',
      headerBg: 'bg-[#0A0A0A]/95 border-neutral-900',
      cardBg: 'bg-[#111111]',
      panelBg: 'bg-[#080808] border-neutral-800 text-neutral-200',
      subtext: 'text-neutral-500',
      pageBackground: '#000000',
      textColor: '#D4D4D4',
    },
  }[readerThemePreset];

  // Font family css mapping
  const fontFamilyClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    georgia: 'font-serif tracking-normal',
    mono: 'font-mono text-sm',
  }[fontFamily];

  // Line height css mapping
  const lineHeightClass = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }[lineHeight];

  // Page width container mapping
  const pageWidthClass = {
    compact: 'max-w-xl',
    standard: 'max-w-2xl',
    wide: 'max-w-4xl',
  }[pageWidth];

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col ${themePalette.bg} ${themePalette.text} transition-colors duration-200 select-text`}
      onClick={onUserActivity}
      onScroll={onUserActivity}
      onMouseUp={handleTextMouseUp}
    >
      {/* Floating Selection Tooltip for Highlighting & Quotes (Yandex Books Feature) */}
      {selectionRange && (
        <div 
          className="fixed z-50 flex items-center gap-1.5 p-1.5 rounded-2xl shadow-2xl border backdrop-blur-xl bg-slate-900/90 text-white animate-in zoom-in-95 duration-150"
          style={{ 
            left: `${selectionRange.x}px`, 
            top: `${selectionRange.y}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Highlighter Color Choices */}
          <button
            onClick={() => handleSaveQuote('yellow')}
            className="w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 transition-transform shadow-xs"
            title="Жёлтый маркер"
          />
          <button
            onClick={() => handleSaveQuote('pink')}
            className="w-6 h-6 rounded-full bg-pink-400 hover:scale-110 transition-transform shadow-xs"
            title="Розовый маркер"
          />
          <button
            onClick={() => handleSaveQuote('mint')}
            className="w-6 h-6 rounded-full bg-emerald-400 hover:scale-110 transition-transform shadow-xs"
            title="Мятный маркер"
          />
          <button
            onClick={() => handleSaveQuote('lavender')}
            className="w-6 h-6 rounded-full bg-purple-400 hover:scale-110 transition-transform shadow-xs"
            title="Лавандовый маркер"
          />

          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Copy Action */}
          <button
            onClick={() => handleCopyText(selectionRange.text)}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-xs flex items-center gap-1"
            title="Скопировать цитату"
          >
            {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Save to quotes */}
          <button
            onClick={() => handleSaveQuote('yellow')}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1"
          >
            <Highlighter className="w-3 h-3" />
            <span>В цитаты</span>
          </button>
        </div>
      )}

      {/* Top Reading Navigation Bar (Yandex Books Clean Bar) */}
      <header className={`sticky top-0 z-30 px-3 sm:px-6 py-2.5 border-b backdrop-blur-md flex items-center justify-between ${themePalette.headerBg}`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Назад к библиотеке"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] opacity-75 truncate">
              {pageContent.chapterTitle} • ~{minutesLeftInChapter} мин до конца главы
            </p>
          </div>
        </div>

        {/* Action Controls: Search, Scale/Zoom, Quotes, TOC, Settings, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Direct Page Jump Trigger Pill */}
          <button
            onClick={() => {
              setJumpPageInput(String(currentPage));
              setShowJumpDialog(true);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all flex items-center gap-1 bg-black/5 dark:bg-white/5"
            title="Перейти к странице"
          >
            <span className="opacity-70 text-[11px]">Стр.</span>
            <span className="font-bold text-xs" style={{ color: accentColor }}>{currentPage}</span>
            <span className="opacity-50 text-[11px]">/ {totalPages}</span>
          </button>

          {/* Search inside book */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Поиск по книге"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quotes & Notes Drawer */}
          <button
            onClick={() => setIsQuotesOpen(true)}
            className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative ${
              savedQuotes.length > 0 ? 'text-amber-500' : ''
            }`}
            title={`Цитаты и заметки (${savedQuotes.length})`}
          >
            <MessageSquareText className="w-4 h-4" />
            {savedQuotes.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Bookmark toggle */}
          <button
            onClick={handleToggleBookmark}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isCurrentPageBookmarked ? 'Удалить закладку' : 'Добавить закладку'}
          >
            <Bookmark 
              className="w-4 h-4 transition-transform active:scale-125" 
              style={{
                color: isCurrentPageBookmarked ? accentColor : 'currentColor',
                fill: isCurrentPageBookmarked ? accentColor : 'none'
              }}
            />
          </button>

          {/* Table of Contents */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Оглавление"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Zoom & Font Settings */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl transition-all ${
              isSettingsOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Настройки шрифта и масштаба (Аа)"
          >
            <span className="text-xs font-serif font-bold px-0.5">Аа</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:inline-flex"
            title="Полный экран"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download Book dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-amber-500"
              title="Скачать книгу (.TXT / .FB2 / .MD)"
            >
              <Download className="w-4 h-4" />
            </button>
            {isDownloadOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 p-1.5 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 text-xs font-sans"
                style={{ backgroundColor: themePalette.panelBg }}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Скачать книгу:
                </div>
                <button
                  onClick={() => { downloadBook(book, 'txt'); setIsDownloadOpen(false); }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between font-medium"
                >
                  <span>Текст (.TXT)</span>
                  <span className="text-[10px] opacity-60">Полный</span>
                </button>
                <button
                  onClick={() => { downloadBook(book, 'fb2'); setIsDownloadOpen(false); }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between font-medium"
                >
                  <span>Ридер (.FB2)</span>
                  <span className="text-[10px] opacity-60">Главы</span>
                </button>
                <button
                  onClick={() => { downloadBook(book, 'md'); setIsDownloadOpen(false); }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between font-medium"
                >
                  <span>Markdown (.MD)</span>
                  <span className="text-[10px] opacity-60">Разметка</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reader Settings Drawer (Scale, Zoom, Margins, Fonts, Themes) */}
      {isSettingsOpen && (
        <div className={`border-b p-4 sm:p-6 backdrop-blur-xl animate-in slide-in-from-top-3 duration-200 z-20 ${themePalette.panelBg}`}>
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* Row 1: Text Size & Page Scale Zoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Font Size A- / A+ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Размер текста:</span>
                  <span className="font-mono text-amber-500 font-bold">{fontSize} px</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                    className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold font-serif"
                    title="Уменьшить шрифт"
                  >
                    А-
                  </button>
                  <input
                    type="range"
                    min="13"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
                    style={{ accentColor }}
                  />
                  <button
                    onClick={() => setFontSize((s) => Math.min(32, s + 1))}
                    className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold font-serif"
                    title="Увеличить шрифт"
                  >
                    А+
                  </button>
                </div>
              </div>

              {/* Page Scale / Zoom Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-500" />
                    Масштабирование страницы:
                  </span>
                  <span className="font-mono text-amber-500 font-bold">{pageZoom}%</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[80, 90, 100, 115, 125, 150].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setPageZoom(scale)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        pageZoom === scale
                          ? 'shadow-sm font-bold'
                          : 'border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={
                        pageZoom === scale
                          ? { backgroundColor: accentColor, color: contrastText }
                          : undefined
                      }
                    >
                      {scale}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Reading Theme Presets (Yandex Books Palette) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold">Цветовое оформление (Яндекс Книги):</span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {[
                  { id: 'paper', name: 'Бумага / Сепия', bg: '#F7F4EB', border: '#DCD4C0', text: '#2C2723' },
                  { id: 'light', name: 'Дневная белая', bg: '#FFFFFF', border: '#E2E8F0', text: '#0F172A' },
                  { id: 'graphite', name: 'Графитовая', bg: '#23272F', border: '#373E4D', text: '#E3E6EB' },
                  { id: 'dark', name: 'Яндекс Тёмная', bg: '#15171F', border: '#2A2E3E', text: '#E2E8F0' },
                  { id: 'black', name: 'OLED Ночь', bg: '#000000', border: '#262626', text: '#D4D4D4' },
                ].map((p) => {
                  const isSelected = readerThemePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setReaderThemePreset(p.id as any);
                        if (p.id === 'light') setTheme('light');
                        else if (p.id === 'paper') setTheme('beige');
                        else setTheme('dark');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                        isSelected ? 'ring-2 ring-offset-1 ring-amber-500 font-bold scale-105' : 'hover:opacity-90'
                      }`}
                      style={{ backgroundColor: p.bg, color: p.text, borderColor: p.border }}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: p.bg }} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Fonts, Line-height, Width, Align & Mode */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-black/5 dark:border-white/5">
              
              {/* Font Type */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs opacity-70 mr-1">Шрифт:</span>
                {[
                  { id: 'serif', name: 'Литерата' },
                  { id: 'sans', name: 'Yandex Sans' },
                  { id: 'georgia', name: 'Georgia' },
                  { id: 'mono', name: 'PT Mono' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      fontFamily === f.id
                        ? 'font-bold shadow-xs'
                        : 'border hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={fontFamily === f.id ? { backgroundColor: accentColor, color: contrastText } : undefined}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Page Width */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs opacity-70 mr-1">Поля:</span>
                {[
                  { id: 'compact', name: 'Узкие' },
                  { id: 'standard', name: 'Стандарт' },
                  { id: 'wide', name: 'Широкие' },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setPageWidth(w.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      pageWidth === w.id
                        ? 'font-bold shadow-xs'
                        : 'border hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={pageWidth === w.id ? { backgroundColor: accentColor, color: contrastText } : undefined}
                  >
                    {w.name}
                  </button>
                ))}
              </div>

              {/* Text Alignment */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTextAlign('justify')}
                  className={`p-1.5 rounded-lg border ${textAlign === 'justify' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
                  title="По ширине"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('left')}
                  className={`p-1.5 rounded-lg border ${textAlign === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : ''}`}
                  title="По левому краю"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reading Mode: Paginated vs Scroll (Свиток) */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs opacity-70 mr-1">Режим:</span>
                <button
                  onClick={() => setReadingMode('paginated')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    readingMode === 'paginated' ? 'font-bold' : 'border'
                  }`}
                  style={readingMode === 'paginated' ? { backgroundColor: accentColor, color: contrastText } : undefined}
                >
                  Постранично
                </button>
                <button
                  onClick={() => setReadingMode('scroll')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    readingMode === 'scroll' ? 'font-bold' : 'border'
                  }`}
                  style={readingMode === 'scroll' ? { backgroundColor: accentColor, color: contrastText } : undefined}
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Свиток</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div 
          className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 shadow-2xl border-l backdrop-blur-xl flex flex-col animate-in slide-in-from-right-4 transition-all"
          style={{ backgroundColor: themePalette.pageBackground }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" style={{ color: accentColor }} />
              <h3 className="text-sm font-bold">Оглавление книги</h3>
            </div>
            <button 
              onClick={() => setIsTocOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[11px] opacity-60 px-3 py-1 font-semibold uppercase tracking-wider">
              Всего {chapters.length} глав • {totalPages} страниц (без ограничений)
            </div>
            {chapters.map((ch) => {
              const isCurrent = currentPage >= ch.startPage && currentPage <= ch.endPage;
              return (
                <button
                  key={ch.chapterNumber}
                  onClick={() => {
                    navigateToPage(ch.startPage);
                    setIsTocOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                    isCurrent 
                      ? 'font-bold shadow-xs' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                  }`}
                  style={isCurrent ? { backgroundColor: hexToRgba(accentColor, 0.15), color: accentColor } : undefined}
                >
                  <div className="truncate">
                    <span>{ch.title}</span>
                  </div>
                  <span className="text-[11px] font-mono opacity-60 shrink-0">
                    стр. {ch.startPage}–{ch.endPage}
                  </span>
                </button>
              );
            })}

            {bookmarks.length > 0 && (
              <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10 space-y-1">
                <div className="text-[11px] opacity-60 px-3 py-1 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  Мои закладки ({bookmarks.length})
                </div>
                {bookmarks.map((bmPage) => (
                  <button
                    key={bmPage}
                    onClick={() => {
                      navigateToPage(bmPage);
                      setIsTocOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between"
                  >
                    <span>Страница {bmPage}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {Math.round((bmPage / totalPages) * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search in Book Drawer */}
      {isSearchOpen && (
        <div 
          className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 shadow-2xl border-l backdrop-blur-xl flex flex-col animate-in slide-in-from-right-4 transition-all"
          style={{ backgroundColor: themePalette.pageBackground }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" style={{ color: accentColor }} />
              <h3 className="text-sm font-bold">Поиск по тексту книги</h3>
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Слово, имя героя, фраза..."
                autoFocus
                className="w-full pl-3 pr-10 py-2 rounded-xl text-xs border bg-black/5 dark:bg-white/5 outline-none focus:ring-2"
                style={{ outlineColor: accentColor }}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-xs font-bold text-amber-500"
              >
                Найти
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {searchResults.length === 0 ? (
              <div className="text-center py-10 opacity-60 text-xs">
                {searchQuery ? 'Ничего не найдено. Попробуйте другое слово' : 'Введите запрос для поиска по главам книги'}
              </div>
            ) : (
              searchResults.map((match, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigateToPage(match.pageNumber);
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: accentColor }}>
                    <span>Стр. {match.pageNumber}</span>
                    <span className="opacity-60 text-[10px]">{match.chapterTitle}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-85">
                    {match.excerpt}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quotes & Notes Drawer */}
      {isQuotesOpen && (
        <div 
          className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 shadow-2xl border-l backdrop-blur-xl flex flex-col animate-in slide-in-from-right-4 transition-all"
          style={{ backgroundColor: themePalette.pageBackground }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Highlighter className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold">Цитаты и заметки ({savedQuotes.length})</h3>
            </div>
            <button 
              onClick={() => setIsQuotesOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {savedQuotes.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Highlighter className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
                <p className="text-xs opacity-75">
                  Выделите любой текст на странице книги мышкой или пальцем, чтобы сохранить его в цитаты или скопировать.
                </p>
              </div>
            ) : (
              savedQuotes.map((q) => {
                const colorBadge = {
                  yellow: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-400/40',
                  pink: 'bg-pink-400/20 text-pink-600 dark:text-pink-400 border-pink-400/40',
                  mint: 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/40',
                  lavender: 'bg-purple-400/20 text-purple-600 dark:text-purple-400 border-purple-400/40',
                }[q.color];

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border ${colorBadge} space-y-2 transition-all relative group`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                      <span>Стр. {q.pageNumber} • {q.createdAt}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyText(q.text)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          title="Скопировать"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-rose-500"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed italic">
                      «{q.text}»
                    </p>
                    <div className="text-[10px] opacity-70">
                      Глава: {q.chapterTitle}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Book Soundtrack Playlist Drawer (Read Open Source Songs & Playback) */}
      {isPlaylistDrawerOpen && (
        <div 
          className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 shadow-2xl border-l backdrop-blur-xl flex flex-col animate-in slide-in-from-right-4 transition-all"
          style={{ backgroundColor: themePalette.pageBackground }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold">Саундтрек книги</h3>
                <span className="text-[10px] opacity-60">Открытые источники • CC-BY & Public Domain</span>
              </div>
            </div>
            <button 
              onClick={() => setIsPlaylistDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b bg-amber-500/10 flex items-center justify-between">
            <span className="text-xs font-semibold">{bookPlaylist.title}</span>
            <button
              onClick={() => {
                if (audioState.isPlaying) {
                  openAudioService.togglePlay();
                } else {
                  openAudioService.setPlaylist(bookPlaylist.tracks, 0, true);
                }
              }}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950"
            >
              {audioState.isPlaying ? 'Пауза' : 'Слушать все'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {bookPlaylist.tracks.map((track, idx) => {
              const isCurrent = audioState.isPlaying && audioState.currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => {
                          if (isCurrent) {
                            openAudioService.togglePlay();
                          } else {
                            openAudioService.setPlaylist(bookPlaylist.tracks, idx, true);
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-black/10 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950'
                        }`}
                      >
                        {isCurrent ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                      </button>
                      <div>
                        <span className="text-xs font-bold block">{track.title}</span>
                        <span className="text-[11px] opacity-75 block">{track.artist}</span>
                        <p className="text-[10px] opacity-80 mt-1 leading-tight text-slate-600 dark:text-slate-400">
                          {track.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono opacity-70 shrink-0">{track.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Jump to Page Dialog Modal (Allows any page number without limits!) */}
      {showJumpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 ${themePalette.panelBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4" style={{ color: accentColor }} />
                Перейти к странице
              </h3>
              <button 
                onClick={() => setShowJumpDialog(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const parsed = parseInt(jumpPageInput, 10);
              if (!isNaN(parsed) && parsed >= 1) {
                navigateToPage(parsed);
                setShowJumpDialog(false);
                setJumpPageInput('');
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs opacity-75">
                  Введите номер страницы (границ нет — вводите любую страницу):
                </label>
                <input
                  type="number"
                  min="1"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder="Например, 530"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-transparent font-mono text-base outline-none focus:ring-2"
                  style={{ outlineColor: accentColor }}
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {[1, 50, 100, 250, 530, 700].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      navigateToPage(p);
                      setShowJumpDialog(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs border hover:bg-black/5 dark:hover:bg-white/5 font-mono"
                  >
                    Стр. {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJumpDialog(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                  style={{ backgroundColor: accentColor, color: contrastText }}
                >
                  Перейти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Reading Stage: Supports Zoom scaling and Paginated vs Scroll (Свиток) modes */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative focus:outline-none"
        tabIndex={0}
      >
        <div 
          className={`mx-auto transition-all duration-150 ${pageWidthClass}`}
          style={{
            transform: pageZoom !== 100 ? `scale(${pageZoom / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Chapter Header */}
          <div className="text-center pt-4 pb-8 space-y-2 border-b border-black/5 dark:border-white/5 mb-8">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest opacity-60">
              {book.title} • {book.author}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold">
              {pageContent.chapterTitle}
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs opacity-60 font-mono pt-1">
              <span>Страница {currentPage} из {totalPages}</span>
              <span>•</span>
              <span>Глава {pageContent.chapterNumber}</span>
              <span>•</span>
              <span>~{minutesLeftInChapter} мин до конца главы</span>
            </div>
          </div>

          {/* Book Text with Typography Customizations */}
          <div 
            className={`space-y-6 ${fontFamilyClass} ${lineHeightClass}`}
            style={{ 
              fontSize: `${fontSize}px`, 
              textAlign: textAlign === 'justify' ? 'justify' : 'left' 
            }}
          >
            {pageContent.paragraphs.map((paragraph, idx) => (
              <p 
                key={idx} 
                className={`indent-6 ${
                  idx === 0 && pageContent.isChapterStart 
                    ? 'first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left' 
                    : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Bottom Watermark */}
          <div className="text-center py-6 text-xs font-mono opacity-50">
            — Страница {currentPage} из {totalPages} (без ограничений) —
          </div>

          {/* Navigation Controls between pages */}
          <div className="pt-6 pb-20 flex items-center justify-between gap-4 border-t border-black/5 dark:border-white/5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-30 border hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Пред. страница</span>
            </button>

            <button
              onClick={() => {
                setJumpPageInput(String(currentPage));
                setShowJumpDialog(true);
              }}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1"
            >
              <span>{currentPage}</span>
              <span className="opacity-40">/</span>
              <span className="opacity-70">{totalPages}</span>
            </button>

            <button
              onClick={handleNextPage}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              style={{ backgroundColor: accentColor, color: contrastText }}
            >
              <span>След. страница</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* Docked In-Reader Audio, Page Slider & Bottom Bar (Yandex Books styled) */}
      <footer className={`sticky bottom-0 z-30 border-t backdrop-blur-md px-3 sm:px-6 py-2.5 flex flex-col gap-2 ${themePalette.headerBg}`}>
        
        {/* Interactive Page Slider Scrub Bar (allows navigating all pages smoothly) */}
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto px-1">
          <span className="text-[11px] font-mono opacity-60 shrink-0 w-8 text-right">
            {currentPage}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="1"
              max={Math.max(basePages, currentPage + 20)}
              value={currentPage}
              onChange={(e) => navigateToPage(parseInt(e.target.value, 10))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
              style={{ accentColor }}
            />
          </div>
          <span className="text-[11px] font-mono opacity-60 shrink-0 w-12">
            / {totalPages}
          </span>
        </div>

        {/* Audio Player & Sound Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto w-full">
          
          {/* Music playback controls with Open Source Songs */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => openAudioService.prevTrack()}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                title="Предыдущая песня"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (audioState.isPlaying) {
                    openAudioService.togglePlay();
                  } else {
                    if (audioState.currentTrack) {
                      openAudioService.togglePlay();
                    } else {
                      openAudioService.setPlaylist(bookPlaylist.tracks, 0, true);
                    }
                  }
                }}
                className="p-2 rounded-xl flex items-center justify-center transition-all shadow-md"
                style={{ backgroundColor: accentColor, color: contrastText }}
                title={audioState.isPlaying ? 'Пауза саундтрека' : 'Воспроизвести саундтрек'}
              >
                {audioState.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => openAudioService.nextTrack()}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                title="Следующая песня"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              onClick={() => setIsPlaylistDrawerOpen(true)}
              className="flex flex-col min-w-0 cursor-pointer group"
              title="Открыть плейлист саундтрека"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold truncate max-w-[160px] sm:max-w-[220px] group-hover:underline">
                  {audioState.currentTrack ? audioState.currentTrack.title : bookPlaylist.tracks[0]?.title || 'Саундтрек книги'}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                  CC / Free
                </span>
              </div>
              <span className="text-[10px] opacity-70 truncate max-w-[160px] sm:max-w-[220px]">
                {audioState.currentTrack ? audioState.currentTrack.artist : bookPlaylist.tracks[0]?.artist || 'Открытые источники'}
              </span>
            </div>

            {/* Quick Ambients */}
            <div className="flex items-center gap-1 ml-2 border-l border-black/10 dark:border-white/10 pl-2">
              <button
                onClick={() => onToggleAmbient('rain')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activeAmbients.includes('rain') ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={
                  activeAmbients.includes('rain')
                    ? { backgroundColor: accentColor, color: contrastText }
                    : undefined
                }
                title="Дождь"
              >
                <CloudRain className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleAmbient('fireplace')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  activeAmbients.includes('fireplace') ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={
                  activeAmbients.includes('fireplace')
                    ? { backgroundColor: accentColor, color: contrastText }
                    : undefined
                }
                title="Камин"
              >
                <Flame className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono opacity-80">
            <span>Прочитано: {pageContent.progressPercent}%</span>
            <span className="opacity-40">•</span>
            <span>Стр. {currentPage} из {totalPages}</span>
            <span className="opacity-40">•</span>
            <button
              onClick={() => setIsPlaylistDrawerOpen(true)}
              className="text-amber-500 hover:underline flex items-center gap-1"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Плейлист ({bookPlaylist.tracks.length})</span>
            </button>
          </div>
        </div>

      </footer>
    </div>
  );
};
