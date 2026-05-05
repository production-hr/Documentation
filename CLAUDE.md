# Instructions for Claude

This file tells future Claude instances how to work with this repo correctly.

## What this repo is

A static HTML documentation site. Pages live in `pages/`, styling lives in
`assets/css/style.css`, the navigation manifest is `docs.json`. There is no
build step.

## When asked to add a new page

1. **Create the HTML file** in `pages/` using `templates/page.html` as the starting
   structure. The file must include:
   - `<link rel="stylesheet" href="../assets/css/style.css" />`
   - `<script src="../assets/js/site.js"></script>` at the end of body
   - The `.layout` → `.sidebar` (with `<nav data-nav></nav>`) → `.main` structure
   - `<a href="../index.html" class="brand">` so the brand links home
   - Internal page anchors as `id` attributes on `h2` elements

2. **Update `docs.json`** by adding an entry to the `docs` array. Required fields:
   `id`, `title`, `category`, `file`, `excerpt`, `tags`, `updated`. Use today's
   date in ISO format (`YYYY-MM-DD`) for `updated`.

3. **Match the existing tone**: editorial, dense, complete sentences. The lede
   summarizes; the dropcap paragraph opens substantively. Headings use the `§`
   prefix automatically — don't add it manually.

## When asked to update an existing page

1. Edit the HTML file directly with `str_replace`.
2. Update the `updated` field in `docs.json` for that doc.
3. If the title or category changed, update those fields too.

## When asked to restructure

- Splitting one doc into several: create new files, update manifest, remove old
  entry (or keep with a redirect note in the body if links may exist elsewhere).
- Renaming a page: change the file name in both `pages/` and `docs.json`. Search
  for inbound links in other pages and update them.

## Style conventions

- **Categories** are case-sensitive — reuse exact spelling. Common ones: `Meta`,
  `Engineering`, `Planning`, `Reference`, `Guides`.
- **IDs** are kebab-case and unique across the manifest.
- **Tags** are lowercase, single words preferred.
- **Excerpts** are one sentence, ~12 words.

## Available formatting

See `pages/style-guide.html` for the full inventory: dropcap, lede, headings,
lists, code (inline + block), blockquotes, tables, callouts (`.callout`,
`.callout--warn`, `.callout--note`), horizontal rules, dark mode (automatic).

## What NOT to do

- Don't add inline styles. Extend `style.css` instead.
- Don't add new dependencies. The site is intentionally a single CSS + single JS file.
- Don't introduce a build step (Jekyll, 11ty, etc). Pages are hand-written HTML on purpose.
- Don't hardcode nav links in HTML pages — the sidebar is built from `docs.json`.
- Don't break the relative path convention: pages live one directory deep, so they
  reference assets as `../assets/...` and the index as `../index.html`.
