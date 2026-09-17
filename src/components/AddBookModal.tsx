import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  FileText, 
  BookOpen, 
  Check, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Book, AppTheme, ALL_GENRES, BookGenre } from '../types';
import { 
  parseFb2, 
  parsePlainText, 
  fetchBookFromUrl, 
  createBookFromParsed, 
  ParsedBookResult,
  generateCoverSvg 
} from '../services/bookImportService';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (newBook: Book) => void;
  theme: AppTheme;
  accentColor: string;
}

type TabMode = 'file' | 'link' | 'paste';

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onBookAdded,
  theme,
  accentColor,
}) => {
  const [tab, setTab] = useState<TabMode>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields / Parsed Data
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<BookGenre>('Драма');
  const [coverUrl, setCoverUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedBookResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isBeige = theme === 'beige';

  const modalBg = isDark ? 'bg-[#181920] border-[#2A2D3A]' : isBeige ? 'bg-[#FBF9F4] border-[#E2DAC6]' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : isBeige ? 'text-[#2B2621]' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : isBeige ? 'text-[#756A5B]' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#20222C] border-[#2F3242] text-slate-100' : isBeige ? 'bg-[#EFEAD9] border-[#DFD8C4] text-[#2B2621]' : 'bg-slate-50 border-slate-200 text-slate-900';

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let result: ParsedBookResult;

      if (extension === 'fb2') {
        const text = await file.text();
        result = parseFb2(text, file.name);
      } else {
        const text = await file.text();
        result = parsePlainText(text, file.name);
      }

      setParsedPreview(result);
      setTitle(result.title);
      setAuthor(result.author);
      setCoverUrl(result.coverImage);
      setSuccessMessage(`Файл «${file.name}» успешно обработан (${result.pages} стр., ${result.chapters.length} глав)`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка чтения файла. Поддерживаются форматы .fb2, .txt, .md');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) {
      setErrorMessage('Пожалуйста, введите корректную ссылку на файл');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchBookFromUrl(urlInput.trim());
      setParsedPreview(result);
      setTitle(result.title);
      setAuthor(result.author);
      setCoverUrl(result.coverImage);
      setSuccessMessage(`Книга успешно загружена по ссылке (${result.pages} стр.)`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось загрузить книгу по ссылке');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBook = () => {
    setErrorMessage(null);

    let finalParsed: ParsedBookResult;

    if (parsedPreview) {
      finalParsed = {
        ...parsedPreview,
        title: title.trim() || parsedPreview.title,
        author: author.trim() || parsedPreview.author,
        genres: [genre],
      };
    } else {
      // Manual text paste
      if (!title.trim()) {
        setErrorMessage('Укажите название книги');
        return;
      }
      if (!pastedText.trim()) {
        setErrorMessage('Вставьте текст произведения');
        return;
      }

      const generatedCover = coverUrl || generateCoverSvg(title, author || 'Автор', genre);
      finalParsed = parsePlainText(pastedText, `${title}.txt`);
      finalParsed.title = title.trim();
      finalParsed.author = author.trim() || 'Автор не указан';
      finalParsed.genres = [genre];
      finalParsed.coverImage = generatedCover;
    }

    const newBook = createBookFromParsed(finalParsed, coverUrl || undefined);
    onBookAdded(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>Добавить книгу</h3>
              <p className={`text-xs ${textSecondary}`}>Загружайте свои книги или добавляйте по ссылке без ограничений</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-inherit px-6 pt-2 bg-black/[0.02]">
          <button
            onClick={() => { setTab('file'); setErrorMessage(null); }}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
              tab === 'file' 
                ? 'border-current text-amber-600 dark:text-amber-400 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            style={{ borderColor: tab === 'file' ? accentColor : 'transparent' }}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Загрузить файл</span>
          </button>
          <button
            onClick={() => { setTab('link'); setErrorMessage(null); }}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
              tab === 'link' 
                ? 'border-current text-amber-600 dark:text-amber-400 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            style={{ borderColor: tab === 'link' ? accentColor : 'transparent' }}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Добавить по ссылке</span>
          </button>
          <button
            onClick={() => { setTab('paste'); setErrorMessage(null); }}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
              tab === 'paste' 
                ? 'border-current text-amber-600 dark:text-amber-400 font-semibold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            style={{ borderColor: tab === 'paste' ? accentColor : 'transparent' }}
          >
            <FileText className="w-4 h-4" />
            <span>Вставить текст</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
              <Check className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {tab === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]' 
                    : isDark ? 'border-slate-700 hover:border-slate-500 bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50/70'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
                  accept=".fb2,.txt,.md,.text" 
                  className="hidden" 
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className={`font-semibold text-base ${textPrimary}`}>
                      Перетащите файл книги сюда или нажмите для выбора
                    </p>
                    <p className={`text-xs mt-1 ${textSecondary}`}>
                      Поддерживаются форматы: <strong>.FB2</strong> (с обложкой и главами), <strong>.TXT</strong>, <strong>.MD</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT BY URL */}
          {tab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${textSecondary}`}>
                  Прямая ссылка на книгу (.txt или .fb2)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/books/my_book.txt"
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}
                  />
                  <button
                    onClick={handleUrlFetch}
                    disabled={isLoading || !urlInput.trim()}
                    className="px-5 py-2.5 rounded-xl text-white font-medium text-sm flex items-center space-x-2 disabled:opacity-50 transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    <span>Загрузить</span>
                  </button>
                </div>
                <p className={`text-xs mt-2 ${textSecondary}`}>
                  Совет: вы можете указать ссылку на сырой текст с GitHub, Project Gutenberg или прямого хранилища.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE TEXT */}
          {tab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${textSecondary}`}>
                  Полный текст произведения слово в слово
                </label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Вставьте сюда текст книги, главы или рассказа. Все абзацы будут сохранены с точной нумерацией страниц..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}
                />
              </div>
            </div>
          )}

          {/* EDIT METADATA & PREVIEW (shown once parsed or when pasting) */}
          {(parsedPreview || tab === 'paste') && (
            <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Параметры и обложка книги</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cover Preview & Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-40 rounded-lg overflow-hidden border shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Обложка" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className={`mt-2 text-xs font-medium flex items-center space-x-1 ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Сменить обложку</span>
                  </button>
                </div>

                {/* Title, Author, Genre Inputs */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>Название книги *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Название книги"
                      className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>Автор</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Имя и фамилия автора"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>Жанр</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value as BookGenre)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${inputBg}`}
                    >
                      {ALL_GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-inherit bg-black/[0.02]">
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={handleSaveBook}
            disabled={!parsedPreview && !pastedText.trim()}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center space-x-2 disabled:opacity-50 transition-transform active:scale-95 shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            <Check className="w-4 h-4" />
            <span>Добавить в библиотеку</span>
          </button>
        </div>
      </div>
    </div>
  );
};
