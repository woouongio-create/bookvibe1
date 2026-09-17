import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Heart, 
  Flame, 
  Clock, 
  BookOpen, 
  Camera, 
  Palette, 
  Share2, 
  TrendingUp, 
  Check, 
  Music,
  Sliders,
  Edit3,
  Target,
  Bookmark,
  Moon,
  Link,
  RotateCcw
} from 'lucide-react';
import { UserProfile, Book, AppTheme, BookGenre, ALL_GENRES } from '../types';
import { hexToRgba, getContrastTextColor } from '../utils/themeUtils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  accentColor?: string;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  books: Book[];
  onOpenBookDetail: (book: Book) => void;
  onOpenShareModal: (book: Book) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
];

const BANNER_GRADIENTS = [
  { label: 'Чёрно-малиновый премиум', value: 'from-zinc-950 via-rose-950/80 to-zinc-900' },
  { label: 'Малиновый закат', value: 'from-rose-600/70 via-pink-700/50 to-purple-900/70' },
  { label: 'Янтарь и роза', value: 'from-amber-600/50 via-rose-500/40 to-purple-700/50' },
  { label: 'Северное сияние', value: 'from-teal-600/50 via-emerald-600/40 to-cyan-700/50' },
  { label: 'Глубокий индиго', value: 'from-indigo-600/50 via-purple-600/40 to-slate-900/60' },
  { label: 'Осенний лес', value: 'from-orange-700/50 via-amber-600/40 to-stone-800/60' },
];

const READING_GOAL_PRESETS = [15, 30, 45, 60, 90, 120];
const INACTIVITY_TIMEOUT_PRESETS = [3, 5, 10, 15];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  theme,
  accentColor = '#E11D48',
  userProfile,
  onUpdateProfile,
  books,
  onOpenBookDetail,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'aiRecs' | 'edit'>('stats');
  
  // Profile editing form state
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [handleInput, setHandleInput] = useState(userProfile.handle);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [avatarInput, setAvatarInput] = useState(userProfile.avatar);
  const [readingGoalInput, setReadingGoalInput] = useState(userProfile.readingGoalMinutes || 45);
  const [favoriteGenreInput, setFavoriteGenreInput] = useState<BookGenre>(userProfile.favoriteGenre || 'Фэнтези');
  const [bannerGradientInput, setBannerGradientInput] = useState(userProfile.bannerGradient || BANNER_GRADIENTS[0].value);
  const [inactivityTimeoutInput, setInactivityTimeoutInput] = useState(userProfile.inactivityTimeoutMinutes || 5);
  
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Keep local state in sync when userProfile changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setNameInput(userProfile.name);
      setHandleInput(userProfile.handle);
      setBioInput(userProfile.bio);
      setAvatarInput(userProfile.avatar);
      setReadingGoalInput(userProfile.readingGoalMinutes || 45);
      setFavoriteGenreInput(userProfile.favoriteGenre || 'Фэнтези');
      setBannerGradientInput(userProfile.bannerGradient || BANNER_GRADIENTS[0].value);
      setInactivityTimeoutInput(userProfile.inactivityTimeoutMinutes || 5);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const favoriteBook = books.find((b) => b.id === userProfile.favoriteBookId) || books[0];

  // Dynamic AI Personalization Algorithm
  const favoriteBooks = books.filter((b) => b.isFavorite);
  const readBooks = books.filter((b) => b.isRead);

  // Preferred genres tally
  const preferredGenreCounts: Record<string, number> = {};
  [...favoriteBooks, ...readBooks].forEach((b) => {
    b.genres.forEach((g) => {
      preferredGenreCounts[g] = (preferredGenreCounts[g] || 0) + 1;
    });
  });

  // AI recommendations
  const aiRecommendations = books
    .filter((b) => !b.isRead)
    .map((book) => {
      const matchScore = book.genres.reduce((acc, g) => acc + (preferredGenreCounts[g] || 0), 0);
      let reason = 'Рекомендовано на основе ваших читательских предпочтений';
      if (favoriteBooks.length > 0) {
        const commonGenre = book.genres.find((g) => favoriteBooks[0].genres.includes(g));
        if (commonGenre) {
          reason = `Похоже по атмосфере на «${favoriteBooks[0].title}» (жанр: ${commonGenre})`;
        }
      }
      return { book, matchScore, reason };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  const handleSaveProfile = () => {
    const formattedHandle = handleInput.trim().startsWith('@') 
      ? handleInput.trim() 
      : `@${handleInput.trim() || 'reader'}`;

    onUpdateProfile({
      name: nameInput.trim() || userProfile.name,
      handle: formattedHandle,
      bio: bioInput.trim(),
      avatar: avatarInput.trim() || userProfile.avatar,
      readingGoalMinutes: readingGoalInput,
      favoriteGenre: favoriteGenreInput,
      bannerGradient: bannerGradientInput,
      inactivityTimeoutMinutes: inactivityTimeoutInput,
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleResetForm = () => {
    setNameInput(userProfile.name);
    setHandleInput(userProfile.handle);
    setBioInput(userProfile.bio);
    setAvatarInput(userProfile.avatar);
    setReadingGoalInput(userProfile.readingGoalMinutes || 45);
    setFavoriteGenreInput(userProfile.favoriteGenre || 'Фэнтези');
    setBannerGradientInput(userProfile.bannerGradient || BANNER_GRADIENTS[0].value);
    setInactivityTimeoutInput(userProfile.inactivityTimeoutMinutes || 5);
  };

  const contrastText = getContrastTextColor(accentColor);
  const accentLight = hexToRgba(accentColor, 0.16);

  const themeStyles = {
    beige: {
      modalBg: 'bg-[#FDFBF7] text-[#2B2621]',
      border: 'border-[#E6DEC8]',
      cardBg: 'bg-[#F5EFE2]',
      subtext: 'text-[#6D6353]',
      inputBg: 'bg-white/80 border-[#DFD8C4] focus:border-amber-600 text-[#2B2621]',
      badge: 'bg-[#EFEAD9] text-[#5C5346]',
    },
    light: {
      modalBg: 'bg-white text-slate-900',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50',
      subtext: 'text-slate-500',
      inputBg: 'bg-slate-50 border-slate-200 focus:border-slate-800 text-slate-900',
      badge: 'bg-slate-100 text-slate-700',
    },
    dark: {
      modalBg: 'bg-[#15171F] text-slate-100',
      border: 'border-[#272B38]',
      cardBg: 'bg-[#1C1F2B]',
      subtext: 'text-slate-400',
      inputBg: 'bg-[#12141A] border-[#2D3142] focus:border-rose-500 text-slate-100',
      badge: 'bg-[#272B38] text-slate-300',
    },
  }[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col ${themeStyles.modalBg} ${themeStyles.border}`}>
        
        {/* Customizable Profile Banner */}
        <div className={`relative h-32 sm:h-40 bg-gradient-to-r ${bannerGradientInput} w-full transition-all`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Header with Avatar and Bio */}
        <div className="px-6 sm:px-8 pb-4 relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <img
                src={avatarInput || userProfile.avatar}
                alt={nameInput || userProfile.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-[#15171F] shadow-xl"
              />
              <button
                onClick={() => setActiveTab('edit')}
                className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Редактировать фото профиля"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-0.5 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold">{nameInput || userProfile.name}</h2>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: accentColor, color: contrastText }}
                >
                  Плюс Активен
                </span>
              </div>
              <p className={`text-xs ${themeStyles.subtext}`}>{handleInput || userProfile.handle}</p>
              <p className={`text-xs max-w-md line-clamp-2 mt-1 ${themeStyles.subtext}`}>
                {bioInput || userProfile.bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {favoriteBook && (
              <button
                onClick={() => onOpenShareModal(favoriteBook)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab(activeTab === 'edit' ? 'stats' : 'edit')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              style={
                activeTab === 'edit' 
                  ? { backgroundColor: accentColor, color: contrastText } 
                  : { backgroundColor: hexToRgba(accentColor, 0.12), color: accentColor }
              }
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{activeTab === 'edit' ? 'К статистике' : 'Редактировать профиль'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 sm:px-8 border-b border-black/5 dark:border-white/5 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 relative transition-colors ${
              activeTab === 'stats' ? 'font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={activeTab === 'stats' ? { color: accentColor } : {}}
          >
            <span>Статистика чтения</span>
            {activeTab === 'stats' && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('aiRecs')}
            className={`py-3 relative flex items-center gap-1.5 transition-colors ${
              activeTab === 'aiRecs' ? 'font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={activeTab === 'aiRecs' ? { color: accentColor } : {}}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Рекомендации от ИИ</span>
            {activeTab === 'aiRecs' && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 relative flex items-center gap-1.5 transition-colors ${
              activeTab === 'edit' ? 'font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={activeTab === 'edit' ? { color: accentColor } : {}}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Редактирование профиля</span>
            {activeTab === 'edit' && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: READING STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Metric Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-1`}>
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    <span className="text-xs font-semibold">Ударный режим</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold">{userProfile.streakDays} дн.</div>
                  <p className={`text-[11px] ${themeStyles.subtext}`}>Каждый день без пропусков</p>
                </div>

                <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-1`}>
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Всего в книгах</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold">{Math.floor(userProfile.totalMinutesRead / 60)} ч.</div>
                  <p className={`text-[11px] ${themeStyles.subtext}`}>{userProfile.totalMinutesRead % 60} мин прочитано</p>
                </div>

                <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-1`}>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-semibold">Завершено</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold">{readBooks.length}</div>
                  <p className={`text-[11px] ${themeStyles.subtext}`}>Книг прочитано полностью</p>
                </div>

                <div className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-1`}>
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <Heart className="w-4 h-4 fill-indigo-500" />
                    <span className="text-xs font-semibold">В избранном</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold">{favoriteBooks.length}</div>
                  <p className={`text-[11px] ${themeStyles.subtext}`}>Тайтлов в коллекции</p>
                </div>
              </div>

              {/* Weekly Activity Tracker */}
              <div className={`p-5 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold">Активность чтения по дням</h3>
                  </div>
                  <span className={`text-xs ${themeStyles.subtext}`}>Цель: {userProfile.readingGoalMinutes} мин/день</span>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end pt-4 h-36">
                  {userProfile.weeklyActivity.map((day) => {
                    const percent = Math.min(100, Math.round((day.minutes / day.target) * 100));
                    const isToday = day.day === 'Сб';
                    return (
                      <div key={day.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.minutes}м
                        </span>
                        <div className="w-full max-w-[28px] bg-black/10 dark:bg-white/10 rounded-xl h-24 overflow-hidden relative flex flex-col justify-end p-0.5">
                          <div
                            className="w-full rounded-lg transition-all duration-500"
                            style={{ 
                              height: `${percent}%`,
                              backgroundColor: isToday ? accentColor : hexToRgba(accentColor, 0.7)
                            }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isToday ? 'text-rose-500' : 'opacity-70'}`}>
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI PERSONALIZATION */}
          {activeTab === 'aiRecs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                    <span>Персонализированные рекомендации от ИИ</span>
                  </h3>
                  <p className={`text-xs ${themeStyles.subtext}`}>
                    Подобрано на основе ваших книг со статусом «Любимое» и завершенных тайтлов
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {aiRecommendations.map(({ book, reason }) => (
                  <div
                    key={book.id}
                    onClick={() => onOpenBookDetail(book)}
                    className={`p-4 rounded-2xl border ${themeStyles.cardBg} ${themeStyles.border} hover:border-rose-500/50 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="w-14 aspect-[2/3] rounded-xl object-cover shadow-sm shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{book.title}</h4>
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: accentLight, color: accentColor }}
                          >
                            {book.genres[0]}
                          </span>
                        </div>
                        <p className={`text-xs ${themeStyles.subtext}`}>{book.author}</p>
                        <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: accentColor }}>
                          <Sparkles className="w-3 h-3" />
                          <span>{reason}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBookDetail(book);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 w-full sm:w-auto shadow-sm"
                      style={{ backgroundColor: accentColor, color: contrastText }}
                    >
                      Слушать саундтрек
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FULL PROFILE EDITING */}
          {activeTab === 'edit' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Header Title with live preview hint */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Edit3 className="w-4 h-4" style={{ color: accentColor }} />
                    <span>Редактирование профиля читателя</span>
                  </h3>
                  <p className={`text-xs ${themeStyles.subtext}`}>
                    Настройте ваше имя, никнейм, цели чтения, жанровые вкусы и внешний вид
                  </p>
                </div>
                <button
                  onClick={handleResetForm}
                  className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
                  title="Сбросить изменения к текущим"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сброс</span>
                </button>
              </div>

              {/* 1. Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Имя читателя:</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Например: Дарья Соколова"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${themeStyles.inputBg}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                    <span>@</span>
                    <span>Никнейм (handle):</span>
                  </label>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="@daria_books"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${themeStyles.inputBg}`}
                  />
                </div>
              </div>

              {/* 2. Bio / Reading Manifesto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>О себе / Читательский манифест:</span>
                </label>
                <textarea
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Расскажите о любимых мирах, книжных тропах или атмосфере..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${themeStyles.inputBg}`}
                />
              </div>

              {/* 3. Favorite Genre & Daily Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Favorite Genre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Любимый жанр:</span>
                  </label>
                  <select
                    value={favoriteGenreInput}
                    onChange={(e) => setFavoriteGenreInput(e.target.value as BookGenre)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer ${themeStyles.inputBg}`}
                  >
                    {ALL_GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Daily Reading Goal */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-500" />
                      <span>Цель чтения в день:</span>
                    </label>
                    <span className="text-xs font-bold" style={{ color: accentColor }}>
                      {readingGoalInput} мин
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {READING_GOAL_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReadingGoalInput(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          readingGoalInput === m
                            ? 'shadow-sm'
                            : 'opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5'
                        }`}
                        style={
                          readingGoalInput === m
                            ? { backgroundColor: accentColor, color: contrastText }
                            : {}
                        }
                      >
                        {m} м
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Sleep Inactivity Timeout */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Умное засыпание при бездействии (таймер сна):</span>
                  </label>
                  <span className="text-xs font-bold">{inactivityTimeoutInput} мин</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  {INACTIVITY_TIMEOUT_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInactivityTimeoutInput(t)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        inactivityTimeoutInput === t
                          ? 'shadow-sm'
                          : 'opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5'
                      }`}
                      style={
                        inactivityTimeoutInput === t
                          ? { backgroundColor: accentColor, color: contrastText }
                          : {}
                      }
                    >
                      {t} минут
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Avatar Selection & Custom URL */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <Camera className="w-4 h-4" style={{ color: accentColor }} />
                    <span>Аватарка профиля:</span>
                  </label>
                  <span className="text-[11px] opacity-60">Выберите пресет или вставьте ссылку</span>
                </div>

                {/* Curated Avatars */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`avatar ${idx}`}
                      referrerPolicy="no-referrer"
                      onClick={() => setAvatarInput(url)}
                      className={`w-13 h-13 rounded-2xl object-cover cursor-pointer transition-all shrink-0 ${
                        avatarInput === url
                          ? 'scale-105 shadow-md ring-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={avatarInput === url ? { outlineColor: accentColor } : {}}
                    />
                  ))}
                </div>

                {/* Custom Avatar URL Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                    <input
                      type="text"
                      placeholder="Или вставьте URL своей картинки..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none ${themeStyles.inputBg}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) {
                        setAvatarInput(customAvatarUrl.trim());
                        setCustomAvatarUrl('');
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-all shrink-0"
                  >
                    Применить
                  </button>
                </div>
              </div>

              {/* 6. Banner Gradient Picker */}
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: accentColor }} />
                  <span>Градиент шапки профиля:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BANNER_GRADIENTS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setBannerGradientInput(b.value)}
                      className={`p-3 rounded-2xl text-left border transition-all h-16 flex flex-col justify-end bg-gradient-to-r ${b.value} ${
                        bannerGradientInput === b.value
                          ? 'ring-2 shadow-lg border-transparent'
                          : 'border-black/10 dark:border-white/10 opacity-85 hover:opacity-100'
                      }`}
                      style={bannerGradientInput === b.value ? { outlineColor: accentColor } : {}}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-md flex items-center justify-between">
                        <span>{b.label}</span>
                        {bannerGradientInput === b.value && <Check className="w-3.5 h-3.5 text-white" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button with feedback */}
              <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-3 px-7 rounded-2xl text-xs font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-2"
                  style={{ backgroundColor: accentColor, color: contrastText }}
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavedToast ? 'Успешно сохранено!' : 'Сохранить изменения'}</span>
                </button>

                {isSavedToast && (
                  <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Профиль обновлен</span>
                  </span>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
