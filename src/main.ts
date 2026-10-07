import './styles.css';
import { Book, formatBook, Catalog } from './task1-types';
import { addBook, removeBook } from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from './task4-integration';
import { filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
// Начальные данные. Если в localStorage есть сохранённый каталог,
// он заменит эти данные (см. ниже).
let catalog: Catalog = {
  '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
};

// Задание 1: если в localStorage есть сохранённые данные — используем их
const saved = localStorage.getItem('catalog');
if (saved) {
  catalog = JSON.parse(saved) as Catalog;
}

// ============================================================
// СОХРАНЕНИЕ В localStorage
// ============================================================
// Сохраняет текущий catalog в localStorage под ключом 'catalog'.
// Вызывается после добавления и после удаления книги.
function saveCatalog(): void {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}

// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
// Задание 2: элементы поиска и сортировки
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// ============================================================
// РЕНДЕР КАРТОЧЕК
// ============================================================
function renderBooks(books: Book[]) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    // Задание 3 (бонус): класс fade-in — плавное появление карточки
    card.className = 'book-card fade-in';

    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);

    const authorsEl = document.createElement('p');
    authorsEl.textContent = `Авторы: ${book.authors.join(', ')}`;

    card.append(titleEl, authorsEl);

    if (book.year !== undefined) {
      const yearEl = document.createElement('p');
      yearEl.textContent = `Год: ${book.year}`;
      card.append(yearEl);
    }
    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    // ============================================================
    // ЗАДАНИЕ 0: КНОПКА «УДАЛИТЬ»
    // ============================================================
    // Кнопка создаётся для каждой карточки отдельно,
    // чтобы обработчик знал, какую именно книгу удалять (замыкание на book.id).
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      renderBooks(Object.values(catalog));
    });
    card.append(deleteBtn);

    bookList.append(card);
  });
}

// ============================================================
// ПЕРВИЧНАЯ ОТРИСОВКА
// ============================================================
renderBooks(Object.values(catalog));

// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try {
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);
    // Задание 1: сохраняем каталог в localStorage после добавления
    saveCatalog();
    form.reset();
    renderBooks(Object.values(catalog));
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.textContent = error.message;
    }
  }
});

// ============================================================
// ФИЛЬТРЫ, ПОИСК, СОРТИРОВКА
// ============================================================
// Единая функция обновления списка: собирает фильтры,
// применяет их, потом сортирует и рендерит.
function updateList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }
  // Задание 2: фильтр по названию
  if (searchInput.value.trim()) {
    filters.push(filterByTitle(searchInput.value.trim()));
  }

  const allBooks = Object.values(catalog);
  const filteredBooks = applyFilters(allBooks, filters);
  // Задание 2: сортировка после фильтрации
  const sorted = sortBooks(filteredBooks, sortBySelect.value as "year" | "rating");

  renderBooks(sorted);
}

filterBtn.addEventListener('click', updateList);
searchInput.addEventListener('input', updateList);
sortBySelect.addEventListener('change', updateList);