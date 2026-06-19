
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
