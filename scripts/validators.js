
// ---- regex patterns ----
export const titlePattern = /^\S(?:.*\S)?$/;                       // no space at the start or end
export const pagesPattern = /^[1-9]\d*$/;                          // a whole number, no leading zero
export const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // YYYY-MM-DD
export const namePattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;        // letters, single spaces or hyphens
export const repeatedWordPattern = /\b(\w+)\s+\1\b/i;             // ADVANCED: the same word twice

