=
export function compileRegex(text, ignoreCase) {
  if (text === "") {
    return null;
  }
  try {
    const flags = ignoreCase ? "gi" : "g";
    return new RegExp(text, flags);
  } catch (error) {
    return null;
  }
}

// Does this book match the search? We look in the fields shown in the table.
export function recordMatches(book, re) {
  if (re === null) {
    return true; // if the regex is not valid, show all records (but show a message in the UI)
  }
  const haystack =
    book.title + " " + book.author + " " + book.pages + " " + book.tag + " " + book.dateAdded;
  return haystack.search(re) !== -1;
}

// Return a sorted copy of the list
export function sortRecords(list, key, direction) {
  const copy = list.slice();

  copy.sort(function (a, b) {
    if (key === "pages") {
      return direction === "asc" ? a.pages - b.pages : b.pages - a.pages;
    }

    // text (title) or date string (YYYY-MM-DD sorts correctly as text)
    const valueA = String(a[key]).toLowerCase();
    const valueB = String(b[key]).toLowerCase();

    if (valueA < valueB) {
      return direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return copy;
}

