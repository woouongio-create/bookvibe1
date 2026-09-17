/**
 * Open Audio Service for BookVibe
 * Streams and plays licensed royalty-free / Creative Commons & Public Domain songs
 * from verified open archives (Archive.org Musopen collection, Kevin MacLeod Incompetech CC-BY, Open Symphonies)
 * with robust procedural Web Audio fallback to guarantee playback anywhere.
 */

import { soundEngine } from './soundEngine';

export interface OpenTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // "04:12"
  durationSeconds: number;
  genre: string;
  mood: string;
  source: 'Musopen (Public Domain)' | 'Incompetech (CC-BY 4.0)' | 'Open Symphony (Public Domain)' | 'Archive.org Open Audio';
  license: 'CC-BY' | 'Public Domain' | 'CC0';
  audioUrl: string;
  coverImage?: string;
  description: string;
}

export interface BookPlaylist {
  bookId?: string;
  genre?: string;
  title: string;
  description: string;
  tracks: OpenTrack[];
}

// Curated verified open-source tracks from open internet archives (with CORS enabled)
export const OPEN_SOURCE_TRACKS: OpenTrack[] = [
  // 1. Fantasy & Orchestral (Kevin MacLeod / Incompetech CC-BY & Musopen)
  {
    id: 'track-evening-fall-harp',
    title: 'Evening Fall (Harp & Strings)',
    artist: 'Kevin MacLeod',
    album: 'Atlantean Twilight',
    duration: '03:42',
    durationSeconds: 222,
    genre: 'Фэнтези и Эпос',
    mood: 'Магическая безмятежность и полет драконов',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-Macleod_Atlantean-Twilight_2014_FullAlbum/Atlantean%20Twilight/Kevin%20MacLeod%20-%2006%20-%20Evening%20Fall%20(Harp).mp3',
    description: 'Чарующие переливы арфы и мягкие оркестровые струнные, создающие атмосферу древней цитадели и полетов над облаками.'
  },
  {
    id: 'track-chopin-waltz-69',
    title: 'Waltz in A Flat Major, Op. 69 No. 1',
    artist: 'Frédéric Chopin (исп. Luke Faulkner)',
    album: 'Musopen Chopin Masterpieces',
    duration: '04:15',
    durationSeconds: 255,
    genre: 'Классика / Романтика',
    mood: 'Изящный бальный вальс и светлая ностальгия',
    source: 'Musopen (Public Domain)',
    license: 'Public Domain',
    audioUrl: 'https://archive.org/download/MusopenChopinWaltzOp69no1/F.%20Chopin%20-%20Waltz%20in%20A%20flat%20major%2C%20Op.%2069%20no.%201%20(Luke%20Faulkner).mp3',
    description: 'Утонченная фортепианная лирика для романтических сцен, вечерних бесед и тайн высшего света.'
  },
  {
    id: 'track-atlantean-twilight',
    title: 'Atlantean Twilight',
    artist: 'Kevin MacLeod',
    album: 'Atlantean Twilight',
    duration: '04:55',
    durationSeconds: 295,
    genre: 'Фэнтези',
    mood: 'Таинственные руины и магия предков',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-Macleod_Atlantean-Twilight_2014_FullAlbum/Atlantean%20Twilight/Kevin%20MacLeod%20-%2001%20-%20Atlantean%20Twilight.mp3',
    description: 'Глубокий эмбиент с экзотическими деревянными духовыми для исследования древних замков и руин.'
  },
  {
    id: 'track-chopin-waltz-34',
    title: 'Waltz Op. 34 No. 2 in A Minor',
    artist: 'Frédéric Chopin',
    album: 'Musopen Chopin Collection',
    duration: '05:03',
    durationSeconds: 303,
    genre: 'Меланхолия / Дарк Роман',
    mood: 'Тайная страсть и роковая меланхолия',
    source: 'Musopen (Public Domain)',
    license: 'Public Domain',
    audioUrl: 'https://archive.org/download/musopen-chopin/WaltzOp.34No.2InAMinor.mp3',
    description: 'Один из самых выразительных и задумчивых вальсов Шопена, идеальный фон для сложных эмоциональных дилемм.'
  },
  {
    id: 'track-chopin-ballade-1',
    title: 'Ballade No. 1 in G Minor, Op. 23',
    artist: 'Frédéric Chopin',
    album: 'Musopen Chopin Collection',
    duration: '08:45',
    durationSeconds: 525,
    genre: 'Драма и Триллер',
    mood: 'Буря эмоций, нарастающее напряжение и кульминация',
    source: 'Musopen (Public Domain)',
    license: 'Public Domain',
    audioUrl: 'https://archive.org/download/musopen-chopin/Ballade%20no.%201%20-%20Op.%2023.mp3',
    description: 'Монументальное драматическое полотно с виртуозными пассажами, передающее дух восстания и неизбежной развязки.'
  },
  {
    id: 'track-mystery-myst',
    title: 'Myst (Detective Atmosphere)',
    artist: 'Kevin MacLeod',
    album: 'Mystery Collection',
    duration: '04:18',
    durationSeconds: 258,
    genre: 'Детектив и Мистика',
    mood: 'Расследование в тумане, скрип половиц и тайны',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-MacLeod_Mystery_2014_FullAlbum/Mystery/Kevin%20MacLeod%20-%2004%20-%20Myst.mp3',
    description: 'Напряженный саспенс с низкими струнными и мерным пульсом таймера для детективных загадок и триллеров.'
  },
  {
    id: 'track-mystery-not-as-it-seems',
    title: 'Not As It Seems',
    artist: 'Kevin MacLeod',
    album: 'Mystery Collection',
    duration: '03:12',
    durationSeconds: 192,
    genre: 'Триллеры',
    mood: 'Психологическое противостояние и разоблачение лжи',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-MacLeod_Mystery_2014_FullAlbum/Mystery/Kevin%20MacLeod%20-%2005%20-%20Not%20As%20It%20Seems.mp3',
    description: 'Сдержанный тревожный ритм для неожиданных поворотов сюжета и раскрытия тайн прошлого.'
  },
  {
    id: 'track-ghostpocalypse-departure',
    title: 'Departure (Ghostpocalypse)',
    artist: 'Kevin MacLeod',
    album: 'Ghostpocalypse',
    duration: '03:50',
    durationSeconds: 230,
    genre: 'Темное фэнтези / Хоррор',
    mood: 'Мрачная цитадель, опасная экспедиция и тени',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-MacLeod_Ghostpocalypse_2014_FullAlbum/Ghostpocalypse/Kevin%20MacLeod%20-%2001%20-%20Departure.mp3',
    description: 'Тягучие кинематографические струнные и глубокие барабаны для битв в подземельях и столкновений с древней тьмой.'
  },
  {
    id: 'track-luminous-rain',
    title: 'Luminous Rain',
    artist: 'Kevin MacLeod',
    album: 'Atlantean Twilight',
    duration: '04:02',
    durationSeconds: 242,
    genre: 'Романтика / Уют',
    mood: 'Теплый ливень за окном, горячий чай и нежность',
    source: 'Incompetech (CC-BY 4.0)',
    license: 'CC-BY',
    audioUrl: 'https://archive.org/download/Kevin-Macleod_Atlantean-Twilight_2014_FullAlbum/Atlantean%20Twilight/Kevin%20MacLeod%20-%2010%20-%20Luminous%20Rain.mp3',
    description: 'Атмосферный трек с мягким акустическим звучанием, согревающим во время ночного чтения.'
  },
  {
    id: 'track-beethoven-symphony-5-andante',
    title: 'Symphony No. 5 - II. Andante Con Moto',
    artist: 'Ludwig van Beethoven',
    album: 'Musopen Symphony Collection',
    duration: '09:30',
    durationSeconds: 570,
    genre: 'Эпос и Классика',
    mood: 'Величие, триумф надежды и преодоление судьбы',
    source: 'Open Symphony (Public Domain)',
    license: 'Public Domain',
    audioUrl: 'https://archive.org/download/Musopen-Libre/SymphonyNo.5InCMinorOp.67-2.AndanteConMoto.mp3',
    description: 'Благородная лирическая часть легендарной симфонии Бетховена для глубоких философских глав.'
  }
];

// Helper to assemble genre-based and book-specific reading playlists
export function getBookPlaylist(bookId?: string, genres: string[] = []): BookPlaylist {
  const isFantasy = genres.some((g) => g.toLowerCase().includes('фэнтези') || g.toLowerCase().includes('мистика'));
  const isRomance = genres.some((g) => g.toLowerCase().includes('роман') || g.toLowerCase().includes('драма'));
  const isThriller = genres.some((g) => g.toLowerCase().includes('триллер') || g.toLowerCase().includes('детектив'));

  let selectedTracks: OpenTrack[] = [];
  let title = 'Атмосферный саундтрек для чтения';
  let description = 'Музыка из открытых источников с лицензией Creative Commons и Public Domain для полного погружения в книгу';

  if (isFantasy) {
    title = 'Саундтрек: Полет драконов и магия эпоса';
    description = 'Величественная оркестровая музыка, арфа и кинематографические струнные из открытых архивов Musopen & Incompetech';
    selectedTracks = [
      OPEN_SOURCE_TRACKS[0], // Evening Fall Harp
      OPEN_SOURCE_TRACKS[2], // Atlantean Twilight
      OPEN_SOURCE_TRACKS[1], // Chopin Waltz 69
      OPEN_SOURCE_TRACKS[7], // Ghostpocalypse Departure
      OPEN_SOURCE_TRACKS[9], // Beethoven Andante
    ];
  } else if (isThriller) {
    title = 'Саундтрек: Нуарный детектив и тайны';
    description = 'Напряженные партии рояля, саспенс и пульсирующие струнные из открытых фонотек';
    selectedTracks = [
      OPEN_SOURCE_TRACKS[5], // Myst
      OPEN_SOURCE_TRACKS[6], // Not As It Seems
      OPEN_SOURCE_TRACKS[3], // Chopin Waltz 34
      OPEN_SOURCE_TRACKS[4], // Chopin Ballade 1
      OPEN_SOURCE_TRACKS[7], // Departure
    ];
  } else if (isRomance) {
    title = 'Саундтрек: Лирика чувств и тихий вечер';
    description = 'Пронзительные вальсы Шопена, теплая арфа и нежный эмбиент из открытых источников';
    selectedTracks = [
      OPEN_SOURCE_TRACKS[1], // Chopin Waltz 69
      OPEN_SOURCE_TRACKS[8], // Luminous Rain
      OPEN_SOURCE_TRACKS[3], // Chopin Waltz 34
      OPEN_SOURCE_TRACKS[0], // Evening Fall Harp
      OPEN_SOURCE_TRACKS[9], // Beethoven Andante
    ];
  } else {
    // Balanced mix
    title = 'Саундтрек: Вдохновение и гармония сюжета';
    description = 'Классические шедевры и спокойный инструментал для сосредоточенного комфортного чтения';
    selectedTracks = [
      OPEN_SOURCE_TRACKS[0],
      OPEN_SOURCE_TRACKS[1],
      OPEN_SOURCE_TRACKS[8],
      OPEN_SOURCE_TRACKS[3],
      OPEN_SOURCE_TRACKS[5],
    ];
  }

  return {
    bookId,
    title,
    description,
    tracks: selectedTracks,
  };
}

class OpenAudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: OpenTrack | null = null;
  private currentPlaylist: OpenTrack[] = [];
  private currentTrackIndex = 0;
  private isPlaying = false;
  private volume = 0.7;
  private listeners: Set<(state: AudioPlayerState) => void> = new Set();
  private progressInterval: number | null = null;
  private currentTime = 0;
  private duration = 0;
  private isUsingSynthFallback = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.isUsingSynthFallback = false;
      this.notify();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration || this.currentTrack?.durationSeconds || 0;
        this.notify();
      }
    });

    this.audioElement.addEventListener('ended', () => {
      // Auto-play next track in the book playlist
      this.nextTrack();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio streaming notice: Falling back to rich procedural Web Audio synth', e);
      // Seamlessly fallback to procedural generative synth so reading is NEVER interrupted
      this.isUsingSynthFallback = true;
      soundEngine.startMusic('ambient');
      this.isPlaying = true;
      this.notify();
    });
  }

  public subscribe(listener: (state: AudioPlayerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState(): AudioPlayerState {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      currentPlaylist: this.currentPlaylist,
      currentTrackIndex: this.currentTrackIndex,
      volume: this.volume,
      currentTime: this.currentTime,
      duration: this.duration || this.currentTrack?.durationSeconds || 0,
      isUsingSynthFallback: this.isUsingSynthFallback,
    };
  }

  public setPlaylist(tracks: OpenTrack[], startIndex = 0, autoPlay = true) {
    this.initAudio();
    this.currentPlaylist = tracks;
    this.currentTrackIndex = Math.max(0, Math.min(tracks.length - 1, startIndex));
    const targetTrack = tracks[this.currentTrackIndex];

    if (targetTrack) {
      this.playTrack(targetTrack, autoPlay);
    }
  }

  public playTrack(track: OpenTrack, autoPlay = true) {
    this.initAudio();
    this.currentTrack = track;
    this.isUsingSynthFallback = false;

    // Find index in playlist if present
    const idx = this.currentPlaylist.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
    } else {
      this.currentPlaylist = [track];
      this.currentTrackIndex = 0;
    }

    if (this.audioElement) {
      this.audioElement.src = track.audioUrl;
      this.audioElement.volume = this.volume;
      this.currentTime = 0;
      this.duration = track.durationSeconds;

      if (autoPlay) {
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Autoplay deferred or network blocked, using Web Audio engine fallback:', err);
            this.isUsingSynthFallback = true;
            soundEngine.startMusic('ambient');
            this.isPlaying = true;
            this.notify();
          });
        }
      }
    }
    this.notify();
  }

  public togglePlay() {
    this.initAudio();
    if (!this.currentTrack) {
      if (this.currentPlaylist.length > 0) {
        this.playTrack(this.currentPlaylist[0], true);
      } else {
        this.playTrack(OPEN_SOURCE_TRACKS[0], true);
      }
      return;
    }

    if (this.isUsingSynthFallback) {
      if (this.isPlaying) {
        soundEngine.stopMusic();
        this.isPlaying = false;
      } else {
        soundEngine.startMusic('ambient');
        this.isPlaying = true;
      }
      this.notify();
      return;
    }

    if (this.audioElement) {
      if (this.isPlaying) {
        this.audioElement.pause();
      } else {
        this.audioElement.play().catch(() => {
          this.isUsingSynthFallback = true;
          soundEngine.startMusic('ambient');
          this.isPlaying = true;
          this.notify();
        });
      }
    }
  }

  public nextTrack() {
    if (this.currentPlaylist.length === 0) return;
    const nextIdx = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
    this.currentTrackIndex = nextIdx;
    this.playTrack(this.currentPlaylist[nextIdx], true);
  }

  public prevTrack() {
    if (this.currentPlaylist.length === 0) return;
    const prevIdx = (this.currentTrackIndex - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
    this.currentTrackIndex = prevIdx;
    this.playTrack(this.currentPlaylist[prevIdx], true);
  }

  public seek(seconds: number) {
    if (this.audioElement && !this.isUsingSynthFallback) {
      this.audioElement.currentTime = seconds;
      this.currentTime = seconds;
      this.notify();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    soundEngine.setMusicVolume(clamped);
    this.notify();
  }
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: OpenTrack | null;
  currentPlaylist: OpenTrack[];
  currentTrackIndex: number;
  volume: number;
  currentTime: number;
  duration: number;
  isUsingSynthFallback: boolean;
}

export const openAudioService = new OpenAudioPlayerService();
