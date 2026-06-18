# Book & Notes Vault - Implementation Plan 

**Theme:** Book & Notes Vault (catalog, pages, tags, search)
**Author:** lnjoroge-alu · l.njoroge@alustudent.com
**Repo:** https://github.com/lnjoroge-alu/alu-fwd-summative
**Pages URL :** https://lnjoroge-alu.github.io/alu-fwd-summative/

Vanilla HTML/CSS/JS, **ES modules**. No frameworks. Mobile-first, accessible, saves to localStorage.

## File structure

```
index.html          # one page; sections shown/hidden by the nav tabs
tests.html          # simple page that runs assertions and prints pass/fail
seed.json           # >=10 example records to import
assets/             # favicon / icons
styles/
  base.css          # colours (CSS variables), fonts, focus styles, light/dark
  layout.css        # mobile-first layout + media queries (360 / 768 / 1024)
  components.css     # cards, table, form, chart bars, messages
scripts/
  storage.js        # save()/load() localStorage + export/import JSON (with checks)
  state.js          # the records array + addRecord/updateRecord/deleteRecord + id maker
  validators.js     # the regex rules + one validate function per field
  search.js         # safe regex compiler, filter, sort, highlight matches
  ui.js             # build the HTML (cards/table/stats) and read form values
  app.js            # entry point: load data, draw it, hook up buttons
```


**Simple data flow:**

```
button click  ->  change the records array (state.js)
              ->  save() to localStorage (storage.js)
              ->  renderAll() redraws the page (ui.js)
```

---

## Data model

```js
{
  id: "bnv_0001",            // unique id, made by a small helper
  title: "Clean Code",       // required
  author: "Robert Martin",   // required
  pages: 464,                // the numeric field for this theme (whole number)
  tag: "Programming",        // the category for this theme
  isbn: "978-0132350884",    // optional
  notes: "Notes about it",   // optional
  dateAdded: "2025-09-29",   // YYYY-MM-DD
  createdAt: "2025-09-29T10:00:00.000Z",
  updatedAt: "2025-09-29T10:00:00.000Z"
}
```

- `pages` is the number used for the total, the chart, and the cap.
- **Units/conversion :** Settings holds a reading speed (pages per minute). A small
  helper turns pages into estimated minutes, and minutes into hours. That's the conversion.
- Saved in `localStorage` under `bnv:data`; settings under `bnv:settings`.

---

## Regex catalog ( 4 rules + 1 advanced required)

**Core (required):**

| # | Field / use         | Pattern | Plain-English meaning |
|---|---------------------|---------|-----------------------|
| 1 | Title (no edge spaces) | `/^\S(?:.*\S)?$/` | can't start or end with a space |
| 2 | Pages (whole number)   | `/^[1-9]\d*$/` | a positive whole number (no leading zero) |
| 3 | Date `YYYY-MM-DD`      | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | a valid-looking date |
| 4 | Author / tag          | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | letters, single spaces or hyphens between words |
| 5 | **Advanced: backreference** | `/\b(\w+)\s+\1\b/i` | catches a word typed twice in a row (e.g. "the the") |

Rule 5 is the required advanced pattern (the `\1` re-matches whatever group 1 captured).
I use it in two places: a gentle "did you repeat a word?" warning on title/notes, and as a
ready-made search example.

Also shown as **search examples** in the UI/README (not validation):
- `\.\d{2}\b` — numbers with cents-style 2 decimals (carried from the finance example)
- `\b\d{2}:\d{2}\b` — time tokens like `09:30` in notes

**Optional / stretch (only if time, clearly marked):**
- ISBN finder: `/\b(?:97[89][- ]?)?(?:\d[- ]?){9}[\dXx]\b/`
- Lookahead demo (tag must contain a letter): `/^(?=.*[A-Za-z]).+$/`

The numeric rule from the brief, `^(0|[1-9]\d*)(\.\d{1,2})?$`, is kept in the README's
regex catalog for reference, but pages use the whole-number version because books don't
have half pages.

---

## Accessibility plan (short version; full detail in docs/a11y-plan.md)
- Landmarks + one `<h1>`; sensible heading order in each section.
- A `<label for="...">` on every input; clear focus outline; skip-to-content link first.
- Messages/errors in a `role="status"` / `aria-live` region; cap overage uses `role="alert"`.
- Colours meet AA contrast in light and dark; never rely on colour alone (use text/icons too).
- Works with keyboard only: Tab order, Enter/Space to activate, Esc to cancel a delete.

## Breakpoints
- ~360px: one column, cards, stacked nav.
- ~768px: records become a table; two-column dashboard.
- ~1024px: wider layout, form and list side by side where it helps.

## Testing
`tests.html` imports the pure functions and checks them with simple `if`-based assertions:
each regex (pass / fail / edge), the regex compiler (bad pattern → null, case-insensitive),
the highlighter (doesn't break HTML), and a save→load→export→import round-trip.

