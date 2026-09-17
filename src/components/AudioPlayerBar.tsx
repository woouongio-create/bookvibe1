import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Clock, 
  Sparkles, 
  CloudRain, 
  Flame, 
  BookOpen, 
  Coffee, 
  ChevronUp, 
  ChevronDown,
  Music2,
  X
} from 'lucide-react';
import { Book, AudioTemplate, AppTheme, AmbientSoundType } from '../types';
import { INITIAL_AMBIENT_TRACKS } from '../data/mockData';
import { getContrastTextColor, hexToRgba } from '../utils/themeUtils';
import { openAudioService, AudioPlayerState } from '../services/openAudioService';

interface AudioPlayerBarProps {
  currentBook: Book | null;
  activeTemplate: AudioTemplate | null;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  onNextTemplate: () => void;
  theme: AppTheme;
  accentColor?: string;
  enableGlowEffects?: boolean;
  activeAmbients: string[];
  onToggleAmbient: (type: AmbientSoundType) => void;
  onOpenTimerModal: () => void;
  timerActive: boolean;
  timerRemaining: number | null;
  musicVolume: number;
  onChangeMusicVolume: (vol: number) => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
  onOpenBookDetail: (book: Book) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentBook,
  activeTemplate,
  isPlayingMusic,
  onToggleMusic,
  onNextTemplate,
  theme,
  accentColor = '#F59E0B',
  enableGlowEffects = true,
  activeAmbients,
  onToggleAmbient,
  onOpenTimerModal,
  timerActive,
  timerRemaining,
  musicVolume,
  onChangeMusicVolume,
  ambientVolume,
  onChangeAmbientVolume,
  onOpenBookDetail,
}) => {
  const [isAmbientDrawerOpen, setIsAmbientDrawerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([4, 8, 12, 16, 10, 6, 14, 8]);
  const [openAudioState, setOpenAudioState] = useState<AudioPlayerState>(openAudioService.getState());

  const contrastText = getContrastTextColor(accentColor);

  // Subscribe to Open Audio Player Service
  useEffect(() => {
    return openAudioService.subscribe((state) => {
      setOpenAudioState(state);
    });
  }, []);

  const isActuallyPlaying = isPlayingMusic || openAudioState.isPlaying;

  // Animated visualizer effect during playback
  useEffect(() => {
    if (!isActuallyPlaying && activeAmbients.length === 0) {
      setVisualizerHeights([3, 3, 3, 3, 3, 3, 3, 3]);
      return;
    }

    const interval = setInterval(() => {
      setVisualizerHeights([
        Math.floor(4 + Math.random() * 16),
        Math.floor(4 + Math.random() * 20),
        Math.floor(4 + Math.random() * 14),
        Math.floor(4 + Math.random() * 22),
        Math.floor(4 + Math.random() * 18),
        Math.floor(4 + Math.random() * 15),
        Math.floor(4 + Math.random() * 20),
        Math.floor(4 + Math.random() * 12),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isActuallyPlaying, activeAmbients.length]);

  if (!currentBook) return null;

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const themeStyles = {
    beige: {
      barBg: 'bg-[#FAF6EC]/95 border-[#E6DEC8] text-[#2B2621]',
      drawerBg: 'bg-[#F5EFE1] border-[#DFD5BE] text-[#2B2621]',
      btnSecondary: 'hover:bg-[#EFEAD9]',
      subtext: 'text-[#6B6151]',
    },
    light: {
      barBg: 'bg-white/95 border-slate-200 text-slate-900',
      drawerBg: 'bg-slate-50 border-slate-200 text-slate-900',
      btnSecondary: 'hover:bg-slate-100',
      subtext: 'text-slate-500',
    },
    dark: {
      barBg: 'bg-[#15171F]/95 border-[#272B38] text-slate-100',
      drawerBg: 'bg-[#1D202B] border-[#2E3342] text-slate-100',
      btnSecondary: 'hover:bg-[#232734]',
      subtext: 'text-slate-400',
    },
  }[theme];

  return (
    <>
      {/* Ambient Soundscapes Popover Drawer */}
      {isAmbientDrawerOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-40 w-80 max-w-[90vw] rounded-2xl border shadow-2xl p-4 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${themeStyles.drawerBg}">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-xs">Фоновые эмбиенты</h4>
            </div>
            <button
              onClick={() => setIsAmbientDrawerOpen(false)}
              className="p-1 rounded-full opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {INITIAL_AMBIENT_TRACKS.map((track) => {
              const isActive = activeAmbients.includes(track.id);
              const getIcon = () => {
                switch (track.id) {
                  case 'rain': return <CloudRain className="w-4 h-4" />;
                  case 'fireplace': return <Flame className="w-4 h-4" />;
                  case 'cafe': return <Coffee className="w-4 h-4" />;
                  default: return <BookOpen className="w-4 h-4" />;
                }
              };

              return (
                <div
                  key={track.id}
                  onClick={() => onToggleAmbient(track.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'font-semibold'
                      : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? { 
                          backgroundColor: hexToRgba(accentColor, 0.15), 
                          borderColor: hexToRgba(accentColor, 0.4),
                          color: accentColor 
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">{getIcon()}</span>
                    <div>
                      <div className="text-xs">{track.name}</div>
                      <div className="text-[10px] opacity-60 line-clamp-1">{track.description}</div>
                    </div>
                  </div>
                  <div 
                    className="w-2.5 h-2.5 rounded-full transition-colors"
                    style={{ backgroundColor: isActive ? accentColor : undefined }}
                  />
                </div>
              );
            })}
          </div>

          {/* Ambient Volume control */}
          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs">
            <span className="opacity-70 text-[11px]">Громкость фона:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
              className="w-32 cursor-pointer"
              style={{ accentColor }}
            />
          </div>
        </div>
      )}

      {/* Main Bottom Player Bar in Yandex Books / Yandex Music Style */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl shadow-2xl transition-all ${themeStyles.barBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Book Cover + Title + Active Template */}
          <div 
            onClick={() => onOpenBookDetail(currentBook)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative w-11 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm border border-black/10">
              <img
                src={currentBook.coverImage}
                alt={currentBook.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm truncate transition-colors">
                  {openAudioState.currentTrack ? openAudioState.currentTrack.title : currentBook.title}
                </h4>
                <span 
                  className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0"
                  style={{ backgroundColor: hexToRgba(accentColor, 0.15), color: accentColor }}
                >
                  {openAudioState.currentTrack ? 'Открытый источник' : activeTemplate?.moodBadge || 'ИИ-саундтрек'}
                </span>
              </div>
              <p className={`text-[11px] truncate ${themeStyles.subtext}`}>
                {openAudioState.currentTrack ? openAudioState.currentTrack.artist : activeTemplate?.title || currentBook.author}
              </p>
            </div>
          </div>

          {/* Center: Waveform Visualizer + Main Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Realtime Waveform Visualizer Bars */}
            <div className="hidden sm:flex items-center gap-0.5 h-6 px-2">
              {visualizerHeights.map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full transition-all duration-100"
                  style={{ 
                    height: `${h}px`,
                    backgroundColor: accentColor,
                    boxShadow: enableGlowEffects && isActuallyPlaying ? `0 0 6px ${accentColor}` : undefined
                  }}
                />
              ))}
            </div>

            {/* Play/Pause Main Button */}
            <button
              onClick={() => {
                if (openAudioState.currentTrack) {
                  openAudioService.togglePlay();
                } else {
                  onToggleMusic();
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hover:scale-105"
              style={{
                backgroundColor: accentColor,
                color: contrastText,
                boxShadow: enableGlowEffects && isActuallyPlaying ? `0 0 16px ${hexToRgba(accentColor, 0.45)}` : undefined
              }}
              title={isActuallyPlaying ? 'Пауза саундтрека' : 'Включить саундтрек'}
            >
              {isActuallyPlaying ? (
                <Pause className="w-5 h-5" style={{ fill: contrastText }} />
              ) : (
                <Play className="w-5 h-5 ml-0.5" style={{ fill: contrastText }} />
              )}
            </button>

            {/* Next track / template switcher */}
            <button
              onClick={() => {
                if (openAudioState.currentTrack) {
                  openAudioService.nextTrack();
                } else {
                  onNextTemplate();
                }
              }}
              className={`p-2 rounded-full transition-colors ${themeStyles.btnSecondary}`}
              title="Следующий трек / аудио-шаблон"
            >
              <SkipForward className="w-4 h-4" />
            </button>

          </div>

          {/* Right: Ambient sound toggle, Timer pill & Volume Slider */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Ambient Drawer Button */}
            <button
              onClick={() => setIsAmbientDrawerOpen(!isAmbientDrawerOpen)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeAmbients.length > 0
                  ? 'border'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
              }`}
              style={
                activeAmbients.length > 0
                  ? { 
                      backgroundColor: hexToRgba(accentColor, 0.18), 
                      color: accentColor,
                      borderColor: hexToRgba(accentColor, 0.4) 
                    }
                  : undefined
              }
              title="Фоновые звуки природы"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Эмбиент</span>
              {activeAmbients.length > 0 && (
                <span 
                  className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: accentColor, color: contrastText }}
                >
                  {activeAmbients.length}
                </span>
              )}
            </button>

            {/* Smart Timer button */}
            <button
              onClick={onOpenTimerModal}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                timerActive
                  ? 'font-bold animate-pulse'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
              }`}
              style={
                timerActive
                  ? { backgroundColor: accentColor, color: contrastText }
                  : undefined
              }
              title="Умный таймер чтения"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {timerActive && timerRemaining !== null ? formatTime(timerRemaining) : 'Таймер'}
              </span>
            </button>

            {/* Volume slider control */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  const targetVol = newMuted ? 0 : 0.65;
                  onChangeMusicVolume(targetVol);
                  openAudioService.setVolume(targetVol);
                }}
                className="opacity-70 hover:opacity-100 p-1"
                title={isMuted ? 'Включить звук' : 'Выключить звук'}
              >
                {isMuted || musicVolume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setIsMuted(false);
                  onChangeMusicVolume(val);
                  openAudioService.setVolume(val);
                }}
                className="w-20 accent-amber-500 cursor-pointer h-1.5"
              />
            </div>

          </div>

        </div>
      </div>
    </>
  );
};
