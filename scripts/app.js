
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
