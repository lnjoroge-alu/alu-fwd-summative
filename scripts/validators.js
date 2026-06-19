
// ---- regex patterns ----
export const titlePattern = /^\S(?:.*\S)?$/;                       // no space at the start or end
export const pagesPattern = /^[1-9]\d*$/;                          // a whole number, no leading zero
export const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // YYYY-MM-DD
export const namePattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;        // letters, single spaces or hyphens
export const repeatedWordPattern = /\b(\w+)\s+\1\b/i;             // ADVANCED: the same word twice


export function checkTitle(value) {
  if (value === "") {
    return { ok: false, message: "Title is required." };
  }
  if (!titlePattern.test(value)) {
    return { ok: false, message: "Title cannot start or end with a space." };
  }
  return { ok: true };
}

export function checkAuthor(value) {
  if (value === "") {
    return { ok: false, message: "Author is required." };
  }
  if (!namePattern.test(value)) {
    return { ok: false, message: "Author can only have letters, spaces and hyphens." };
  }
  return { ok: true };
}

export function checkPages(value) {
  if (value === "") {
    return { ok: false, message: "Pages is required." };
  }
  if (!pagesPattern.test(value)) {
    return { ok: false, message: "Pages must be a whole number, like 250." };
  }
  return { ok: true };
}

export function checkTag(value) {
  if (value === "") {
    return { ok: false, message: "Tag is required." };
  }
  if (!namePattern.test(value)) {
    return { ok: false, message: "Tag can only have letters, spaces and hyphens." };
  }
  return { ok: true };
}

export function checkDate(value) {
  if (value === "") {
    return { ok: false, message: "Date is required." };
  }
  if (!datePattern.test(value)) {
    return { ok: false, message: "Date must look like YYYY-MM-DD." };
  }
  return { ok: true };
}

// ADVANCED regex used as a friendly warning (it does not block saving):
// returns true if the text has a word typed twice in a row, like "the the".
export function hasRepeatedWord(value) {
  return repeatedWordPattern.test(value);
}
