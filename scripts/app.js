
import {
  checkTitle,
  checkAuthor,
  checkPages,
  checkTag,
  checkDate,
  hasRepeatedWord,
} from "./validators.js";
import { getRecords, addRecord, updateRecord, deleteRecord, toggleRead } from "./state.js";
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
function updateStats() {
  renderStats(getRecords(), Number(readingGoalInput.value));
}

readingGoalInput.addEventListener("input", updateStats);

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
    refresh();
    updateStats();
  }
}

function exitEditMode() {
  editingId = null;
  formHeading.textContent = "Add a book";
  saveButton.textContent = "Save book";
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

//  Start 
updateSortIndicators();
refresh();
updateStats();
