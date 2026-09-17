import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Headphones, 
  Play, 
  Pause, 
  Share2, 
  Music, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  CloudRain,
  Coffee,
  Volume2,
  Disc3,
  ExternalLink,
  ListMusic,
  Info,
  Download,
  ChevronDown
} from 'lucide-react';
import { Book, AppTheme, AudioTemplate, AmbientSoundType } from '../types';
import { getContrastTextColor, hexToRgba } from '../utils/themeUtils';
import { getBookPlaylist, openAudioService, OpenTrack } from '../services/openAudioService';
import { downloadBook } from '../services/downloadBookService';
import { getAuthenticBookCover } from '../utils/bookCoverUtils';

interface BookDetailModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  accentColor?: string;
  onToggleFavorite: (e: React.MouseEvent, bookId: string) => void;
  onStartReading: (book: Book) => void;
  onSelectAudioTemplate: (template: AudioTemplate, book: Book) => void;
  selectedTemplateId: string | null;
  isPlayingMusic: boolean;
  currentPlayingBookId: string | null;
  isYandexMusicConnected: boolean;
  onConnectYandexMusic: () => void;
  onOpenShareModal: (book: Book) => void;
  onToggleAmbient: (type: AmbientSoundType) => void;
  activeAmbients: string[];
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  theme,
  accentColor = '#F59E0B',
  onToggleFavorite,
  onStartReading,
  onSelectAudioTemplate,
  selectedTemplateId,
  isPlayingMusic,
  currentPlayingBookId,
  isYandexMusicConnected,
  onConnectYandexMusic,
  onOpenShareModal,
  onToggleAmbient,
  activeAmbients,
}) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'audioTemplates'>('playlist');
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [audioState, setAudioState] = useState(openAudioService.getState());
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const contrastText = getContrastTextColor(accentColor);

  useEffect(() => {
    return openAudioService.subscribe((state) => {
      setAudioState(state);
    });
  }, []);

  if (!isOpen) return null;

  const bookPlaylist = getBookPlaylist(book.id, book.genres);
  const currentTemplate = book.audioTemplates[activeTemplateIndex] || book.audioTemplates[0];
  const isThisBookPlaying = isPlayingMusic && currentPlayingBookId === book.id;

  const themeStyles = {
    beige: {
      modalBg: 'bg-[#FDFBF7] text-[#2B2621]',
      border: 'border-[#E6DEC8]',
      cardBg: 'bg-[#F5F0E4]',
      subtext: 'text-[#6E6454]',
      badge: 'bg-[#EFEAD9] text-[#5C5346]',
      accentBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      bannerBg: 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-950',
    },
    light: {
      modalBg: 'bg-white text-slate-900',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50',
      subtext: 'text-slate-500',
      badge: 'bg-slate-100 text-slate-700',
      accentBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
      bannerBg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-slate-900',
    },
    dark: {
      modalBg: 'bg-[#15171E] text-slate-100',
      border: 'border-[#282B38]',
      cardBg: 'bg-[#1D202A]',
      subtext: 'text-slate-400',
      badge: 'bg-[#272B38] text-slate-300',
      accentBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
      bannerBg: 'bg-gradient-to-r from-[#2A2315] to-[#1E1C24] border-amber-500/30 text-slate-100',
    },
  }[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col ${themeStyles.modalBg} ${themeStyles.border}`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Яндекс Книги • BookVibe Audio
            </span>
            {isThisBookPlaying && (
              <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Звучит сейчас
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShareModal(book)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Поделиться эстетичной карточкой книги"
            >
              <Share2 className="w-4 h-4 opacity-70" />
            </button>
            <button
              onClick={(e) => onToggleFavorite(e, book.id)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="В избранное"
            >
              <Heart
                className={`w-4 h-4 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : 'opacity-70'}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Закрыть"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Top Hero: Book Cover + Meta details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Cover Column */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative aspect-[2/3] w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border border-black/10">
                <img
                  src={getAuthenticBookCover(book.id, book.coverImage, book.title)}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{book.rating}</span>
                </div>
              </div>

              {/* Reader CTA Button */}
              <button
                onClick={() => onStartReading(book)}
                className="w-full max-w-xs mt-4 py-3 px-5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98"
                style={{ backgroundColor: accentColor, color: contrastText }}
              >
                <BookOpen className="w-4 h-4" />
                <span>Читать книгу</span>
              </button>

              {/* Download Book CTA */}
              <div className="w-full max-w-xs mt-2.5 relative">
                <button
                  onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                  className="w-full py-2.5 px-4 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>Скачать книгу</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-auto" />
                </button>

                {isDownloadOpen && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 z-30 p-2 rounded-2xl shadow-2xl border bg-white dark:bg-[#1E202B] border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => { downloadBook(book, 'txt'); setIsDownloadOpen(false); }}
                      className="px-3 py-2 rounded-xl hover:bg-amber-500/10 text-left font-medium flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold">Текстовый файл (.TXT)</span>
                      <span className="text-[10px] opacity-60">Слово в слово</span>
                    </button>
                    <button
                      onClick={() => { downloadBook(book, 'fb2'); setIsDownloadOpen(false); }}
                      className="px-3 py-2 rounded-xl hover:bg-amber-500/10 text-left font-medium flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold">Формат ридеров (.FB2)</span>
                      <span className="text-[10px] opacity-60">С оглавлением</span>
                    </button>
                    <button
                      onClick={() => { downloadBook(book, 'md'); setIsDownloadOpen(false); }}
                      className="px-3 py-2 rounded-xl hover:bg-amber-500/10 text-left font-medium flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold">Markdown (.MD)</span>
                      <span className="text-[10px] opacity-60">Разметка</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Book Info Column */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {book.genres.map((genre) => (
                  <span
                    key={genre}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${themeStyles.badge}`}
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
                {book.title}
              </h1>

              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="opacity-90">{book.author}</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1 opacity-75 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {book.readingTimeMinutes} мин чтения ({book.pages} стр.)
                </span>
              </div>

              {/* Featured Quote */}
              <div className="p-3.5 rounded-2xl border-l-4 border-amber-500 bg-black/5 dark:bg-white/5 text-sm italic font-serif opacity-90 leading-relaxed">
                {book.featuredQuote}
              </div>

              {/* Annotation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1.5">
                  Аннотация
                </h4>
                <p className={`text-sm leading-relaxed ${themeStyles.subtext}`}>
                  {book.annotation}
                </p>
              </div>

              {/* AI Plot Summary badge */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    ИИ-анализ сюжета:
                  </span>{' '}
                  <span className="opacity-90">{book.aiPlotSummary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner: Yandex Music Subscription Offer (Requirement 2) */}
          <div className={`p-5 rounded-2xl border shadow-sm ${themeStyles.bannerBg}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    Я
                  </div>
                  <h4 className="font-bold text-sm">
                    {isYandexMusicConnected
                      ? 'Яндекс Плюс подключен к BookVibe'
                      : 'Слушайте адаптивные саундтреки с Яндекс Музыкой'}
                  </h4>
                </div>
                <p className="text-xs opacity-80 max-w-xl">
                  {isYandexMusicConnected
                    ? 'Вам доступен неограниченный Hi-Fi аудиопоток, генеративные саундтреки под каждую страницу и режим «Моя волна для книг».'
                    : 'Синхронизируйте музыкальный темп со скоростью чтения страниц. Доступно бесплатно или по подписке Яндекс Плюс.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isYandexMusicConnected ? (
                  <>
                    <button
                      onClick={onConnectYandexMusic}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-all"
                    >
                      Подключить Yandex Music
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-black/10 dark:bg-white/10 hover:bg-black/15 transition-all"
                    >
                      Продолжить с бесплатной медиатекой
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Подписка активна</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Audio Experience Tabs (Open Source Soundtrack Playlist & AI Plot Templates) */}
          <div className="space-y-4">
            {/* Primary Tab Switcher */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('playlist')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'playlist'
                      ? 'shadow-sm'
                      : 'opacity-60 hover:opacity-100 bg-transparent'
                  }`}
                  style={
                    activeTab === 'playlist'
                      ? { backgroundColor: accentColor, color: contrastText }
                      : undefined
                  }
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Плейлист саундтрека ({bookPlaylist.tracks.length})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase font-mono">
                    Open Source
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('audioTemplates')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'audioTemplates'
                      ? 'shadow-sm'
                      : 'opacity-60 hover:opacity-100 bg-transparent'
                  }`}
                  style={
                    activeTab === 'audioTemplates'
                      ? { backgroundColor: accentColor, color: contrastText }
                      : undefined
                  }
                >
                  <Headphones className="w-4 h-4" />
                  <span>ИИ-шаблоны под сюжет</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">Музыка без границ и блокировок</span>
              </div>
            </div>

            {/* TAB 1: Open Source Background Playlist with readable track descriptions */}
            {activeTab === 'playlist' && (
              <div className={`p-5 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {bookPlaylist.title}
                      </span>
                    </div>
                    <p className={`text-xs mt-1.5 max-w-2xl leading-relaxed ${themeStyles.subtext}`}>
                      {bookPlaylist.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (audioState.isPlaying) {
                        openAudioService.togglePlay();
                      } else {
                        openAudioService.setPlaylist(bookPlaylist.tracks, 0, true);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
                    style={{ backgroundColor: accentColor, color: contrastText }}
                  >
                    {audioState.isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Пауза саундтрека</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Слушать весь плейлист</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tracklist Items with readable descriptions */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider opacity-60 px-2">
                    <span>Композиция и настроение</span>
                    <span>Источник / Длительность</span>
                  </div>

                  {bookPlaylist.tracks.map((track, idx) => {
                    const isThisTrackPlaying = audioState.isPlaying && audioState.currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isThisTrackPlaying
                            ? 'border-amber-500/50 bg-amber-500/10'
                            : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Play / Number button */}
                            <button
                              onClick={() => {
                                if (isThisTrackPlaying) {
                                  openAudioService.togglePlay();
                                } else {
                                  openAudioService.setPlaylist(bookPlaylist.tracks, idx, true);
                                }
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform active:scale-95 ${
                                isThisTrackPlaying
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-black/10 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950'
                              }`}
                            >
                              {isThisTrackPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold">{track.title}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-medium">
                                  {track.mood}
                                </span>
                              </div>
                              <p className={`text-[11px] mt-0.5 font-medium ${themeStyles.subtext}`}>
                                {track.artist} • <span className="opacity-80">{track.album}</span>
                              </p>
                              {/* Read playlist details */}
                              <p className="text-[11px] mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                                📖 {track.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-mono font-semibold">{track.duration}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                              {track.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Open source music guarantee note */}
                <div className="pt-2 flex items-center gap-2 text-[11px] opacity-75">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Все композиции получены из открытых архивов (Musopen, Incompetech) под лицензиями Creative Commons и Public Domain. Они играют в читалке непрерывно без рекламы.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: AI Plot Templates and Chronology */}
            {activeTab === 'audioTemplates' && (
              <div className={`p-5 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: hexToRgba(accentColor, 0.18), color: accentColor }}
                      >
                        {currentTemplate.moodBadge}
                      </span>
                      <h4 className="font-bold text-base">{currentTemplate.title}</h4>
                    </div>
                    <p className={`text-xs mt-1 ${themeStyles.subtext}`}>
                      {currentTemplate.description}
                    </p>
                  </div>

                  {/* Template selector pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {book.audioTemplates.map((template, idx) => {
                      const isSelected = activeTemplateIndex === idx;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setActiveTemplateIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                            isSelected
                              ? 'font-bold shadow-sm'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: accentColor, color: contrastText }
                              : undefined
                          }
                        >
                          Шаблон {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chronology Phase Breakdown Table/Timeline (Requirement 2) */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider opacity-60">
                    Хронология развития саундтрека по главам и минутам
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentTemplate.chronology.map((phase, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            {phase.timeRange}
                          </span>
                          <span className="text-[10px] opacity-60 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                            Этап {idx + 1}
                          </span>
                        </div>
                        <h6 className="text-xs font-bold">{phase.title}</h6>
                        <p className={`text-[11px] leading-relaxed ${themeStyles.subtext}`}>
                          {phase.description}
                        </p>
                        <div className="pt-1 text-[10px] opacity-75 italic">
                          🎻 {phase.instrument}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Ambient Toggle Row */}
            <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} flex flex-wrap items-center justify-between gap-3`}>
              <span className="text-xs font-semibold opacity-70 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Фоновый эмбиент читального зала:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'rain', name: 'Дождь', icon: CloudRain },
                  { id: 'fireplace', name: 'Камин', icon: Flame },
                  { id: 'cafe', name: 'Кофейня', icon: Coffee },
                ].map((amb) => {
                  const isActive = activeAmbients.includes(amb.id);
                  const Icon = amb.icon;
                  return (
                    <button
                      key={amb.id}
                      onClick={() => onToggleAmbient(amb.id as AmbientSoundType)}
                      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{amb.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
