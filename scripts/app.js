
import {
  checkTitle,
  checkAuthor,
  checkPages,
  checkTag,
  checkDate,
  hasRepeatedWord,
} from "./validators.js";
import { getRecords, addRecord } from "./state.js";
import { compileRegex, recordMatches, sortRecords } from "./search.js";
import { renderRecords } from "./ui.js";

// ---------- Tabs ----------

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

// ---------- Search and sort settings ----------
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

// Click a column header -> sort by it. Click again -> flip the direction.
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

// ---------- Form validation and adding a book ----------

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
  addRecord(book);
  form.reset(); // clears the inputs (and the reset handler clears any errors)

  if (hasRepeatedWord(book.title)) {
    statusBox.textContent = "Book added. Tip: your title repeats a word.";
  } else {
    statusBox.textContent = "Book added.";
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
});

// ---------- Start ----------
updateSortIndicators();
refresh();
