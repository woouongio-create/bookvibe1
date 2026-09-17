export type AppTheme = 'beige' | 'light' | 'dark';

export type BookGenre =
  | 'Фэнтези'
  | 'Романтика'
  | 'Детектив'
  | 'Дарк Романы'
  | 'Драма'
  | 'Триллеры'
  | 'Ужасы и мистика'
  | 'Современные любовные романы'
  | 'Фантастика';

export const ALL_GENRES: BookGenre[] = [
  'Фэнтези',
  'Романтика',
  'Детектив',
  'Дарк Романы',
  'Драма',
  'Триллеры',
  'Ужасы и мистика',
  'Современные любовные романы',
  'Фантастика',
];

export interface ChronologyPhase {
  timeRange: string; // e.g. "0 - 15 мин"
  title: string;
  mood: string;
  description: string;
  instrument: string;
}

export interface AudioTemplate {
  id: string;
  title: string;
  description: string;
  moodBadge: string;
  accentColor: string;
  synthPreset: 'mystic' | 'melancholy' | 'epic' | 'ambient' | 'lofi' | 'tension';
  chronology: ChronologyPhase[];
}

export interface Chapter {
  title: string;
  content: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  annotation: string;
  genres: BookGenre[];
  rating: number;
  reviewsCount: number;
  readingTimeMinutes: number;
  pages: number;
  featuredQuote: string;
  aiPlotSummary: string;
  audioTemplates: AudioTemplate[];
  chapters: Chapter[];
  isFavorite?: boolean;
  isRead?: boolean;
  progressPercent?: number;
  currentPage?: number;
  fullText?: string;
  isUserUploaded?: boolean;
  sourceUrl?: string;
}

export type AmbientSoundType = 'rain' | 'fireplace' | 'library' | 'cosmic' | 'cafe';

export interface AmbientTrack {
  id: AmbientSoundType;
  name: string;
  icon: string;
  description: string;
  volume: number;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  bannerGradient: string;
  bio: string;
  readingGoalMinutes: number;
  streakDays: number;
  totalMinutesRead: number;
  isYandexMusicConnected: boolean;
  inactivityTimeoutMinutes: number; // default 5 min
  weeklyActivity: {
    day: string;
    minutes: number;
    target: number;
  }[];
  favoriteBookId: string;
  favoriteGenre: BookGenre;
}

export interface AccentColorOption {
  id: string;
  name: string;
  hex: string;
  isCustom?: boolean;
}

export type FontFamilyChoice = 'system' | 'literata' | 'jakarta' | 'georgia' | 'monospace';
export type CardLayoutDensity = 'comfortable' | 'compact';
export type CornerRadiusChoice = 'sharp' | 'rounded' | 'pill';

export interface AppearanceSettings {
  theme: AppTheme;
  accentColor: string;
  customAccents: AccentColorOption[];
  fontFamily: FontFamilyChoice;
  cardDensity: CardLayoutDensity;
  cornerRadius: CornerRadiusChoice;
  enablePaperTexture: boolean;
  enableGlowEffects: boolean;
}
