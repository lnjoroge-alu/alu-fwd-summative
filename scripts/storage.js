
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
