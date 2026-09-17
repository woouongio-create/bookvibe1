import React from 'react';
import { Star, Clock, Heart, Headphones, Sparkles, UserCheck, BookOpen } from 'lucide-react';
import { Book, AppTheme } from '../types';
import { getContrastTextColor, hexToRgba } from '../utils/themeUtils';
import { getAuthenticBookCover } from '../utils/bookCoverUtils';

interface BookCardProps {
  book: Book;
  theme: AppTheme;
  accentColor?: string;
  cardDensity?: 'comfortable' | 'compact';
  onSelect: (book: Book) => void;
  onToggleFavorite: (e: React.MouseEvent, bookId: string) => void;
  onQuickPlay: (e: React.MouseEvent, book: Book) => void;
  onStartReading?: (book: Book) => void;
  isCurrentPlaying?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  theme,
  accentColor = '#F59E0B',
  cardDensity = 'comfortable',
  onSelect,
  onToggleFavorite,
  onQuickPlay,
  onStartReading,
  isCurrentPlaying = false,
}) => {
  const contrastText = getContrastTextColor(accentColor);
  const isCompact = cardDensity === 'compact';

  const cardStyle = {
    beige: {
      card: 'bg-[#FBF9F4] border-[#E6DEC8] hover:border-[#D4C8AE] hover:shadow-lg shadow-sm',
      textMain: 'text-[#2B2621]',
      textSub: 'text-[#736859]',
      genreBadge: 'bg-[#EFEAD9] text-[#5C5346]',
      quoteBg: 'bg-[#F3EFE4] text-[#4A4237] border-l-2 border-amber-600',
    },
    light: {
      card: 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg shadow-sm',
      textMain: 'text-slate-900',
      textSub: 'text-slate-500',
      genreBadge: 'bg-slate-100 text-slate-700',
      quoteBg: 'bg-slate-50 text-slate-700 border-l-2 border-amber-500',
    },
    dark: {
      card: 'bg-[#1C1E26] border-[#2A2D3A] hover:border-[#383C4D] hover:shadow-xl shadow-md',
      textMain: 'text-slate-100',
      textSub: 'text-slate-400',
      genreBadge: 'bg-[#272A36] text-slate-300',
      quoteBg: 'bg-[#222530] text-slate-300 border-l-2 border-amber-400',
    },
  }[theme];

  return (
    <div
      onClick={() => onSelect(book)}
      className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${cardStyle.card} ${
        isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
      }`}
    >
      <div>
        {/* Book Cover and Quick Actions Container */}
        <div className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3.5 bg-black/5 shadow-inner`}>
          <img
            src={getAuthenticBookCover(book.id, book.coverImage, book.title)}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-sm ${
                book.isUserUploaded 
                  ? 'bg-emerald-600/90 text-white' 
                  : 'bg-black/60 text-white'
              }`}>
                {book.isUserUploaded ? 'Моя книга' : 'Яндекс Книги'}
              </span>
              <button
                onClick={(e) => onToggleFavorite(e, book.id)}
                className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all transform hover:scale-110 backdrop-blur-sm"
                title={book.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart
                  className={`w-4 h-4 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {onStartReading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartReading(book);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-white"
                  style={{ backgroundColor: accentColor, color: contrastText }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Читать главу</span>
                </button>
              )}
              <button
                onClick={(e) => onQuickPlay(e, book)}
                className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isCurrentPlaying ? 'font-bold' : 'bg-white/90 hover:bg-white text-slate-950 backdrop-blur-sm'
                }`}
                style={
                  isCurrentPlaying && !onStartReading
                    ? { backgroundColor: accentColor, color: contrastText }
                    : undefined
                }
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isCurrentPlaying ? 'Играет сейчас' : 'Слушать аудио'}</span>
              </button>
            </div>
          </div>

          {/* Top badge pills */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{book.rating}</span>
            </div>
          </div>

          <div className="absolute top-2.5 right-2.5">
            <button
              onClick={(e) => onToggleFavorite(e, book.id)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all"
              title="Избранное"
            >
              <Heart
                className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
              />
            </button>
          </div>

          {/* Reading progress bar if started */}
          {book.progressPercent !== undefined && book.progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div
                className="h-full transition-all"
                style={{ width: `${book.progressPercent}%`, backgroundColor: accentColor }}
              />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 opacity-70">
              <Clock className="w-3 h-3" />
              <span>{book.readingTimeMinutes} мин чтения</span>
            </span>
            <span className="opacity-40">•</span>
            <span className="opacity-70">{book.pages} стр</span>
          </div>

          <h3 className={`font-bold text-base leading-snug line-clamp-1 ${cardStyle.textMain}`}>
            {book.title}
          </h3>

          <p className={`text-xs line-clamp-1 ${cardStyle.textSub}`}>
            {book.author}
          </p>

          {!isCompact && (
            <p className={`text-xs line-clamp-2 mt-1 leading-relaxed opacity-80 ${cardStyle.textSub}`}>
              {book.annotation}
            </p>
          )}

          {/* AI Music Presets indicator */}
          <div 
            className="flex items-center gap-1.5 pt-1 text-[11px] font-medium"
            style={{ color: accentColor }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{book.audioTemplates.length} ИИ-аудиошаблона</span>
          </div>
        </div>
      </div>

      {/* Genres and footer */}
      <div className={`pt-3 border-t border-black/5 dark:border-white/5 space-y-2 ${isCompact ? 'mt-2.5' : 'mt-4'}`}>
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cardStyle.genreBadge}`}
            >
              {genre}
            </span>
          ))}
          {book.genres.length > 2 && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cardStyle.genreBadge}`}>
              +{book.genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
