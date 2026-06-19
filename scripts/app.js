
const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll("main > section");

function showSection(targetId) {
  // Go through every section: show the one we want, hide the others.
  sections.forEach(function (section) {
    if (section.id === targetId) {
      section.hidden = false;
    } else {
      section.hidden = true;
    }
  });

  // Mark the matching tab as the current one (for the colour and screen readers).
  tabs.forEach(function (tab) {
    if (tab.dataset.target === targetId) {
      tab.setAttribute("aria-current", "true");
    } else {
      tab.setAttribute("aria-current", "false");
    }
  });
}

// When a tab is clicked, show its section.
tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    showSection(tab.dataset.target);
  });
});
