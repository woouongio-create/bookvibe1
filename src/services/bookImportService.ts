import { Book, BookGenre, Chapter } from '../types';
import { parseTextIntoChapters } from './bookContentService';

/**
 * Service for importing books from files (FB2, TXT, MD, EPUB) and URLs
 */

export interface ParsedBookResult {
  title: string;
  author: string;
  annotation: string;
  coverImage: string;
  genres: BookGenre[];
  chapters: Chapter[];
  fullText: string;
  pages: number;
}

/**
 * Generates an SVG book cover with realistic typography and colors
 */
export function generateCoverSvg(title: string, author: string, genre: string = 'Литература'): string {
  const palettes = [
    { bg: '#1E293B', accent: '#38BDF8', text: '#F8FAFC' },
    { bg: '#311E10', accent: '#F59E0B', text: '#FEF3C7' },
    { bg: '#0F291E', accent: '#34D399', text: '#ECFDF5' },
    { bg: '#2E1065', accent: '#C084FC', text: '#FAF5FF' },
    { bg: '#450A0A', accent: '#F87171', text: '#FEF2F2' },
  ];
  
  // Choose palette deterministically
  let hash = 0;
  for (let i = 0; i < (title + author).length; i++) {
    hash = (hash + (title + author).charCodeAt(i)) % palettes.length;
  }
  const pal = palettes[hash];

  const cleanTitle = title.length > 36 ? title.slice(0, 34) + '...' : title;
  const cleanAuthor = author.length > 28 ? author.slice(0, 26) + '...' : author;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${pal.bg}"/>
        <stop offset="100%" stop-color="#090A0F"/>
      </linearGradient>
      <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
        <stop offset="20%" stop-color="rgba(0,0,0,0.3)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#g)"/>
    <rect x="0" y="0" width="30" height="600" fill="url(#spine)"/>
    <rect x="25" y="25" width="350" height="550" fill="none" stroke="${pal.accent}" stroke-width="1.5" stroke-opacity="0.4" rx="6"/>
    <rect x="35" y="35" width="330" height="530" fill="none" stroke="${pal.accent}" stroke-width="0.5" stroke-opacity="0.2" rx="4"/>
    
    <text x="200" y="80" text-anchor="middle" fill="${pal.accent}" font-family="sans-serif" font-size="12" letter-spacing="3" font-weight="600" text-transform="uppercase">${genre.toUpperCase()}</text>
    <line x1="160" y1="95" x2="240" y2="95" stroke="${pal.accent}" stroke-width="1" stroke-opacity="0.6"/>
    
    <text x="200" y="240" text-anchor="middle" fill="${pal.text}" font-family="serif" font-size="28" font-weight="bold">
      ${escapeXml(cleanTitle)}
    </text>
    
    <text x="200" y="310" text-anchor="middle" fill="${pal.accent}" font-family="sans-serif" font-size="16" font-weight="500">
      ${escapeXml(cleanAuthor)}
    </text>

    <circle cx="200" cy="420" r="28" fill="none" stroke="${pal.accent}" stroke-width="1" stroke-opacity="0.5"/>
    <polygon points="200,405 210,425 190,425" fill="${pal.accent}" fill-opacity="0.6"/>

    <text x="200" y="530" text-anchor="middle" fill="${pal.text}" font-family="sans-serif" font-size="11" opacity="0.5" letter-spacing="2">BOOKVIBE • ПОЛНОЕ ИЗДАНИЕ</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parses an FB2 XML string into structured book data
 */
export function parseFb2(xmlString: string, filename: string): ParsedBookResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  // Extract Title
  let title = doc.querySelector('title-info book-title')?.textContent?.trim() || '';
  if (!title) {
    title = filename.replace(/\.fb2$/i, '').replace(/[-_]/g, ' ').trim();
  }

  // Extract Author
  let author = '';
  const authorEl = doc.querySelector('title-info author');
  if (authorEl) {
    const first = authorEl.querySelector('first-name')?.textContent?.trim() || '';
    const last = authorEl.querySelector('last-name')?.textContent?.trim() || '';
    author = `${first} ${last}`.trim();
  }
  if (!author) {
    author = 'Неизвестный автор';
  }

  // Extract Annotation
  const annotation = doc.querySelector('title-info annotation')?.textContent?.trim() || 
    `Электронная книга «${title}» добавлена пользователем.`;

  // Extract Cover (base64)
  let coverImage = '';
  const coverpageHref = doc.querySelector('title-info coverpage image')?.getAttribute('l:href') || 
                        doc.querySelector('title-info coverpage image')?.getAttribute('xlink:href');
  if (coverpageHref) {
    const coverId = coverpageHref.replace(/^#/, '');
    const binary = doc.querySelector(`binary[id="${coverId}"]`) || doc.querySelector('binary');
    if (binary && binary.textContent) {
      const contentType = binary.getAttribute('content-type') || 'image/jpeg';
      const base64Data = binary.textContent.replace(/\s+/g, '');
      coverImage = `data:${contentType};base64,${base64Data}`;
    }
  }

  if (!coverImage) {
    coverImage = generateCoverSvg(title, author, 'Художественная литература');
  }

  // Extract Sections & Paragraphs
  const bodySections = doc.querySelectorAll('body section');
  const chapters: Chapter[] = [];
  let fullTextAccumulator = '';

  if (bodySections.length > 0) {
    bodySections.forEach((sec, idx) => {
      const secTitle = sec.querySelector('title')?.textContent?.trim() || `Глава ${idx + 1}`;
      const paras: string[] = [];
      sec.querySelectorAll('p').forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length > 0) {
          paras.push(text);
          fullTextAccumulator += text + '\n\n';
        }
      });
      if (paras.length > 0) {
        chapters.push({
          title: secTitle,
          content: paras
        });
      }
    });
  }

  // Fallback if no sections
  if (chapters.length === 0) {
    const allParas: string[] = [];
    doc.querySelectorAll('body p').forEach(p => {
      const text = p.textContent?.trim();
      if (text) {
        allParas.push(text);
        fullTextAccumulator += text + '\n\n';
      }
    });
    chapters.push({
      title: `Глава 1. ${title}`,
      content: allParas.length > 0 ? allParas : ['Текст книги успешно загружен.']
    });
  }

  // Calculate pages (~1800 chars per standard printed book page)
  const totalChars = fullTextAccumulator.length;
  const pages = Math.max(1, Math.round(totalChars / 1800) || chapters.length * 4);

  return {
    title,
    author,
    annotation,
    coverImage,
    genres: ['Драма'],
    chapters,
    fullText: fullTextAccumulator,
    pages
  };
}

/**
 * Parses plain text / markdown file
 */
export function parsePlainText(content: string, filename: string): ParsedBookResult {
  let title = filename.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' ').trim();
  let author = 'Автор не указан';

  // Try extracting title and author from first few lines (e.g. "Title - Author" or "# Title")
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^#+\s*/, '');
    if (firstLine.includes(' - ') || firstLine.includes(' — ')) {
      const parts = firstLine.split(/\s*[-—]\s*/);
      if (parts.length >= 2) {
        title = parts[0].trim();
        author = parts[1].trim();
      }
    } else if (firstLine.length < 80) {
      title = firstLine;
      if (lines.length > 1 && lines[1].length < 50 && !lines[1].toLowerCase().startsWith('глава')) {
        author = lines[1].replace(/^(автор|by)[:\s]*/i, '').trim();
      }
    }
  }

  const chapters = parseTextIntoChapters(content, title);
  const totalChars = content.length;
  const pages = Math.max(1, Math.round(totalChars / 1800) || 12);
  const coverImage = generateCoverSvg(title, author, 'Литература');

  return {
    title,
    author,
    annotation: `Книга «${title}» добавлена из файла ${filename}.`,
    coverImage,
    genres: ['Драма'],
    chapters,
    fullText: content,
    pages
  };
}

/**
 * Fetches and parses a book from a public URL
 */
export async function fetchBookFromUrl(url: string): Promise<ParsedBookResult> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Не удалось загрузить книгу по указанной ссылке (ограничение CORS источника). Вы можете вставить текст вручную.');
  }

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: сервер вернул статус ${response.status}`);
  }

  const text = await response.text();
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = pathname.split('/').pop() || 'imported_book.txt';

  if (filename.endsWith('.fb2') || text.includes('<FictionBook')) {
    return parseFb2(text, filename);
  }

  return parsePlainText(text, filename);
}

/**
 * Builds a complete Book object ready to be added to the catalog and persisted
 */
export function createBookFromParsed(parsed: ParsedBookResult, customCover?: string): Book {
  const bookId = `custom-book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  return {
    id: bookId,
    title: parsed.title,
    author: parsed.author,
    coverImage: customCover || parsed.coverImage,
    annotation: parsed.annotation,
    genres: parsed.genres,
    rating: 5.0,
    reviewsCount: 1,
    readingTimeMinutes: Math.round(parsed.pages * 1.8),
    pages: parsed.pages,
    featuredQuote: parsed.chapters[0]?.content[0]?.slice(0, 120) || `«${parsed.title}»`,
    aiPlotSummary: `Пользовательская книга «${parsed.title}» с полным аутентичным текстом слово в слово.`,
    audioTemplates: [
      {
        id: `tpl-${bookId}`,
        title: 'Уютный фокус чтения',
        description: 'Атмосферный саундтрек для неторопливого погружения в чтение',
        moodBadge: 'Фокус и глубина',
        accentColor: '#4F46E5',
        synthPreset: 'ambient',
        chronology: [
          {
            timeRange: '0 – 30 мин',
            title: 'Атмосфера книги',
            mood: 'Умиротворенное погружение',
            description: 'Мягкий акустический фон и глубокие гармонии для чтения.',
            instrument: 'Фортепиано и эмбиент-дрон'
          }
        ]
      }
    ],
    chapters: parsed.chapters,
    fullText: parsed.fullText,
    isUserUploaded: true,
    isFavorite: true,
    isRead: false,
    progressPercent: 0,
    currentPage: 1
  };
}
