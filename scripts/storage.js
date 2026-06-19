
const DATA_KEY = "bnv:data";
const SETTINGS_KEY = "bnv:settings";


// Save the list of books.
export function saveRecords(records) {
  localStorage.setItem(DATA_KEY, JSON.stringify(records));
}
