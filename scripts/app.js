
import {
  checkTitle,
  checkAuthor,
  checkPages,
  checkTag,
  checkDate,
  hasRepeatedWord,
} from "./validators.js";
import {
  getRecords,
  setRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  toggleRead,
} from "./state.js";
import {
  saveRecords,
  loadRecords,
  saveSettings,
  loadSettings,
  validateData,
  normalizeRecord,
} from "./storage.js";
import { compileRegex, recordMatches, sortRecords } from "./search.js";
import { renderRecords, renderStats } from "./ui.js";

//  Tabs 

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll("main > section");

function showSection(targetId) {
  sections.forEach(function (section) {
    if (section.id === targetId) {
      section.hidden = false;
    } else {
      section.hidden = true;
    }
  });

  tabs.forEach(function (tab) {
    if (tab.dataset.target === targetId) {
      tab.setAttribute("aria-current", "true");
    } else {
      tab.setAttribute("aria-current", "false");
    }
  });
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    showSection(tab.dataset.target);
  });
});

//  Search and sort settings 
// These remember what the user has chosen, and refresh() redraws the list.

let sortKey = "dateAdded";
let sortDirection = "desc"; // newest first to start
let searchText = "";
let ignoreCase = true;

const searchInput = document.getElementById("search-input");
const ignoreCaseBox = document.getElementById("ignore-case");
const searchMessage = document.getElementById("search-msg");
const sortButtons = document.querySelectorAll(".sort-btn");


// Redraw the records: search, then sort, then show.
function refresh() {
  const re = compileRegex(searchText, ignoreCase);

  // If the user typed something but it is not a valid pattern, tell them.
  if (searchText !== "" && re === null) {
    searchMessage.textContent = "That search pattern is not valid.";
  } else {
    searchMessage.textContent = "";
  }

  // search
  let list = getRecords().filter(function (book) {
    return recordMatches(book, re);
  });

  // sort
  list = sortRecords(list, sortKey, sortDirection);

  // show (re is passed so matches can be highlighted)
  renderRecords(list, re);
}

// Type in the search box -> redraw as you type.
searchInput.addEventListener("input", function () {
  searchText = searchInput.value;
  refresh();
});

// Tick/untick "Ignore case" -> redraw.
ignoreCaseBox.addEventListener("change", function () {
  ignoreCase = ignoreCaseBox.checked;
  refresh();
});

sortButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const key = button.dataset.key;
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
    updateSortIndicators();
    refresh();
  });
});

// Set aria-sort on the header that is being sorted (and clear the others).
function updateSortIndicators() {
  sortButtons.forEach(function (button) {
    const header = button.parentElement;
    if (button.dataset.key === sortKey) {
      header.setAttribute("aria-sort", sortDirection === "asc" ? "ascending" : "descending");
    } else {
      header.setAttribute("aria-sort", "none");
    }
  });
}

//  Dashboard stats 

const readingGoalInput = document.getElementById("reading-goal");

// Read the goal number from Settings and redraw the dashboard.
const readingSpeedInput = document.getElementById("reading-speed");
const tagsListInput = document.getElementById("tags-list");
const tagOptions = document.getElementById("tag-options");

// Read the goal and speed from Settings and redraw the dashboard.
function updateStats() {
  const goal = Number(readingGoalInput.value);
  const speed = Number(readingSpeedInput.value);
  renderStats(getRecords(), goal, speed);
}

// Save the settings and redraw anything that depends on them.
function onSettingsChange() {
  saveSettings({
    goal: readingGoalInput.value,
    speed: readingSpeedInput.value,
    tags: tagsListInput.value,
  });
  fillTagOptions();
  updateStats();
}

readingGoalInput.addEventListener("input", onSettingsChange);
readingSpeedInput.addEventListener("input", onSettingsChange);
tagsListInput.addEventListener("input", onSettingsChange);

function fillTagOptions() {
  const tags = tagsListInput.value.split(",");
  tagOptions.innerHTML = "";
  tags.forEach(function (tag) {
    const trimmed = tag.trim();
    if (trimmed !== "") {
      const option = document.createElement("option");
      option.value = trimmed;
      tagOptions.appendChild(option);
    }
  });
}

//  Form validation and adding a book 

const form = document.getElementById("book-form");
const statusBox = document.getElementById("form-status");

function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorBox = document.getElementById(inputId + "-error");
  input.setAttribute("aria-invalid", "true");
  errorBox.textContent = message;
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const errorBox = document.getElementById(inputId + "-error");
  input.setAttribute("aria-invalid", "false");
  errorBox.textContent = "";
}

function validateField(inputId, checkFunction) {
  const value = document.getElementById(inputId).value;
  const result = checkFunction(value);

  if (result.ok) {
    clearError(inputId);
    return true;
  } else {
    showError(inputId, result.message);
    return false;
  }
}

//  Edit and delete a book 

let editingId = null; // null = adding a new book; an id = editing that book
const recordsBody = document.getElementById("records-body");
const formHeading = document.getElementById("add-edit-heading");
const saveButton = document.getElementById("save-btn");


recordsBody.addEventListener("click", function (event) {
  const button = event.target;
  if (button.classList.contains("read-btn")) {
    toggleRead(button.dataset.id);
    saveRecords(getRecords());
    refresh();
    updateStats();
  } else if (button.classList.contains("edit-btn")) {
    startEdit(button.dataset.id);
  } else if (button.classList.contains("delete-btn")) {
    confirmDelete(button.dataset.id);
  }
});

// Put a book's details into the form so the user can change them.
function startEdit(id) {
  const book = getRecords().find(function (b) {
    return b.id === id;
  });
  if (!book) {
    return;
  }

  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("pages").value = book.pages;
  document.getElementById("tag").value = book.tag;
  document.getElementById("date-added").value = book.dateAdded;
  document.getElementById("isbn").value = book.isbn;
  document.getElementById("notes").value = book.notes;

  editingId = id;
  formHeading.textContent = "Edit book";
  saveButton.textContent = "Save changes";

  showSection("add-edit");
  document.getElementById("title").focus();
}

function confirmDelete(id) {
  const sure = window.confirm("Delete this book?");
  if (sure) {
    deleteRecord(id);
    saveRecords(getRecords());
    refresh();
    updateStats();
    focusRecordsHeading(); // keep focus sensible after the row is gone
  }
}

function exitEditMode() {
  editingId = null;
  formHeading.textContent = "Add a book";
  saveButton.textContent = "Save book";
}

// Put keyboard focus on the Records heading. Used after adding or deleting,
function focusRecordsHeading() {
  const heading = document.getElementById("records-heading");
  heading.setAttribute("tabindex", "-1");
  heading.focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  // Check every required field. Each line runs so all errors show at once.
  const titleOk = validateField("title", checkTitle);
  const authorOk = validateField("author", checkAuthor);
  const pagesOk = validateField("pages", checkPages);
  const tagOk = validateField("tag", checkTag);
  const dateOk = validateField("date-added", checkDate);

  const allOk = titleOk && authorOk && pagesOk && tagOk && dateOk;

  if (!allOk) {
    statusBox.textContent = "Please fix the highlighted fields.";
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  // All valid: build the book and add it to the list.
  const book = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    pages: Number(document.getElementById("pages").value),
    tag: document.getElementById("tag").value,
    isbn: document.getElementById("isbn").value,
    notes: document.getElementById("notes").value,
    dateAdded: document.getElementById("date-added").value,
  };
  // Remember if we were editing before reset() clears editingId.
  const editing = editingId;
  if (editing) {
    updateRecord(editing, book);
  } else {
    addRecord(book);
  }
  saveRecords(getRecords());

  form.reset(); // clears the inputs (and the reset handler exits edit mode)
  updateStats(); // the change affects the totals

  const action = editing ? "updated" : "added";
  if (hasRepeatedWord(book.title)) {
    statusBox.textContent = "Book " + action + ". Tip: your title repeats a word.";
  } else {
    statusBox.textContent = "Book " + action + ".";
  }

  refresh();
  showSection("records");
  focusRecordsHeading(); // move focus to the list after adding 
});

// Cancel/reset clears the errors and the message.
form.addEventListener("reset", function () {
  clearError("title");
  clearError("author");
  clearError("pages");
  clearError("tag");
  clearError("date-added");
  statusBox.textContent = "";
  exitEditMode(); // Cancel also leaves edit mode
});

//  Import / Export 

const exportButton = document.getElementById("export-btn");
const importButton = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const settingsMessage = document.getElementById("settings-msg");

// Export: download all the books as a JSON file.
exportButton.addEventListener("click", function () {
  const text = JSON.stringify(getRecords(), null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "books.json";
  link.click();
  URL.revokeObjectURL(url);
  settingsMessage.textContent = "Exported " + getRecords().length + " books.";
});

// Import: clicking the button opens the file picker.
importButton.addEventListener("click", function () {
  importFile.click();
});

// When a file is chosen, read it, check it, then load it.
importFile.addEventListener("change", function () {
  const file = importFile.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (error) {
      settingsMessage.textContent = "That file is not valid JSON.";
      return;
    }

    // Check the shape before replacing anything.
    const check = validateData(data);
    if (!check.ok) {
      settingsMessage.textContent = check.message;
      return;
    }

    data.forEach(normalizeRecord);
    setRecords(data);
    saveRecords(getRecords());
    refresh();
    updateStats();
    settingsMessage.textContent = "Imported " + data.length + " books.";
  };
  reader.readAsText(file);
  importFile.value = ""; // reset so the same file can be chosen again
});

// ---------- Start ----------

// Load the saved books, or the seed file the first time the app is opened.
async function start() {
  const saved = loadRecords();
  if (saved) {
    setRecords(saved);
  } else {
    setRecords(await loadSeed());
    saveRecords(getRecords());
  }

  loadSavedSettings();
  fillTagOptions();
  updateSortIndicators();
  refresh();
  updateStats();
}

// Get the starter books from seed.json (empty list if it cannot be loaded).
async function loadSeed() {
  try {
    const response = await fetch("seed.json");
    return await response.json();
  } catch (error) {
    return [];
  }
}

// Put any saved settings back into the Settings inputs.
function loadSavedSettings() {
  const settings = loadSettings();
  if (!settings) {
    return;
  }
  if (settings.goal !== undefined) {
    readingGoalInput.value = settings.goal;
  }
  if (settings.speed !== undefined) {
    readingSpeedInput.value = settings.speed;
  }
  if (settings.tags !== undefined) {
    tagsListInput.value = settings.tags;
  }
}

start();
