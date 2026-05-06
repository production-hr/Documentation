/* ============================================================
   site.js — runtime nav + search + hash-based drill-down
   ============================================================ */

(function () {

  // ── Path helpers ──────────────────────────────────────────

  function manifestPath() {
    return window.location.pathname.indexOf('/pages/') !== -1
      ? '../docs.json'
      : 'docs.json';
  }

  function rel(href) {
    if (window.location.pathname.indexOf('/pages/') !== -1) {
      if (href.indexOf('pages/') === 0) return '../' + href;
      if (href === 'index.html' || href === '') return '../index.html';
    }
    return href;
  }

  function enc(s) { return encodeURIComponent(s); }

  // ── Routing ───────────────────────────────────────────────
  // Returns string[] from hash: [] | ['AI'] | ['AI','ComfyUI']

  function getRoute() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return [];
    return hash.split('/').map(decodeURIComponent);
  }

  // On a doc page, derive the effective route from the doc's own metadata
  function effectiveRoute(manifest) {
    var route = getRoute();
    if (route.length > 0) return route;

    var here = window.location.pathname.split('/').pop() || '';
    if (!here || here === 'index.html') return route;

    for (var i = 0; i < manifest.docs.length; i++) {
      var d = manifest.docs[i];
      if (d.file.split('/').pop() === here && d.section) {
        return d.subsection ? [d.section, d.subsection] : [d.section];
      }
    }
    return route;
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

  // ── Sidebar ───────────────────────────────────────────────

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
    var route = effectiveRoute(manifest);
    var html = '';

    // ── Back / home link ──
    if (route.length === 0) {
      html += '<div class="nav-section">';
      html += '<ul><li><a href="' + rel('index.html') + '"' +
              (activeId === '__index__' ? ' class="is-active"' : '') +
              '>Index</a></li></ul>';
      html += '</div>';
    } else if (route.length === 1) {
      html += '<ul class="nav-back-list">';
      html += '<li><a class="nav-back" href="' + rel('index.html') + '">← Index</a></li>';
      html += '</ul>';
    } else {
      html += '<ul class="nav-back-list">';
      html += '<li><a class="nav-back" href="' + rel('index.html') + '#' + enc(route[0]) + '">← ' + escapeHtml(route[0]) + '</a></li>';
      html += '</ul>';
    }

    html += '<input type="search" class="search-box" placeholder="Filter…" data-search />';

    // ── Level-specific content ──
    if (route.length === 0) {
      // Root: flat docs (Meta etc.) + section links
      var flat = {}; var flatOrder = [];
      var sectionNames = []; var seenSections = {};
      manifest.docs.forEach(function (d) {
        if (d.section) {
          if (!seenSections[d.section]) { seenSections[d.section] = true; sectionNames.push(d.section); }
        } else {
          var cat = d.category || 'General';
          if (!flat[cat]) { flat[cat] = []; flatOrder.push(cat); }
          flat[cat].push(d);
        }
      });

      flatOrder.forEach(function (cat) {
        html += '<div class="nav-section">';
        html += '<div class="nav-section__title">' + escapeHtml(cat) + '</div><ul>';
        flat[cat].forEach(function (d) { html += navItem(d, activeId); });
        html += '</ul></div>';
      });

      if (sectionNames.length > 0) {
        html += '<div class="nav-section">';
        html += '<div class="nav-section__title">Sections</div><ul>';
        sectionNames.forEach(function (s) {
          html += '<li><a href="' + rel('index.html') + '#' + enc(s) + '">' + escapeHtml(s) + '</a></li>';
        });
        html += '</ul></div>';
      }

    } else if (route.length === 1) {
      // Section level: list subsections
      var section = route[0];
      var subs = []; var seenSubs = {};
      manifest.docs.forEach(function (d) {
        if (d.section !== section) return;
        var sub = d.subsection || 'General';
        if (!seenSubs[sub]) { seenSubs[sub] = true; subs.push(sub); }
      });

      html += '<div class="nav-section">';
      html += '<div class="nav-section__title">' + escapeHtml(section) + '</div><ul>';
      subs.forEach(function (sub) {
        html += '<li><a href="' + rel('index.html') + '#' + enc(section) + '/' + enc(sub) + '">' +
                escapeHtml(sub) + '</a></li>';
      });
      html += '</ul></div>';

    } else {
      // Subsection level: list docs grouped by category
      var section = route[0], subsection = route[1];
      var cats = {}; var catOrder = [];
      manifest.docs.forEach(function (d) {
        if (d.section !== section) return;
        if ((d.subsection || 'General') !== subsection) return;
        var cat = d.category || 'General';
        if (!cats[cat]) { cats[cat] = []; catOrder.push(cat); }
        cats[cat].push(d);
      });

      html += '<div class="nav-section__label">' + escapeHtml(subsection) + '</div>';
      catOrder.forEach(function (cat) {
        html += '<div class="nav-section">';
        html += '<div class="nav-section__title">' + escapeHtml(cat) + '</div><ul>';
        cats[cat].forEach(function (d) { html += navItem(d, activeId); });
        html += '</ul></div>';
      });
    }

    sidebar.innerHTML = html;
    wireSearch();
  }

  // ── Search ────────────────────────────────────────────────

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
      document.querySelectorAll('.nav-section').forEach(function (sec) {
        var items = sec.querySelectorAll('[data-doc-item]');
        if (items.length === 0) return;
        sec.style.display = anyVisible(items) ? '' : 'none';
      });
    });
  }

  // ── Index grid (hash-routed) ──────────────────────────────

  function buildIndexGrid(manifest) {
    var grid = document.querySelector('[data-index-grid]');
    if (!grid) return;

    var route = getRoute();
    updateChrome(manifest, route);

    if (route.length === 0) {
      renderSectionCards(manifest, grid);
    } else if (route.length === 1) {
      renderSubsectionCards(manifest, grid, route[0]);
    } else {
      renderCategoryDocs(manifest, grid, route[0], route[1]);
    }
  }

  function updateChrome(manifest, route) {
    var bc = document.querySelector('[data-breadcrumb]');
    if (bc) {
      if (route.length === 0) {
        bc.innerHTML = '';
      } else {
        var crumbs = [{ label: 'Index', href: 'index.html' }];
        if (route.length >= 1) crumbs.push({ label: route[0], href: 'index.html#' + enc(route[0]) });
        if (route.length >= 2) crumbs.push({ label: route[1], href: null });
        bc.innerHTML = crumbs.map(function (c, i) {
          var sep = i > 0 ? '<span class="bc-sep">/</span>' : '';
          return sep + (!c.href
            ? '<span>' + escapeHtml(c.label) + '</span>'
            : '<a href="' + escapeAttr(c.href) + '">' + escapeHtml(c.label) + '</a>');
        }).join('');
      }
    }

    var label = document.querySelector('[data-page-label]');
    if (label) label.textContent = route.length === 0 ? 'Index' : route[route.length - 1];

    var countEl = document.querySelector('[data-doc-count]');
    if (countEl) {
      var count = countDocs(manifest, route);
      countEl.textContent = count + (count === 1 ? ' entry' : ' entries');
    }

    var titleEl = document.querySelector('[data-page-title]');
    if (titleEl) {
      titleEl.textContent = route.length === 0 ? 'Everything, in one place.' : route[route.length - 1];
    }

    document.querySelectorAll('[data-root-only]').forEach(function (el) {
      el.style.display = route.length === 0 ? '' : 'none';
    });

    var lu = document.querySelector('[data-last-updated]');
    if (lu) {
      var latest = manifest.docs.map(function (d) { return d.updated || ''; }).sort().pop();
      if (latest) lu.textContent = latest;
    }
  }

  function countDocs(manifest, route) {
    if (route.length === 0) return manifest.docs.length;
    return manifest.docs.filter(function (d) {
      if (!d.section || d.section !== route[0]) return false;
      if (route.length >= 2 && (d.subsection || 'General') !== route[1]) return false;
      return true;
    }).length;
  }

  function renderSectionCards(manifest, grid) {
    var sections = {}; var order = [];
    manifest.docs.forEach(function (d) {
      if (!d.section) return;
      if (!sections[d.section]) { sections[d.section] = 0; order.push(d.section); }
      sections[d.section]++;
    });
    grid.innerHTML = order.map(function (s) {
      var count = sections[s];
      return '<a class="doc-card doc-card--nav" href="#' + enc(s) + '">' +
             '<div class="doc-card__title">' + escapeHtml(s) + '</div>' +
             '<div class="doc-card__excerpt">' + count + (count === 1 ? ' document' : ' documents') + '</div>' +
             '</a>';
    }).join('');
  }

  function renderSubsectionCards(manifest, grid, section) {
    var subs = {}; var order = [];
    manifest.docs.forEach(function (d) {
      if (d.section !== section) return;
      var sub = d.subsection || 'General';
      if (!subs[sub]) { subs[sub] = 0; order.push(sub); }
      subs[sub]++;
    });
    grid.innerHTML = order.map(function (sub) {
      var count = subs[sub];
      return '<a class="doc-card doc-card--nav" href="#' + enc(section) + '/' + enc(sub) + '">' +
             '<div class="doc-card__title">' + escapeHtml(sub) + '</div>' +
             '<div class="doc-card__excerpt">' + count + (count === 1 ? ' document' : ' documents') + '</div>' +
             '</a>';
    }).join('');
  }

  function renderCategoryDocs(manifest, grid, section, subsection) {
    var cats = {}; var order = [];
    manifest.docs.forEach(function (d) {
      if (d.section !== section) return;
      if ((d.subsection || 'General') !== subsection) return;
      var cat = d.category || 'General';
      if (!cats[cat]) { cats[cat] = []; order.push(cat); }
      cats[cat].push(d);
    });
    grid.innerHTML = order.map(function (cat) {
      return '<div class="index-category">' +
             '<h2 class="index-category__title">' + escapeHtml(cat) + '</h2>' +
             '<div class="index-category__grid">' +
             cats[cat].map(function (d) {
               return '<a class="doc-card" href="' + escapeAttr(d.file) + '">' +
                      '<div class="doc-card__title">' + escapeHtml(d.title) + '</div>' +
                      '<div class="doc-card__excerpt">' + escapeHtml(d.excerpt || '') + '</div>' +
                      '</a>';
             }).join('') +
             '</div></div>';
    }).join('');
  }

  // ── Escape helpers ────────────────────────────────────────

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ── Boot ──────────────────────────────────────────────────

  var cachedManifest = null;

  fetch(manifestPath())
    .then(function (r) { if (!r.ok) throw new Error('manifest fetch failed'); return r.json(); })
    .then(function (manifest) {
      cachedManifest = manifest;
      buildSidebar(manifest);
      buildIndexGrid(manifest);
    })
    .catch(function (err) {
      console.warn('[docs] could not load manifest:', err);
      var sb = document.querySelector('[data-nav]');
      if (sb) sb.innerHTML = '<div class="nav-section"><p style="font-size:0.85rem;color:var(--ink-faint);font-family:var(--sans);">Open via a local server so the manifest can load.</p></div>';
    });

  window.addEventListener('hashchange', function () {
    if (cachedManifest) {
      buildSidebar(cachedManifest);
      buildIndexGrid(cachedManifest);
    }
    window.scrollTo(0, 0);
  });

})();
