// Builds the rows of the records table on the page.

import { highlight } from "./search.js";

const table = document.getElementById("records-table");
const tableBody = document.getElementById("records-body");
const emptyMessage = document.getElementById("empty-message");


export function renderRecords(list, re) {
  tableBody.innerHTML = ""; // remove the old rows first

  if (list.length === 0) {
    table.hidden = true;
    emptyMessage.hidden = false;
    return;
  }

  table.hidden = false;
  emptyMessage.hidden = true;

  // Build one row per book.
  list.forEach(function (book) {
    const row = document.createElement("tr");
    row.innerHTML =
      cell("Title", book.title, re) +
      cell("Author", book.author, re) +
      cell("Pages", String(book.pages), re) +
      cell("Tag", book.tag, re) +
      cell("Date", book.dateAdded, re);
    tableBody.appendChild(row);
  });
}

// Build one table cell. The data-label is used by the CSS to make cards on mobile.
function cell(label, value, re) {
  return '<td data-label="' + label + '">' + highlight(value, re) + "</td>";
}

//  Dashboard stats 

// Update all the dashboard numbers, the chart, and the reading-goal message.
export function renderStats(records, goal) {
  // total books
  document.getElementById("stat-total").textContent = records.length;

  // total pages 
  let totalPages = 0;
  records.forEach(function (book) {
    totalPages = totalPages + book.pages;
  });
  document.getElementById("stat-pages").textContent = totalPages;

  // top tag
  document.getElementById("stat-top-tag").textContent = topTag(records);

  // last 7 days chart
  renderChart(records);

  // reading goal message
  renderGoal(totalPages, goal);
}

// Find the tag that is used the most.
function topTag(records) {
  if (records.length === 0) {
    return "-";
  }

  // count how many times each tag appears
  const counts = {};
  records.forEach(function (book) {
    if (counts[book.tag] === undefined) {
      counts[book.tag] = 0;
    }
    counts[book.tag] = counts[book.tag] + 1;
  });

  // pick the tag with the highest count
  let best = "-";
  let bestCount = 0;
  for (const tag in counts) {
    if (counts[tag] > bestCount) {
      bestCount = counts[tag];
      best = tag;
    }
  }
  return best;
}

// Draw one bar for each of the last 7 days, sized by how many books were added.
function renderChart(records) {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  const days = lastSevenDays();

  // count books added on each of those days
  const counts = days.map(function (day) {
    let count = 0;
    records.forEach(function (book) {
      if (book.dateAdded === day.dateStr) {
        count = count + 1;
      }
    });
    return count;
  });

  // the tallest bar is the biggest count (at least 1, so we never divide by 0)
  let max = 1;
  counts.forEach(function (count) {
    if (count > max) {
      max = count;
    }
  });

  days.forEach(function (day, i) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (counts[i] / max) * 100 + "%";
    bar.title = day.dateStr + ": " + counts[i] + " book(s)";
    chart.appendChild(bar);
  });
}

// Build a list of the last 7 days (oldest first), each as a YYYY-MM-DD string.
function lastSevenDays() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ dateStr: toDateString(d) });
  }
  return days;
}

// Turn a Date into a "YYYY-MM-DD" string.
function toDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Show how far the reader is from their goal. 
function renderGoal(totalPages, goal) {
  const goalMessage = document.getElementById("goal-message");

  if (!goal || goal <= 0) {
    goalMessage.setAttribute("aria-live", "polite");
    goalMessage.textContent = "Set a reading goal in Settings.";
    return;
  }

  if (totalPages <= goal) {
    const left = goal - totalPages;
    goalMessage.setAttribute("aria-live", "polite");
    goalMessage.textContent = left + " pages to go to reach your goal of " + goal + ".";
  } else {
    const over = totalPages - goal;
    goalMessage.setAttribute("aria-live", "assertive");
    goalMessage.textContent = "You are " + over + " pages over your goal of " + goal + "!";
  }
}
