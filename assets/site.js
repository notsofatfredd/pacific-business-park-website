// Pacific Business Park — site behaviour.
// Extracted from an inline <script> to an external file so this site isn't
// silently broken by a future server-level CSP with script-src 'self'
// (same failure mode documented in SPEC.md §0.1 from the Elysian Labels build).

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');

  button.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  renderDirectory();
  initThemeToggle();
  initShowcase();
  renderUnitGrid();
});

/* Unit reference grid — only stores with a confirmed unit number, sorted
   numerically. Deliberately doesn't fabricate units for stores that don't
   have one yet (see STORE-INTAKE.md) — an honest partial reference, not a
   full architectural map. */
function renderUnitGrid() {
  const grid = document.getElementById('unit-grid');
  if (!grid || typeof STORES === 'undefined') return;

  const withUnits = STORES.filter((s) => s.unit).sort(
    (a, b) => parseInt(a.unit, 10) - parseInt(b.unit, 10)
  );
  if (!withUnits.length) return;

  grid.innerHTML = withUnits
    .map(
      (s) => `
      <div class="unit-card">
        <strong>${s.unit}</strong>
        <span>${s.name}</span>
      </div>
    `
    )
    .join('');
}

/* Store showcase — single-box crossfade (ATLAS Web OS §7 standard pattern).
   Cross-fades every ~4.2s starting from a random slide, respects
   prefers-reduced-motion (renders one static slide, no timer), pauses on
   hover/focus so it doesn't fight a reader trying to look at one card. */
function initShowcase() {
  const ring = document.querySelector('#storeShowcase .badge-ring');
  const counter = document.getElementById('showcaseCounter');
  if (!ring || typeof STORES === 'undefined') return;

  const stores = STORES.filter((s) => s.logo);
  if (!stores.length) return;

  ring.innerHTML = stores
    .map(
      (s, i) => `
      <div class="badge-slide" data-index="${i}">
        <div class="badge-slide-logo">
          <img src="${s.logo}" alt="${s.name} logo" loading="lazy" />
        </div>
        <div class="badge-slide-info">
          <h3>${s.name}</h3>
          <p>${s.category}</p>
        </div>
      </div>
    `
    )
    .join('');

  const slides = Array.from(ring.querySelectorAll('.badge-slide'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = Math.floor(Math.random() * slides.length);
  let timer = null;

  function show(i) {
    slides.forEach((slide, j) => slide.classList.toggle('is-active', j === i));
    if (counter) counter.textContent = `${String(i + 1).padStart(2, '0')} / ${slides.length}`;
  }

  show(index);

  if (reduceMotion || slides.length < 2) return;

  function next() {
    index = (index + 1) % slides.length;
    show(index);
  }

  function start() {
    if (timer) return;
    timer = setInterval(next, 4200);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  start();
  const stage = document.getElementById('storeShowcase');
  stage.addEventListener('mouseenter', stop);
  stage.addEventListener('mouseleave', start);
  stage.addEventListener('focusin', stop);
  stage.addEventListener('focusout', start);
}

/* Theme toggle — manual choice overrides system preference and persists.
   The <head> script (assets/theme-init.js) already applied any stored
   choice before first paint; this just wires up the click and keeps
   aria-pressed/label in sync. */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const root = document.documentElement;
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    const explicit = root.getAttribute('data-theme');
    if (explicit === 'dark') return true;
    if (explicit === 'light') return false;
    return mql.matches;
  }
  function sync() {
    const dark = isDark();
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  sync();

  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('pbp-theme', next);
    } catch (e) {}
    sync();
  });
}

function storeCardHTML(store) {
  const metaParts = [];
  if (store.unit) metaParts.push(`Unit ${store.unit}`);
  if (store.phone) metaParts.push(store.phone);
  if (store.website) metaParts.push(store.website);

  const head = store.logo
    ? `<div class="store-head${store.logoOnDark ? '' : ''}">
         <img src="${store.logo}" alt="${store.name} logo" class="store-logo${store.logoOnDark ? ' logo-on-dark' : ''}">
       </div>`
    : `<div class="store-head store-placeholder">
         <span>${store.name}</span>
       </div>`;

  return `
    <article class="store-card" data-name="${store.name}" data-category="${store.category}">
      ${head}
      <h3>${store.name}</h3>
      <p class="store-cat">${store.category}</p>
      ${metaParts.length ? `<p class="store-meta">${metaParts.join(' · ')}</p>` : ''}
      ${store.hours ? `<p class="store-hours">${store.hours}</p>` : ''}
      <p class="store-desc">${store.description}</p>
    </article>
  `;
}

function renderDirectory() {
  const grid = document.getElementById('directory-grid');
  const categoryFilter = document.getElementById('category-filter');
  if (!grid || typeof STORES === 'undefined') return;

  grid.innerHTML = STORES.map(storeCardHTML).join('');

  const categories = [...new Set(STORES.map((s) => s.category))].sort();
  categoryFilter.innerHTML =
    '<option value="all">All categories</option>' +
    categories.map((c) => `<option value="${c}">${c}</option>`).join('');

  const cards = Array.from(document.querySelectorAll('.store-card'));
  const searchInput = document.getElementById('store-search');
  const alphaButtons = Array.from(document.querySelectorAll('.alpha-btn'));
  const resultText = document.getElementById('directory-results');
  let activeLetter = 'all';

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const cardCategory = card.dataset.category;
      const startsWithLetter =
        activeLetter === 'all' ? true : name.startsWith(activeLetter);
      const matchesSearch = !query || name.includes(query);
      const matchesCategory = category === 'all' || cardCategory === category;

      const show = startsWithLetter && matchesSearch && matchesCategory;
      card.classList.toggle('hidden', !show);
      if (show) {
        visibleCount += 1;
      }
    });

    resultText.textContent = `Showing ${visibleCount} of ${cards.length} confirmed stores.`;
  };

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  alphaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      alphaButtons.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      activeLetter = btn.dataset.letter;
      applyFilters();
    });
  });

  applyFilters();
}
