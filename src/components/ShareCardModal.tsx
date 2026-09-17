import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Music 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Book, AppTheme, UserProfile } from '../types';

interface ShareCardModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  userProfile: UserProfile;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  book,
  isOpen,
  onClose,
  theme,
  userProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedThemeStyle, setSelectedThemeStyle] = useState<'amber' | 'noir' | 'lavender'>('amber');

  if (!isOpen || !book) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `📖 Читаю «${book.title}» автора ${book.author} в BookVibe под адаптивный ИИ-саундтрек! «${book.featuredQuote}»`
    );
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const cardThemes = {
    amber: 'from-amber-900 via-amber-950 to-stone-900 text-amber-50 border-amber-500/30',
    noir: 'from-zinc-900 via-stone-950 to-neutral-900 text-zinc-100 border-zinc-700/50',
    lavender: 'from-purple-950 via-slate-900 to-indigo-950 text-purple-100 border-purple-500/30',
  }[selectedThemeStyle];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#14161F] text-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">Поделиться эстетичной карточкой</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-60 text-[11px]">Стиль карточки:</span>
          {(['amber', 'noir', 'lavender'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setSelectedThemeStyle(style)}
              className={`px-3 py-1 rounded-full capitalize text-xs font-semibold transition-all ${
                selectedThemeStyle === style
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {style === 'amber' ? 'Сепия / Янтарь' : style === 'noir' ? 'Нуар' : 'Лаванда'}
            </button>
          ))}
        </div>

        {/* The Aesthetic Social Card Preview */}
        <div 
          id="social-share-card"
          className={`relative rounded-2xl bg-gradient-to-br p-6 sm:p-7 border shadow-2xl overflow-hidden space-y-5 ${cardThemes}`}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs tracking-wider uppercase font-sans">
                BookVibe
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 font-medium">
              Яндекс Книги
            </span>
          </div>

          {/* Book Details */}
          <div className="flex gap-4 items-center">
            <img
              src={book.coverImage}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-20 aspect-[2/3] rounded-xl object-cover shadow-xl border border-white/20 shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap gap-1">
                {book.genres.slice(0, 2).map((g) => (
                  <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10">
                    {g}
                  </span>
                ))}
              </div>
              <h4 className="font-bold text-base font-serif leading-tight line-clamp-2">
                {book.title}
              </h4>
              <p className="text-xs opacity-75">{book.author}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium pt-0.5">
                <Music className="w-3 h-3" />
                <span className="truncate">{book.audioTemplates[0]?.title || 'ИИ-саундтрек'}</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="italic font-serif text-xs sm:text-sm border-l-2 border-amber-400 pl-3 leading-relaxed opacity-90">
            {book.featuredQuote}
          </blockquote>

          {/* Footer watermark & reader info */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] opacity-60">
            <span>Читает {userProfile.name}</span>
            <span>bookvibe.yandex.ru</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Скопировать карточку и цитату</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
