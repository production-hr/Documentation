# Archive

A static HTML documentation site. No build step, no database, no proprietary format.
Designed to be edited by Claude and read by humans.

## Why

Notion, Obsidian, and Google Docs all have formatting problems and produce documents that
look bad in the browser. This repo is the opposite: every page is a hand-readable HTML
file with a real typographic stack. Pages open from disk, serve from any web server, and
deploy to GitHub Pages with no configuration.

## View it

**Locally** (recommended — opening files directly via `file://` will block the manifest fetch
that builds the sidebar):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

**On GitHub Pages**: push to GitHub, enable Pages on `main` branch, root directory.

## Add a page

1. Copy `templates/page.html` into `pages/` and rename it.
2. Fill in the title, lede, meta, and body.
3. Add an entry to `docs.json`:

   ```json
   {
     "id": "my-new-doc",
     "title": "My New Doc",
     "category": "Engineering",
     "file": "pages/my-new-doc.html",
     "excerpt": "One sentence summary.",
     "tags": ["foo", "bar"],
     "updated": "2026-05-05"
   }
   ```

4. Commit, push.

The sidebar nav and the index grid both build themselves from `docs.json` at runtime.

## Ask Claude to do it

This repo is designed for the workflow:

> "Claude, add a new doc called Q3 Roadmap under category Planning, here are the bullet
> points: …"

Claude will create the HTML file, update the manifest, and keep things consistent.
See `CLAUDE.md` for the conventions.

## Structure

```
.
├── index.html              landing page
├── docs.json               manifest (nav + metadata)
├── CLAUDE.md               instructions for Claude
├── assets/
│   ├── css/style.css       all styling
│   ├── js/site.js          nav + search runtime
│   ├── fonts/              optional self-hosted fonts
│   └── img/                images
├── pages/                  every doc page
└── templates/page.html     starter template
```

## License

Use it however you want.
