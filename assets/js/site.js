/* ============================================================
   site.js — runtime nav + search
   Reads docs.json (the manifest), builds sidebar, marks active page,
   and powers a tiny client-side filter.
   Works equally well opened from disk (file://) or via http.
   ============================================================ */

(function () {
  // Resolve the path to docs.json relative to the page.
  // Pages in /pages/* need ../docs.json; pages at root use ./docs.json.
  function manifestPath() {
    var path = window.location.pathname;
    var depth = (path.replace(/\/$/, '').split('/').length - 1);
    var lastSegment = path.split('/').pop() || '';
    var inSubdir = path.indexOf('/pages/') !== -1;
    return inSubdir ? '../docs.json' : 'docs.json';
  }

  function rel(href) {
    // Adjust href if we're inside /pages/
    if (window.location.pathname.indexOf('/pages/') !== -1) {
      if (href.indexOf('pages/') === 0) return '../' + href;
      if (href === 'index.html' || href === '') return '../index.html';
    }
    return href;
  }

  function currentDocId(manifest) {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    if (here === '' || here === 'index.html') return '__index__';
    for (var i = 0; i < manifest.docs.length; i++) {
      var d = manifest.docs[i];
      if (d.file.split('/').pop() === here) return d.id;
    }
    return null;
  }

  function navItem(d, activeId) {
    var isActive = d.id === activeId;
    return '<li data-doc-item data-title="' + escapeAttr(d.title.toLowerCase()) +
           '" data-tags="' + escapeAttr((d.tags || []).join(' ').toLowerCase()) + '">' +
           '<a href="' + rel(d.file) + '"' +
           (isActive ? ' class="is-active"' : '') + '>' +
           escapeHtml(d.title) + '</a></li>';
  }

  function buildSidebar(manifest) {
    var sidebar = document.querySelector('[data-nav]');
    if (!sidebar) return;

    var activeId = currentDocId(manifest);
    var html = '';

    // Always show Home link first
    html += '<div class="nav-section">';
    html +=   '<ul><li><a href="' + rel('index.html') + '"' +
              (activeId === '__index__' ? ' class="is-active"' : '') +
              '>Index</a></li></ul>';
    html += '</div>';

    // Search box
    html += '<input type="search" class="search-box" placeholder="Filter docs…" data-search />';

    // Separate flat docs (no section) from hierarchical docs (section present)
    var flat = {}; var flatOrder = [];
    var sections = {}; var sectionOrder = [];

    manifest.docs.forEach(function (d) {
      var cat = d.category || 'General';
      if (d.section) {
        var s = d.section, sub = d.subsection || '';
        if (!sections[s]) { sections[s] = { subs: {}, subOrder: [] }; sectionOrder.push(s); }
        var sec = sections[s];
        if (!sec.subs[sub]) { sec.subs[sub] = { cats: {}, catOrder: [] }; sec.subOrder.push(sub); }
        var subsec = sec.subs[sub];
        if (!subsec.cats[cat]) { subsec.cats[cat] = []; subsec.catOrder.push(cat); }
        subsec.cats[cat].push(d);
      } else {
        if (!flat[cat]) { flat[cat] = []; flatOrder.push(cat); }
        flat[cat].push(d);
      }
    });

    // Render flat categories
    flatOrder.forEach(function (cat) {
      html += '<div class="nav-section">';
      html += '<div class="nav-section__title">' + escapeHtml(cat) + '</div><ul>';
      flat[cat].forEach(function (d) { html += navItem(d, activeId); });
      html += '</ul></div>';
    });

    // Render hierarchical sections: section > subsection > category
    sectionOrder.forEach(function (s) {
      var sec = sections[s];
      html += '<div class="nav-section" data-nav-section>';
      html += '<div class="nav-section__title">' + escapeHtml(s) + '</div>';
      sec.subOrder.forEach(function (sub) {
        var subsec = sec.subs[sub];
        html += '<div class="nav-sub" data-nav-sub>';
        if (sub) {
          html += '<div class="nav-section__title nav-section__title--l2">' + escapeHtml(sub) + '</div>';
        }
        subsec.catOrder.forEach(function (cat) {
          html += '<div class="nav-leaf" data-nav-leaf>';
          html += '<div class="nav-section__title nav-section__title--l3">' + escapeHtml(cat) + '</div>';
          html += '<ul>';
          subsec.cats[cat].forEach(function (d) { html += navItem(d, activeId); });
          html += '</ul></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });

    sidebar.innerHTML = html;
    wireSearch();
  }

  function anyVisible(nodeList) {
    return Array.prototype.some.call(nodeList, function (el) {
      return el.style.display !== 'none';
    });
  }

  function wireSearch() {
    var input = document.querySelector('[data-search]');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll('[data-doc-item]').forEach(function (li) {
        var match = !q ||
          li.dataset.title.indexOf(q) !== -1 ||
          li.dataset.tags.indexOf(q) !== -1;
        li.style.display = match ? '' : 'none';
      });
      // hide empty leaf groups
      document.querySelectorAll('[data-nav-leaf]').forEach(function (leaf) {
        var items = leaf.querySelectorAll('[data-doc-item]');
        leaf.style.display = anyVisible(items) ? '' : 'none';
      });
      // hide empty subsections
      document.querySelectorAll('[data-nav-sub]').forEach(function (sub) {
        var leaves = sub.querySelectorAll('[data-nav-leaf]');
        sub.style.display = (leaves.length === 0 || anyVisible(leaves)) ? '' : 'none';
      });
      // hide empty top-level sections
      document.querySelectorAll('.nav-section').forEach(function (sec) {
        var items = sec.querySelectorAll('[data-doc-item]');
        if (items.length === 0) return;
        sec.style.display = anyVisible(items) ? '' : 'none';
      });
    });
  }

  function buildIndexGrid(manifest) {
    var grid = document.querySelector('[data-index-grid]');
    if (!grid) return;
    var sorted = manifest.docs.slice().sort(function (a, b) {
      return (b.updated || '').localeCompare(a.updated || '');
    });
    grid.innerHTML = sorted.map(function (d) {
      return '<a class="doc-card" href="' + escapeAttr(d.file) + '">' +
             '<div class="doc-card__cat">' + escapeHtml(d.category || 'General') + '</div>' +
             '<div class="doc-card__title">' + escapeHtml(d.title) + '</div>' +
             '<div class="doc-card__excerpt">' + escapeHtml(d.excerpt || '') + '</div>' +
             '</a>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // Boot
  fetch(manifestPath())
    .then(function (r) { if (!r.ok) throw new Error('manifest fetch failed'); return r.json(); })
    .then(function (manifest) {
      buildSidebar(manifest);
      buildIndexGrid(manifest);
    })
    .catch(function (err) {
      console.warn('[docs] could not load manifest:', err);
      // Fallback: leave sidebar empty but still render page content.
      var sb = document.querySelector('[data-nav]');
      if (sb) sb.innerHTML = '<div class="nav-section"><div class="nav-section__title">Nav unavailable</div><p style="font-size:0.85rem;color:var(--ink-faint);font-family:var(--sans);">Open this site over a local server (e.g. <code>python -m http.server</code>) so the manifest can load.</p></div>';
    });
})();
