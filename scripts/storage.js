
const DATA_KEY = "bnv:data";
const SETTINGS_KEY = "bnv:settings";


// Save the list of books.
export function saveRecords(records) {
  localStorage.setItem(DATA_KEY, JSON.stringify(records));
}


// Load the saved list of books, or null if nothing is saved yet.
export function loadRecords() {
  const text = localStorage.getItem(DATA_KEY);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

// ---- Settings ----

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings() {
  const text = localStorage.getItem(SETTINGS_KEY);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

//  Import validation 


export function validateData(data) {
  if (!Array.isArray(data)) {
    return { ok: false, message: "The file must contain a list of books." };
  }

  for (let i = 0; i < data.length; i++) {
    const book = data[i];
    const position = "Book " + (i + 1);

    if (typeof book !== "object" || book === null) {
      return { ok: false, message: position + " is not a valid book." };
    }
    if (typeof book.title !== "string" || book.title === "") {
      return { ok: false, message: position + " is missing a title." };
    }
    if (typeof book.author !== "string" || book.author === "") {
      return { ok: false, message: position + " is missing an author." };
    }
    if (typeof book.pages !== "number") {
      return { ok: false, message: position + " is missing a page number." };
    }
    if (typeof book.tag !== "string" || book.tag === "") {
      return { ok: false, message: position + " is missing a tag." };
    }
    if (typeof book.dateAdded !== "string" || book.dateAdded === "") {
      return { ok: false, message: position + " is missing a date." };
    }
  }

  return { ok: true };
}

// Fill in any optional fields that an imported book might be missing,
export function normalizeRecord(book) {
  if (book.isbn === undefined) {
    book.isbn = "";
  }
  if (book.notes === undefined) {
    book.notes = "";
  }
  if (book.read === undefined) {
    book.read = false;
  }
  if (book.createdAt === undefined) {
    book.createdAt = new Date().toISOString();
  }
  if (book.updatedAt === undefined) {
    book.updatedAt = book.createdAt;
  }
  return book;
}
