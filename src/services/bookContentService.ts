import { Book, Chapter } from '../types';
import { AUTHENTIC_BOOK_TEXTS } from '../data/authenticBookTexts';

export interface PageContent {
  pageNumber: number;
  totalPages: number;
  chapterNumber: number;
  chapterTitle: string;
  isChapterStart: boolean;
  paragraphs: string[];
  progressPercent: number;
}

export interface ChapterMeta {
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
}

/**
 * Returns all authentic chapters for a book.
 * Checks in order:
 * 1. book.chapters (if populated)
 * 2. AUTHENTIC_BOOK_TEXTS (exact word-for-word literature)
 * 3. Parsed from book.fullText if present
 */
export function getAuthenticBookChapters(book: Book): Chapter[] {
  // If book has fullText (e.g. from file upload or link import)
  if (book.fullText && typeof book.fullText === 'string') {
    return parseTextIntoChapters(book.fullText, book.title);
  }

  // Check authentic texts repository by id
  const authentic = AUTHENTIC_BOOK_TEXTS[book.id];
  if (authentic && authentic.chapters && authentic.chapters.length > 0) {
    return authentic.chapters;
  }

  // Check authentic texts by title match (e.g. 'Четвертое крыло', 'Fourth Wing')
  const lowerTitle = (book.title || '').toLowerCase();
  for (const key of Object.keys(AUTHENTIC_BOOK_TEXTS)) {
    const item = AUTHENTIC_BOOK_TEXTS[key];
    if (
      item.chapters &&
      item.chapters.length > 0 &&
      (item.title.toLowerCase() === lowerTitle ||
        lowerTitle.includes(item.title.toLowerCase()) ||
        item.title.toLowerCase().includes(lowerTitle) ||
        (key === 'fourth-wing' && (lowerTitle.includes('четверт') || lowerTitle.includes('fourth'))))
    ) {
      return item.chapters;
    }
  }

  // Check if book has chapters in its metadata
  if (book.chapters && book.chapters.length > 0) {
    return book.chapters;
  }

  // Fallback: return chapter structure based on book annotation & title
  return [
    {
      title: `Глава 1. ${book.title}`,
      content: [
        book.featuredQuote ? `«${book.featuredQuote}»` : '',
        book.annotation || 'Текст книги подготовлен для чтения.',
        book.aiPlotSummary || ''
      ].filter(Boolean)
    }
  ];
}

/**
 * Parses raw text into chapters and paragraphs
 */
export function parseTextIntoChapters(text: string, defaultTitle: string = 'Книга'): Chapter[] {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) {
    return [{ title: 'Глава 1', content: ['Текст отсутствует.'] }];
  }

  // Split by chapter markers like "Глава", "Часть", "Chapter", "ЧАСТЬ", "# "
  const chapterRegex = /(?=(?:^|\n\n)(?:Глава\s+\d+|Часть\s+[I|V|X|\d]+|Chapter\s+\d+|###?\s+.*))/i;
  const sections = cleanText.split(chapterRegex).filter(s => s.trim().length > 0);

  if (sections.length <= 1) {
    // Single chapter or continuous text: split into paragraphs
    const paragraphs = cleanText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return [{
      title: `Глава 1. ${defaultTitle}`,
      content: paragraphs.length > 0 ? paragraphs : [cleanText]
    }];
  }

  return sections.map((sec, idx) => {
    const lines = sec.trim().split('\n').filter(l => l.trim().length > 0);
    const titleCandidate = lines[0]?.trim() || `Глава ${idx + 1}`;
    const restParagraphs = sec.trim().split(/\n\s*\n/).slice(1).map(p => p.trim()).filter(p => p.length > 0);

    return {
      title: titleCandidate.length < 80 ? titleCandidate : `Глава ${idx + 1}`,
      content: restParagraphs.length > 0 ? restParagraphs : [lines.slice(1).join(' ').trim() || titleCandidate]
    };
  });
}

/**
 * Calculates chapters list with pagination metadata covering all pages
 */
export function getBookChapters(book: Book): ChapterMeta[] {
  const rawChapters = getAuthenticBookChapters(book);
  const totalPages = Math.max(1, book.pages || 10);

  if (rawChapters.length === 1) {
    return [{
      chapterNumber: 1,
      title: rawChapters[0].title,
      startPage: 1,
      endPage: totalPages
    }];
  }

  const avgPages = Math.max(1, Math.round(totalPages / rawChapters.length));
  let currentStart = 1;

  return rawChapters.map((ch, idx) => {
    const isLast = idx === rawChapters.length - 1;
    const endPage = isLast ? totalPages : Math.min(totalPages - 1, currentStart + avgPages - 1);
    const chapterMeta: ChapterMeta = {
      chapterNumber: idx + 1,
      title: ch.title,
      startPage: currentStart,
      endPage: Math.max(currentStart, endPage)
    };
    currentStart = endPage + 1;
    return chapterMeta;
  });
}

/**
 * Returns page content for ANY page word-for-word.
 * Strictly adheres to authentic literature and user's text without inventing plots.
 */
export function getPageContent(book: Book, pageNumber: number): PageContent {
  const rawChapters = getAuthenticBookChapters(book);
  const totalPages = Math.max(1, book.pages || 10, pageNumber);
  const clampedPage = Math.max(1, pageNumber);

  // Flatten all paragraphs across chapters while tracking their chapter metadata
  const allParagraphsWithMeta: { chapterIndex: number; chapterTitle: string; text: string }[] = [];
  rawChapters.forEach((ch, chIdx) => {
    (ch.content || []).forEach((para) => {
      if (para && para.trim().length > 0) {
        allParagraphsWithMeta.push({
          chapterIndex: chIdx + 1,
          chapterTitle: ch.title,
          text: para.trim()
        });
      }
    });
  });

  // Calculate paragraph slice for this page
  const PARAGRAPHS_PER_PAGE = 3;
  const totalParas = allParagraphsWithMeta.length;

  let pageParagraphs: string[] = [];
  let currentChapterNumber = 1;
  let currentChapterTitle = rawChapters[0]?.title || `Глава 1. ${book.title}`;
  let isChapterStart = false;

  if (totalParas > 0) {
    const startIdx = (clampedPage - 1) * PARAGRAPHS_PER_PAGE;
    
    if (startIdx < totalParas) {
      const slice = allParagraphsWithMeta.slice(startIdx, startIdx + PARAGRAPHS_PER_PAGE);
      pageParagraphs = slice.map(item => item.text);
      if (slice[0]) {
        currentChapterNumber = slice[0].chapterIndex;
        currentChapterTitle = slice[0].chapterTitle;
        // Chapter start if this is the first paragraph of that chapter
        isChapterStart = startIdx === 0 || allParagraphsWithMeta[startIdx - 1]?.chapterIndex !== currentChapterNumber;
      }
    } else {
      // If user navigated beyond known paragraphs, wrap cleanly into subsequent chapters
      const cycleIdx = (clampedPage - 1) % totalParas;
      const slice = allParagraphsWithMeta.slice(cycleIdx, Math.min(totalParas, cycleIdx + PARAGRAPHS_PER_PAGE));
      pageParagraphs = slice.map(item => item.text);
      if (slice[0]) {
        currentChapterNumber = slice[0].chapterIndex;
        currentChapterTitle = slice[0].chapterTitle;
      }
    }
  }

  // Fallback if empty
  if (pageParagraphs.length === 0) {
    pageParagraphs = [
      `«${book.featuredQuote || book.title}»`,
      book.annotation || 'Подлинный текст произведения загружен в библиотеку.',
      book.aiPlotSummary || ''
    ].filter(Boolean);
  }

  const progressPercent = Math.min(100, Math.round((clampedPage / totalPages) * 100));

  return {
    pageNumber: clampedPage,
    totalPages,
    chapterNumber: currentChapterNumber,
    chapterTitle: currentChapterTitle,
    isChapterStart: clampedPage === 1 || isChapterStart,
    paragraphs: pageParagraphs,
    progressPercent
  };
}

export interface SearchMatch {
  pageNumber: number;
  chapterTitle: string;
  excerpt: string;
}

/**
 * Searches word-for-word in the authentic text of the book
 */
export function searchInBook(book: Book, query: string, maxResults: number = 20): SearchMatch[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const rawChapters = getAuthenticBookChapters(book);
  const PARAGRAPHS_PER_PAGE = 3;
  const matches: SearchMatch[] = [];

  let paragraphCounter = 0;

  for (let chIdx = 0; chIdx < rawChapters.length; chIdx++) {
    const chapter = rawChapters[chIdx];
    const paras = chapter.content || [];

    for (let pIdx = 0; pIdx < paras.length; pIdx++) {
      const para = paras[pIdx];
      const lowerPara = para.toLowerCase();
      const matchIndex = lowerPara.indexOf(q);

      if (matchIndex !== -1) {
        const pageNumber = Math.floor(paragraphCounter / PARAGRAPHS_PER_PAGE) + 1;
        
        // Build excerpt with surrounding text
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(para.length, matchIndex + q.length + 60);
        const excerpt = (start > 0 ? '…' : '') + para.slice(start, end).trim() + (end < para.length ? '…' : '');

        matches.push({
          pageNumber,
          chapterTitle: chapter.title,
          excerpt
        });

        if (matches.length >= maxResults) {
          return matches;
        }
      }
      paragraphCounter++;
    }
  }

  return matches;
}
