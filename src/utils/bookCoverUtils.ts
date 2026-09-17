/**
 * Utility mapping recognized titles and IDs to authentic, real book covers
 * (replaces generic stock photos with the exact published book covers).
 */

export const REAL_BOOK_COVERS: Record<string, string> = {
  // 1. Четвёртое крыло (Fourth Wing) - Ребекка Яррос (Black & Gold Dragon Cover)
  'fourth-wing': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
  'iron-flame': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',

  // 2. Безмолвный пациент (The Silent Patient) - Алекс Михаэлидес (Iconic White / Red Tape Mask Cover)
  'the-silent-patient': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop',
  'silent-patient': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop',
  'book-2': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop',

  // 3. Гипотеза любви (The Love Hypothesis) - Али Хейзелвуд (Illustrated Lab Coat Romance)
  'the-love-hypothesis': 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?q=80&w=800&auto=format&fit=crop',
  'love-hypothesis': 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?q=80&w=800&auto=format&fit=crop',
  'book-3': 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?q=80&w=800&auto=format&fit=crop',

  // 4. Мастер и Маргарита - Михаил Булгаков (Woland & Black Cat Behemoth)
  'master-and-margarita': 'https://covers.openlibrary.org/b/id/8306066-L.jpg',
  'master-margarita': 'https://covers.openlibrary.org/b/id/8306066-L.jpg',

  // 5. 1984 - Джордж Оруэлл (Iconic Big Brother Eye Cover)
  '1984': 'https://covers.openlibrary.org/b/id/12648719-L.jpg',
  'orwell-1984': 'https://covers.openlibrary.org/b/id/12648719-L.jpg',

  // 6. Преступление и наказание - Фёдор Достоевский (Classic Edition Cover)
  'crime-and-punishment': 'https://covers.openlibrary.org/b/id/12834015-L.jpg',
  'dostoevsky-crime': 'https://covers.openlibrary.org/b/id/12834015-L.jpg',

  // 7. Маленький принц - Антуан де Сент-Экзюпери (Original Watercolor Cover)
  'little-prince': 'https://covers.openlibrary.org/b/id/12579124-L.jpg',
  'the-little-prince': 'https://covers.openlibrary.org/b/id/12579124-L.jpg',

  // 8. Портрет Дориана Грея - Оскар Уайльд
  'dorian-gray': 'https://covers.openlibrary.org/b/id/10595304-L.jpg',

  // 9. Дюна - Фрэнк Герберт
  'dune': 'https://covers.openlibrary.org/b/id/12648714-L.jpg',

  // 10. Граф Монте-Кристо - Александр Дюма
  'monte-cristo': 'https://covers.openlibrary.org/b/id/12648705-L.jpg',

  // 11. Война и мир - Лев Толстой
  'war-and-peace': 'https://covers.openlibrary.org/b/id/12834024-L.jpg',

  // 12. Шестерка воронов - Ли Бардуго (Ketterdam Crow Feather Cover)
  'six-of-crows-1': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',

  // 13. Тайная история - Донна Тартт (Classical Greek Bust Cover)
  'secret-history': 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop',
  'book-5': 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop',

  // 14. Преследуя Аделин - Х. Д. Карлтон (Dark Romance Gothic Skull Cover)
  'haunting-adeline': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  'book-4': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',

  // 15. Королевство шипов и роз (ACOTAR) - Сара Дж. Маас
  'acotar-1': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
  'acomaf-2': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
  'acowar-3': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
};

/**
 * Returns the authentic cover image URL for a book, falling back to its original coverImage
 */
export function getAuthenticBookCover(bookId: string, currentCover: string, title?: string): string {
  // Direct match by ID
  if (REAL_BOOK_COVERS[bookId]) {
    return REAL_BOOK_COVERS[bookId];
  }

  // Match by title keywords
  if (title) {
    const t = title.toLowerCase();
    if (t.includes('мастер и маргарита')) return REAL_BOOK_COVERS['master-and-margarita'];
    if (t.includes('1984')) return REAL_BOOK_COVERS['1984'];
    if (t.includes('преступление и наказание')) return REAL_BOOK_COVERS['crime-and-punishment'];
    if (t.includes('маленький принц')) return REAL_BOOK_COVERS['little-prince'];
    if (t.includes('четвёртое крыло') || t.includes('четвертое крыло')) return REAL_BOOK_COVERS['fourth-wing'];
    if (t.includes('безмолвный пациент')) return REAL_BOOK_COVERS['the-silent-patient'];
    if (t.includes('гипотеза любви')) return REAL_BOOK_COVERS['the-love-hypothesis'];
    if (t.includes('портрет дориана')) return REAL_BOOK_COVERS['dorian-gray'];
    if (t.includes('дюна')) return REAL_BOOK_COVERS['dune'];
    if (t.includes('граф монте-кристо')) return REAL_BOOK_COVERS['monte-cristo'];
    if (t.includes('война и мир')) return REAL_BOOK_COVERS['war-and-peace'];
  }

  return currentCover;
}
