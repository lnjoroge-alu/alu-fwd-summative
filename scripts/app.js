
import {
  checkTitle,
  checkAuthor,
  checkPages,
  checkTag,
  checkDate,
  hasRepeatedWord,
} from "./validators.js";

// ---------- Tabs ----------

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll("main > section");

// Show one section, hide the rest, and highlight the matching tab.
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

// ---------- Form validation ----------

const form = document.getElementById("book-form");
const statusBox = document.getElementById("form-status");

// Put an error message under a field and mark the input as invalid.
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorBox = document.getElementById(inputId + "-error");
  input.setAttribute("aria-invalid", "true");
  errorBox.textContent = message;
}

// Remove the error for a field.
function clearError(inputId) {
  const input = document.getElementById(inputId);
  const errorBox = document.getElementById(inputId + "-error");
  input.setAttribute("aria-invalid", "false");
  errorBox.textContent = "";
}


// Check one field using its check function. Returns true if it is ok.
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
    // Move focus to the first field that has an error.
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  //  the advanced regex: did the title repeat a word?
  const titleValue = document.getElementById("title").value;
  if (hasRepeatedWord(titleValue)) {
    statusBox.textContent = "Looks good. Tip: your title repeats a word.";
  } else {
    statusBox.textContent = "All fields look good!";
  }
});

// When the Cancel/reset button is pressed, clear the errors and the message.
form.addEventListener("reset", function () {
  clearError("title");
  clearError("author");
  clearError("pages");
  clearError("tag");
  clearError("date-added");
  statusBox.textContent = "";
});
