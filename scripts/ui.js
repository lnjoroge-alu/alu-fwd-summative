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
