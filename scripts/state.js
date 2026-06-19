

let records = [
  {
    id: "bnv_0001",
    title: "Clean Code",
    author: "Robert Martin",
    pages: 464,
    tag: "Programming",
    isbn: "978-0132350884",
    notes: "",
    dateAdded: "2025-09-20",
    createdAt: "2025-09-20T09:00:00.000Z",
    updatedAt: "2025-09-20T09:00:00.000Z",
  },
  {
    id: "bnv_0002",
    title: "Atomic Habits",
    author: "James Clear",
    pages: 320,
    tag: "Self Help",
    isbn: "",
    notes: "",
    dateAdded: "2025-09-25",
    createdAt: "2025-09-25T09:00:00.000Z",
    updatedAt: "2025-09-25T09:00:00.000Z",
  },
  {
    id: "bnv_0003",
    title: "The Hobbit",
    author: "John Tolkien",
    pages: 310,
    tag: "Fiction",
    isbn: "",
    notes: "",
    dateAdded: "2025-09-28",
    createdAt: "2025-09-28T09:00:00.000Z",
    updatedAt: "2025-09-28T09:00:00.000Z",
  },
];

// Counts up so each new book gets a different id (sample data uses up to 3).
let lastNumber = records.length;

// Give back the whole list.
export function getRecords() {
  return records;
}

// Make the next id, like "bnv_0004".
export function makeId() {
  lastNumber = lastNumber + 1;
  return "bnv_" + String(lastNumber).padStart(4, "0");
}

// Add a new book. It fills in the id and the timestamps.
export function addRecord(book) {
  const now = new Date().toISOString();
  book.id = makeId();
  book.createdAt = now;
  book.updatedAt = now;
  records.push(book);
}

// Change an existing book by its id.
export function updateRecord(id, changes) {
  records.forEach(function (book) {
    if (book.id === id) {
      book.title = changes.title;
      book.author = changes.author;
      book.pages = changes.pages;
      book.tag = changes.tag;
      book.isbn = changes.isbn;
      book.notes = changes.notes;
      book.dateAdded = changes.dateAdded;
      book.updatedAt = new Date().toISOString();
    }
  });
}

// Remove a book by its id.
export function deleteRecord(id) {
  records = records.filter(function (book) {
    return book.id !== id;
  });
}
