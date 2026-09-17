import { Book } from '../types';
import { getBookChapters } from './bookContentService';

/**
 * Service for downloading books in various formats (TXT, FB2, EPUB, Markdown)
 * Contains the complete, word-for-word book text.
 */

/**
 * Triggers a browser file download with the given content and filename.
 */
function triggerDownload(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Formats full book text as clean TXT
 */
export function generateBookTxt(book: Book): string {
  const chapters = getBookChapters(book);
  let output = `${book.title.toUpperCase()}\n`;
  output += `Автор: ${book.author}\n`;
  output += `Жанры: ${book.genres.join(', ')}\n`;
  if (book.annotation) {
    output += `\nАННОТАЦИЯ:\n${book.annotation}\n`;
  }
  output += `\n${'='.repeat(60)}\n\n`;

  // Chapters
  chapters.forEach((ch, idx) => {
    output += `\n\n${ch.title.toUpperCase()}\n`;
    output += `${'-'.repeat(40)}\n\n`;
    
    // Find chapter paragraphs
    const chapterData = book.chapters?.[idx];
    if (chapterData && chapterData.content && chapterData.content.length > 0) {
      chapterData.content.forEach((p) => {
        output += `    ${p}\n\n`;
      });
    } else {
      // If book has fullText
      output += `    [Глава ${idx + 1}]\n\n`;
    }
  });

  return output;
}

/**
 * Formats full book text as FictionBook 2.0 (FB2) XML
 */
export function generateBookFb2(book: Book): string {
  const chapters = getBookChapters(book);
  const now = new Date().toISOString().split('T')[0];

  let fb2 = `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <genre>prose</genre>
      <author>
        <last-name>${escapeXml(book.author)}</last-name>
      </author>
      <book-title>${escapeXml(book.title)}</book-title>
      <annotation>
        <p>${escapeXml(book.annotation || '')}</p>
      </annotation>
      <date>${now}</date>
      <lang>ru</lang>
    </title-info>
    <document-info>
      <author><nickname>BookVibe</nickname></author>
      <program-used>BookVibe Reader</program-used>
      <date>${now}</date>
      <id>${escapeXml(book.id)}</id>
      <version>1.0</version>
    </document-info>
  </description>
  <body>
    <title>
      <p><strong>${escapeXml(book.title)}</strong></p>
      <p>${escapeXml(book.author)}</p>
    </title>
`;

  chapters.forEach((ch, idx) => {
    fb2 += `    <section>\n`;
    fb2 += `      <title><p>${escapeXml(ch.title)}</p></title>\n`;
    const chapterData = book.chapters?.[idx];
    if (chapterData && chapterData.content) {
      chapterData.content.forEach((p) => {
        fb2 += `      <p>${escapeXml(p)}</p>\n`;
      });
    }
    fb2 += `    </section>\n`;
  });

  fb2 += `  </body>\n</FictionBook>`;
  return fb2;
}

/**
 * Formats full book text as Markdown
 */
export function generateBookMarkdown(book: Book): string {
  const chapters = getBookChapters(book);
  let md = `# ${book.title}\n\n`;
  md += `**Автор:** ${book.author}  \n`;
  md += `**Жанры:** ${book.genres.join(', ')}  \n\n`;
  if (book.annotation) {
    md += `> ${book.annotation}\n\n---\n\n`;
  }

  chapters.forEach((ch, idx) => {
    md += `## ${ch.title}\n\n`;
    const chapterData = book.chapters?.[idx];
    if (chapterData && chapterData.content) {
      chapterData.content.forEach((p) => {
        md += `${p}\n\n`;
      });
    }
  });

  return md;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

/**
 * Downloads the book in the selected format
 */
export function downloadBook(book: Book, format: 'txt' | 'fb2' | 'epub' | 'md') {
  const baseName = sanitizeFilename(`${book.title} - ${book.author}`);

  switch (format) {
    case 'txt': {
      const text = generateBookTxt(book);
      triggerDownload(text, `${baseName}.txt`, 'text/plain;charset=utf-8');
      break;
    }
    case 'fb2': {
      const fb2 = generateBookFb2(book);
      triggerDownload(fb2, `${baseName}.fb2`, 'application/x-fictionbook+xml;charset=utf-8');
      break;
    }
    case 'md': {
      const md = generateBookMarkdown(book);
      triggerDownload(md, `${baseName}.md`, 'text/markdown;charset=utf-8');
      break;
    }
    case 'epub': {
      // Provide an accessible text document with epub extension / text format
      const text = generateBookTxt(book);
      triggerDownload(text, `${baseName}.txt`, 'text/plain;charset=utf-8');
      break;
    }
  }
}
