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
    if (book.read) {
      row.className = "is-read";
    }
    row.innerHTML =
      cell("Title", book.title, re) +
      cell("Author", book.author, re) +
      cell("Pages", String(book.pages), re) +
      tagCell(book.tag, re) +
      cell("Date", book.dateAdded, re) +
      cell("Notes", book.notes, re) +
      actionsCell(book);
    tableBody.appendChild(row);
  });
}

// Build one table cell. The data-label is what the CSS
function cell(label, value, re) {
  return '<td data-label="' + label + '">' + highlight(value, re) + "</td>";
}

// tag shown as a small pill
function tagCell(value, re) {
  return '<td data-label="Tag"><span class="chip">' + highlight(value, re) + "</span></td>";
}

// Build the cell with the Edit and Delete buttons. The id is stored on each
// button so the click handler knows which book to act on.
function actionsCell(book) {
  const readLabel = book.read ? "Mark unread" : "Mark read";
  return (
    '<td data-label="Actions">' +
    '<button type="button" class="row-btn read-btn" data-id="' + book.id + '">' + readLabel + "</button> " +
    '<button type="button" class="row-btn edit-btn" data-id="' + book.id + '">Edit</button> ' +
    '<button type="button" class="row-btn delete-btn" data-id="' + book.id + '">Delete</button>' +
    "</td>"
  );
}

//  Dashboard stats 

// Update all the dashboard numbers, the chart, and the reading-goal message.
export function renderStats(records, goal, speed) {
  // total books
  document.getElementById("stat-total").textContent = records.length;

  // total pages 
  let pagesRead = 0;
  records.forEach(function (book) {
    if (book.read) {
      pagesRead = pagesRead + book.pages;
    }
  });
  document.getElementById("stat-pages").textContent = pagesRead;

  // top tag
  document.getElementById("stat-top-tag").textContent = topTag(records);

  // last 7 days chart
  renderChart(records);

  // reading goal message + time to reach the goal (uses the reading speed)
  renderGoal(pagesRead, goal, speed);

  // time to finish all the unread books
  renderBooksEstimate(records, speed);
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

function renderChart(records) {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  const days = lastSevenDays();

  // count books added on each of those days
  const counts = days.map(function (day) {
    let count = 0;
    records.forEach(function (book) {
      
      if (toDateString(new Date(book.updatedAt)) === day.dateStr) {
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


  const plot = document.createElement("div");
  plot.className = "chart-plot";

  const labels = document.createElement("div");
  labels.className = "chart-labels";

  days.forEach(function (day, i) {
    const column = document.createElement("div");
    column.className = "chart-col";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (counts[i] / max) * 100 + "%";
    bar.title = day.dateStr + ": " + counts[i] + " book(s)";
    column.appendChild(bar);
    plot.appendChild(column);

    const label = document.createElement("div");
    label.className = "chart-label";
    label.textContent = day.label;
    labels.appendChild(label);
  });

  chart.appendChild(plot);
  chart.appendChild(labels);
}

// Build a list of the last 7 days (oldest first), each as a YYYY-MM-DD string.
function lastSevenDays() {
  const days = [];
  const today = new Date();
  const letters = ["S", "M", "T", "W", "T", "F", "S"]; // day-of-week first letters
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ dateStr: toDateString(d), label: letters[d.getDay()] });
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

// Show how far the reader is from their goal, and the time left to reach it.
function renderGoal(pagesRead, goal, speed) {
  const goalMessage = document.getElementById("goal-message");
  const goalBar = document.getElementById("goal-bar");
  const goalFill = document.getElementById("goal-bar-fill");
  const estimate = document.getElementById("reading-estimate");

  if (!goal || goal <= 0) {
    goalBar.hidden = true;
    estimate.textContent = "";
    goalMessage.setAttribute("aria-live", "polite");
    goalMessage.textContent = "Set a reading goal in Settings.";
    return;
  }

  // fill the bar to show how much of the goal is done (max 100%)
  goalBar.hidden = false;
  let percent = (pagesRead / goal) * 100;
  if (percent > 100) {
    percent = 100;
  }
  goalFill.style.width = percent + "%";

  if (pagesRead <= goal) {
    const left = goal - pagesRead;
    goalMessage.setAttribute("aria-live", "polite");
    goalMessage.innerHTML =
      "You have read " + valued(pagesRead) + " of " + valued(goal) +
      " pages. " + valued(left) + " to go.";
    estimate.innerHTML = "About " + valued(timeFor(left, speed)) + " of reading to reach your goal.";
  } else {
    const over = pagesRead - goal;
    goalMessage.setAttribute("aria-live", "assertive");
    goalMessage.innerHTML =
      "You have read " + valued(pagesRead) + " pages - " + valued(over) +
      " over your goal of " + valued(goal) + "!";
    estimate.textContent = "Goal reached!";
  }
}

// wrap a value so it stands out on the page
function valued(text) {
  return '<span class="val">' + text + "</span>";
}

// turn a number of pages into a reading time, using the speed (pages per minute)
function timeFor(pages, speed) {
  if (!speed || speed <= 0) {
    return "unknown time";
  }
  const totalMinutes = Math.round(pages / speed);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours + "h " + minutes + "m";
}

// time to finish all the books that are not read yet
function renderBooksEstimate(records, speed) {
  const estimate = document.getElementById("books-estimate");

  let unreadPages = 0;
  records.forEach(function (book) {
    if (!book.read) {
      unreadPages = unreadPages + book.pages;
    }
  });

  if (unreadPages === 0) {
    estimate.textContent = "All your books are read!";
    return;
  }

  estimate.innerHTML =
    "Time to finish all your books: " + valued(timeFor(unreadPages, speed)) + ".";
}
