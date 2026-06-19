# Book & Notes Vault

A small accessible web app for keeping a catalogue of the books and notes I read. I can add
books, mark them as read, search and sort them, see simple stats, and everything is saved in
the browser. Built with plain HTML, CSS and JavaScript (ES modules) — no frameworks.

**Live site:** https://lnjoroge-alu.github.io/alu-fwd-summative/
**Repo:** https://github.com/lnjoroge-alu/alu-fwd-summative
**Author:** lnjoroge-alu · l.njoroge@alustudent.com

---

## Features

- **Five sections** shown by a tab bar: About, Dashboard, Records, Add / Edit, Settings.
- **Add / edit / delete** books, with a confirm step before deleting.
- **Mark as read** per book; read books are highlighted.
- **Records table** that turns into cards on a phone, with a **Notes** column.
- **Sorting** by Title, Pages or Date (click a header; click again to flip direction).
- **Live regex search** with a case-insensitive toggle and **`<mark>` highlighting** of matches.
- **Dashboard stats**: total books, pages read, top tag, a last-7-days bar chart, and a
  reading-goal message that warns you when you pass your goal.
- **Reading-time estimate** (units conversion: pages → minutes → hours) using your reading speed.
- **Saves automatically** to the browser (localStorage); loads `seed.json` on first run.
- **Import / Export** the data as JSON, with the imported file checked before it is loaded.
- **Accessible**: keyboard friendly, labelled inputs, visible focus, ARIA live messages.

---

## How to run

Because the app uses ES modules, it needs to be served (opening the file directly won't load
the scripts). Easiest way in VS Code:

1. Install the **Live Server** extension.
2. Right-click `index.html` → **Open with Live Server**.

Or run any static server in the project folder, e.g. `python -m http.server`, then open the
address it prints.

## How to run the tests

Open `tests.html` the same way (Live Server). It runs a set of small checks on the validator,
search, sort and import-validation functions and prints **PASS/FAIL** for each, plus a total
at the top.

---

## Regex catalog

These are used to validate the form (and one powers a warning + search).

| Rule | Pattern | Passes | Fails |
|------|---------|--------|-------|
| Title (no edge spaces) | `^\S(?:.*\S)?$` | `Clean Code` | `" Clean"`, `"Clean "` |
| Pages (whole number) | `^[1-9]\d*$` | `250` | `0`, `0250`, `25.5`, `abc` |
| Date (YYYY-MM-DD) | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2025-09-29` | `2025-13-01`, `29/09/2025` |
| Author / tag (letters) | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Mary-Jane Watson` | `Robert2` |
| **Advanced (back-reference)** | `\b(\w+)\s+\1\b` | finds `the the` | `the book` |

The advanced rule uses a **back-reference** (`\1` = "the same word as group 1") to spot a
word typed twice in a row. It shows a friendly tip on the form, and works as a search too.

**Search examples** you can type into the search box:
- `the the` — find a repeated word (e.g. the title "The The Great Escape").
- `\b\d{2}:\d{2}\b` — find a time like `09:30` in the notes.
- `programming` — with "Ignore case" on, matches `Programming`.

---

## Keyboard map

| Key | What it does |
|-----|--------------|
| `Tab` / `Shift+Tab` | Move between the skip link, tabs, inputs and buttons |
| `Enter` / `Space` | Activate the focused tab or button |
| `Enter` (in the form) | Submit the Add / Edit form |
| `Enter` on a column header | Sort by that column (again to flip direction) |
| `Esc` | Cancel the delete confirmation dialog |

The first thing you reach with `Tab` is a **Skip to main content** link.

---

## Accessibility notes

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, one `<h1>` and
  an `<h2>` per section.
- Every input has a `<label>`. Invalid fields get `aria-invalid` and an error message linked
  with `aria-describedby`.
- Status messages use live regions: the form result is an `<output>`, and the reading-goal
  message is polite while under the goal and assertive once it is passed.
- Visible focus outline on everything; focus moves sensibly after adding or deleting a book.
- Colour is never the only signal (errors and the read state also use text and an icon/arrow).
- Mobile-first responsive layout with breakpoints at ~360px, 768px and 1024px.
- A gentle fade animation that is turned off for `prefers-reduced-motion`.

---

## Data

- Saved in the browser under `bnv:data` (books) and `bnv:settings` (goal, speed, tags).
- **Export JSON** downloads the current list; **Import JSON** loads a file after checking it
  is a valid list of books.
- `seed.json` holds 12 starter books and is loaded the first time the app is opened.

To start fresh, clear the site's localStorage (DevTools → Application → Local Storage).

---

## Project structure

```
index.html        the page (one page, tabbed sections)
tests.html        small assertion tests
seed.json         starter books
styles/           base.css, layout.css, components.css
scripts/
  state.js        the in-memory list of books + add/edit/delete
  storage.js      saving/loading + import validation
  validators.js   the regex rules for the form
  search.js       regex search, sorting, highlighting
  ui.js           builds the table and the dashboard
  app.js          starts everything and connects the buttons
docs/             plan and wireframes
```

