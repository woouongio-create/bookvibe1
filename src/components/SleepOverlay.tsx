import React from 'react';
import { Moon, Sparkles, SunMedium, BookOpen } from 'lucide-react';

interface SleepOverlayProps {
  isSleeping: boolean;
  onWakeUp: () => void;
  inactivityMinutes: number;
}

export const SleepOverlay: React.FC<SleepOverlayProps> = ({
  isSleeping,
  onWakeUp,
  inactivityMinutes,
}) => {
  if (!isSleeping) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0A0B0E]/95 backdrop-blur-2xl text-slate-100 flex items-center justify-center p-6 animate-in fade-in duration-700 cursor-pointer select-none"
      onClick={onWakeUp}
    >
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Animated Moon and Stars */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-2xl">
            <Moon className="w-10 h-10 animate-bounce" />
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          <Sparkles className="w-3 h-3 text-amber-400 absolute bottom-2 -left-2 animate-pulse" />
        </div>

        <div className="space-y-2.5">
          <span className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Режим сна активен
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Приложение уснуло, чтобы сберечь ваш сон
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Мы не зафиксировали активности в течение {inactivityMinutes} минут. Звуковое сопровождение плавно затухло.
          </p>
        </div>

        {/* Wake Up Button */}
        <div className="pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWakeUp();
            }}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <SunMedium className="w-4 h-4" />
            <span>Продолжить чтение (плавное включение)</span>
          </button>
          <p className="text-[11px] text-slate-500 mt-2.5">
            или нажмите в любом месте экрана, чтобы проснуться
          </p>
        </div>

      </div>
    </div>
  );
};
