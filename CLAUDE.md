# Instructions for Claude

This file tells future Claude instances how to work with this repo correctly.

## What this repo is

A static HTML documentation site. Pages live in `pages/`, styling lives in
`assets/css/style.css`, the navigation manifest is `docs.json`. There is no
build step.

## Directory structure

Pages are organised into subfolders that mirror the hierarchy in `docs.json`:

```
pages/
  getting-started.html        ← flat (no section/subsection)
  style-guide.html
  ai/
    comfyui/
      comfyui-installation.html
      ai-models-0a.html
      …
    online-tools/
      …
  3d/
    rigging/
      …
  video/
    …
```

The folder path must match `section` and `subsection` in `docs.json`
(lowercase, hyphenated). Flat/Meta pages with no `section` field stay directly
in `pages/`.

## When asked to add a new page

1. **Determine the folder**: `pages/<section>/<subsection>/`. Create it if it
   doesn't exist. For Meta pages (no section), use `pages/` directly.

2. **Create the HTML file** using `templates/page.html` as the starting
   structure. The asset paths depend on depth:
   - `pages/` (depth 1): `../assets/…`, `../index.html`
   - `pages/ai/comfyui/` (depth 3): `../../../assets/…`, `../../../index.html`
   - Rule: count the folder levels between the file and the repo root, use that
     many `../` prefixes.

   The file must include:
   - `<link rel="stylesheet" href="[depth]assets/css/style.css" />`
   - `<script src="[depth]assets/js/site.js"></script>` at the end of body
   - The `.layout` → `.sidebar` (with `<nav data-nav></nav>`) → `.main` structure
   - `<a href="[depth]index.html" class="brand">` so the brand links home
   - Internal page anchors as `id` attributes on `h2` elements

3. **Update `docs.json`** by adding an entry to the `docs` array. Required fields:
   `id`, `title`, `section`, `subsection`, `category`, `file`, `excerpt`, `tags`,
   `updated`. Use today's date in ISO format (`YYYY-MM-DD`) for `updated`.
   The `file` path is always relative to the repo root (e.g. `pages/ai/comfyui/foo.html`).

4. **Match the existing tone**: editorial, dense, complete sentences. The lede
   summarizes; the dropcap paragraph opens substantively. Headings use the `§`
   prefix automatically — don't add it manually.

## When asked to update an existing page

1. Edit the HTML file directly.
2. Update the `updated` field in `docs.json` for that doc.
3. If the title or category changed, update those fields too.

## When asked to restructure

- Splitting one doc into several: create new files, update manifest, remove old
  entry (or keep with a redirect note in the body if links may exist elsewhere).
- Renaming a page: change the file name in both `pages/…/` and `docs.json`.
- Moving a page to a different section/subsection: move the file to the new
  folder, update asset paths inside it, and update `docs.json`.

## Style conventions

- **Sections** are title-case: `AI`, `3D`, `Video`.
- **Subsections** are title-case: `ComfyUI`, `Online Tools`, `Rigging`.
- **Categories** are title-case and specific: `Getting Started`, `Image Models Reference`.
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
- Don't use `../` blindly when creating a page — count the actual folder depth.
