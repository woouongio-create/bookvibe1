import React from 'react';
import { 
  X, 
  Music, 
  CheckCircle2, 
  Sparkles, 
  Headphones, 
  Radio, 
  Zap, 
  Volume2 
} from 'lucide-react';
import { AppTheme } from '../types';

interface YandexMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  isConnected: boolean;
  onToggleConnection: () => void;
}

export const YandexMusicModal: React.FC<YandexMusicModalProps> = ({
  isOpen,
  onClose,
  theme,
  isConnected,
  onToggleConnection,
}) => {
  if (!isOpen) return null;

  const themeStyles = {
    beige: {
      modalBg: 'bg-[#FDFBF7] text-[#2B2621]',
      border: 'border-[#E6DEC8]',
      cardBg: 'bg-[#F4EFE2]',
      subtext: 'text-[#6D6353]',
    },
    light: {
      modalBg: 'bg-white text-slate-900',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50',
      subtext: 'text-slate-500',
    },
    dark: {
      modalBg: 'bg-[#15171F] text-slate-100',
      border: 'border-[#272B38]',
      cardBg: 'bg-[#1C1F2B]',
      subtext: 'text-slate-400',
    },
  }[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/65 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 ${themeStyles.modalBg} ${themeStyles.border}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
              Я
            </div>
            <div>
              <h3 className="font-bold text-lg">Яндекс Музыка для Книг</h3>
              <p className={`text-xs ${themeStyles.subtext}`}>Интеграция с подпиской Яндекс Плюс</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} flex items-start gap-3.5`}>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs">«Моя волна для чтения»</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${themeStyles.subtext}`}>
                Алгоритм анализирует эмоциональное напряжение страниц книги и в реальном времени меняет гармонию музыки.
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} flex items-start gap-3.5`}>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Hi-Fi качество и эксклюзивные саундтреки</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${themeStyles.subtext}`}>
                Неограниченный доступ к звуковым текстурам, оркестровым сессиям и процедурным эмбиентам без рекламы.
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} flex items-start gap-3.5`}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Синхронизация с умными колонками</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${themeStyles.subtext}`}>
                Продолжайте слушать книжный саундтрек на Яндекс Станции с Алисой.
              </p>
            </div>
          </div>
        </div>

        {/* Current status */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs">
          <span className="opacity-70">Текущий статус:</span>
          {isConnected ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Яндекс Плюс активен
            </span>
          ) : (
            <span className="font-semibold opacity-70">Бесплатная базовая медиатека</span>
          )}
        </div>

        {/* Action buttons (Requirement 2) */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onToggleConnection();
              onClose();
            }}
            className="w-full py-3.5 px-5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Music className="w-4 h-4" />
            <span>{isConnected ? 'Отключить Yandex Music' : 'Подключить Yandex Music'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl font-semibold text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-80 hover:opacity-100"
          >
            Продолжить с бесплатной медиатекой
          </button>
        </div>

      </div>
    </div>
  );
};
