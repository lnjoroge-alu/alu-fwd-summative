// state.js
// The data is loaded from the browser (or seed.json) by app.js at the start.

let records = [];

export function getRecords() {
  return records;
}

// Replace the whole list 
export function setRecords(newList) {
  records = newList;
}

// Make the next id, like "bnv_0004", based on the highest id already used.
export function makeId() {
  let max = 0;
  records.forEach(function (book) {
    const number = Number(String(book.id).replace("bnv_", ""));
    if (number > max) {
      max = number;
    }
  });
  return "bnv_" + String(max + 1).padStart(4, "0");
}

// Add a new book
export function addRecord(book) {
  const now = new Date().toISOString();
  book.id = makeId();
  book.createdAt = now;
  book.updatedAt = now;
  if (book.read === undefined) {
    book.read = false;
  }
  records.push(book);
}

// Flip a book between read and unread.
export function toggleRead(id) {
  records.forEach(function (book) {
    if (book.id === id) {
      book.read = !book.read;
      book.updatedAt = new Date().toISOString();
    }
  });
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
