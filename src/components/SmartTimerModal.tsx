import React from 'react';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Moon, 
  BellRing, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Coffee
} from 'lucide-react';
import { AppTheme } from '../types';

interface SmartTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  timerActive: boolean;
  timerRemaining: number | null;
  timerDurationMinutes: number;
  onSetTimerDuration: (minutes: number) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  inactivityTimeoutMinutes: number;
  onSetInactivityTimeout: (minutes: number) => void;
  isBreakModalOpen: boolean;
  onDismissBreak: (addMinutes?: number) => void;
}

export const SmartTimerModal: React.FC<SmartTimerModalProps> = ({
  isOpen,
  onClose,
  theme,
  timerActive,
  timerRemaining,
  timerDurationMinutes,
  onSetTimerDuration,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  inactivityTimeoutMinutes,
  onSetInactivityTimeout,
  isBreakModalOpen,
  onDismissBreak,
}) => {
  if (!isOpen && !isBreakModalOpen) return null;

  const themeStyles = {
    beige: {
      modalBg: 'bg-[#FDFBF7] text-[#2B2621]',
      border: 'border-[#E6DEC8]',
      cardBg: 'bg-[#F4EFE2]',
      subtext: 'text-[#706654]',
      accentBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      presetActive: 'bg-amber-600 text-white font-bold shadow-sm',
      presetInactive: 'bg-[#EFEAD9] text-[#5C5346] hover:bg-[#E5DEC8]',
    },
    light: {
      modalBg: 'bg-white text-slate-900',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50',
      subtext: 'text-slate-500',
      accentBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
      presetActive: 'bg-slate-900 text-white font-bold shadow-sm',
      presetInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    },
    dark: {
      modalBg: 'bg-[#15171F] text-slate-100',
      border: 'border-[#272B38]',
      cardBg: 'bg-[#1D202B]',
      subtext: 'text-slate-400',
      accentBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
      presetActive: 'bg-amber-500 text-slate-950 font-bold shadow-sm',
      presetInactive: 'bg-[#252836] text-slate-300 hover:bg-[#2F3345]',
    },
  }[theme];

  const presets = [15, 30, 45, 60];

  const formatSeconds = (seconds: number | null) => {
    if (seconds === null) return `${timerDurationMinutes}:00`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalSeconds = timerDurationMinutes * 60;
  const currentSeconds = timerRemaining !== null ? timerRemaining : totalSeconds;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - currentSeconds) / totalSeconds) * 100));

  // --- Screen: Break reminder (Время сделать перерыв и отдохнуть!) ---
  if (isBreakModalOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/75 animate-in fade-in">
        <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 text-center space-y-6 ${themeStyles.modalBg} ${themeStyles.border}`}>
          
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
            <Moon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif tracking-tight">
              Время сделать перерыв и отдохнуть!
            </h3>
            <p className={`text-sm leading-relaxed ${themeStyles.subtext}`}>
              Запланированное время чтения подошло к концу. Дайте глазам отдохнуть, а мыслям — усвоить прочитанное. Звуковое сопровождение бережно затухает.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-left space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Совет сомнолога:</span>
            </div>
            <p className="opacity-90">
              Чтение перед сном снижает уровень кортизола. Регулярный отход ко сну в одно время гарантирует глубокую фазу восстановления.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onDismissBreak()}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold shadow-lg transition-all ${themeStyles.accentBtn}`}
            >
              Завершить чтение и лечь спать
            </button>
            <button
              onClick={() => onDismissBreak(5)}
              className="px-4 py-3 rounded-2xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 transition-all"
            >
              + 5 минут
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- Main Smart Timer Setup Modal ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-6 ${themeStyles.modalBg} ${themeStyles.border}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Умный таймер чтения</h3>
              <p className={`text-[11px] ${themeStyles.subtext}`}>Борьба с невысыпанием и ночным переутомлением</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Countdown Display */}
        <div className="flex flex-col items-center justify-center py-3">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-black/10 dark:stroke-white/10"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-amber-500 transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Time readout in center */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-mono tracking-tight">
                {formatSeconds(timerRemaining)}
              </span>
              <span className="text-[11px] uppercase tracking-widest font-semibold opacity-60 mt-0.5">
                {timerActive ? 'Идет чтение' : 'Готов к запуску'}
              </span>
            </div>
          </div>
        </div>

        {/* Presets Row */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider opacity-60">
            Быстрый выбор времени чтения:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => onSetTimerDuration(min)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  timerDurationMinutes === min ? themeStyles.presetActive : themeStyles.presetInactive
                }`}
              >
                {min} мин
              </button>
            ))}
          </div>
        </div>

        {/* Inactivity Threshold Setting (Requirement 3: "если пользователь не отвечает N минут...") */}
        <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Moon className="w-3.5 h-3.5 text-amber-500" />
                <span>Авто-затухание при неактивности:</span>
              </div>
              <p className={`text-[11px] ${themeStyles.subtext}`}>
                Если вы уснули (нет касаний или прокрутки), звук плавно угаснет
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
              {inactivityTimeoutMinutes} мин
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={inactivityTimeoutMinutes}
            onChange={(e) => onSetInactivityTimeout(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 pt-2">
          {timerActive ? (
            <button
              onClick={onPauseTimer}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Пауза таймера</span>
            </button>
          ) : (
            <button
              onClick={onStartTimer}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${themeStyles.accentBtn}`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Запустить таймер</span>
            </button>
          )}

          <button
            onClick={onResetTimer}
            className="p-3 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            title="Сбросить таймер"
          >
            <RotateCcw className="w-4 h-4 opacity-70" />
          </button>
        </div>

      </div>
    </div>
  );
};
