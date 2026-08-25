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
  renderUnitPlan();
  updateTradingStatus();
  window.setInterval(updateTradingStatus, 30000);
  initHeroCanvas();
  initStoreDialog();
});

/* Store detail dialog — native <dialog> (built-in focus trap, backdrop,
   Escape-to-close). Single shared instance, populated per store from real
   `stores-data.js` fields. Opened from both the directory cards' "View
   store" button and (once wired) the interactive unit-plan. */
let lastFocusedElement = null;

function openStoreDialog(storeId) {
  const store = STORES.find((s) => s.id === storeId);
  const dialog = document.getElementById('store-dialog');
  if (!store || !dialog) return;

  const brand = document.getElementById('dialog-brand');
  if (store.logo) {
    brand.innerHTML = `<img src="${store.logo}" alt="${store.name} logo" class="dialog-logo${store.logoOnDark ? ' logo-on-dark' : ''}">`;
  } else {
    brand.innerHTML = `<span class="dialog-mark">${store.name}</span>`;
  }

  document.getElementById('dialog-category').textContent = store.category;
  document.getElementById('dialog-name').textContent = store.name;
  document.getElementById('dialog-description').textContent = store.description;

  const metaParts = [];
  if (store.unit) metaParts.push(`Unit ${store.unit}${store.unitConfirmed === false ? ' — unconfirmed, TBC' : ''}`);
  if (store.phone) metaParts.push(store.phone);
  if (store.website) metaParts.push(store.website);
  document.getElementById('dialog-meta').textContent = metaParts.join(' · ');

  document.getElementById('dialog-hours').textContent = store.hours || '';

  const actions = document.getElementById('dialog-actions');
  actions.innerHTML = store.phone
    ? `<a class="btn btn-primary" href="tel:${store.phone.replace(/\s+/g, '')}">Call ${store.phone}</a>`
    : '';

  lastFocusedElement = document.activeElement;
  dialog.showModal();
}

function closeStoreDialog() {
  const dialog = document.getElementById('store-dialog');
  if (dialog?.open) dialog.close();
  lastFocusedElement?.focus();
}

function initStoreDialog() {
  const dialog = document.getElementById('store-dialog');
  if (!dialog) return;

  document.getElementById('dialog-close').addEventListener('click', closeStoreDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeStoreDialog();
  });

  // Delegated: covers directory cards' "View store" buttons and the
  // unit-plan detail panel's "View store" button, both rendered later.
  document.body.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-store]');
    if (trigger) openStoreDialog(trigger.dataset.openStore);
  });
}

/* Abstract, decorative hero canvas — adapted from an early Codex concept
   build's approach, deliberately stripped of that build's per-unit
   rectangles: this is ambient route/grid art, not a claim about the real
   centre layout (no real surveyed floor plan exists on file — the actual
   unit data lives in the real interactive unit-plan section further down
   the page). Hero is a "pinned dark" surface (stays dark in both themes,
   same convention as the footer/top-strip), so colors are the fixed
   on-dark hex values, not the theme-adaptive tokens. */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const hero = canvas?.closest('.hero');
  if (!canvas || !hero) return;

  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 0;
  let height = 0;

  function resize() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  hero.addEventListener(
    'pointermove',
    (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.tx = event.clientX / rect.width - 0.5;
      pointer.ty = event.clientY / rect.height - 0.5;
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  function draw(time = 0) {
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#081d3a';
    context.fillRect(0, 0, width, height);

    const shiftX = pointer.x * 16;
    const shiftY = pointer.y * 10;
    context.save();
    context.translate(shiftX, shiftY);

    context.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    context.lineWidth = 1;
    const gridSize = 56;
    for (let x = -gridSize; x < width + gridSize; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = -gridSize; y < height + gridSize; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const dashOffset = reduceMotion ? 0 : -(time / 45);
    context.strokeStyle = 'rgba(77, 224, 220, 0.3)';
    context.lineWidth = 1.5;
    context.setLineDash([7, 9]);
    context.lineDashOffset = dashOffset;
    context.beginPath();
    context.moveTo(width * 0.05, height * 0.72);
    context.bezierCurveTo(width * 0.32, height * 0.42, width * 0.6, height * 0.86, width * 0.95, height * 0.3);
    context.stroke();
    context.setLineDash([]);

    const pulse = reduceMotion ? 0.5 : (Math.sin(time / 620) + 1) / 2;
    const markerX = width * 0.78;
    const markerY = height * 0.24;
    context.strokeStyle = `rgba(77, 224, 220, ${0.35 + pulse * 0.4})`;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(markerX, markerY, 7 + pulse * 7, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = '#4de0dc';
    context.beginPath();
    context.arc(markerX, markerY, 3, 0, Math.PI * 2);
    context.fill();

    context.restore();

    if (!reduceMotion) window.requestAnimationFrame(draw);
  }

  resize();
  new ResizeObserver(resize).observe(hero);
  draw();
}

/* Live trading-status pill — real Cape Town time against the real centre
   hours (Mon-Sat 09:00-18:00, Sun 09:00-13:00, matching the top-strip and
   hero copy). Ported from the Pacific Roadhouse site build, which already
   verified this against the same real hours. */
function capeTownTimeParts() {
  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return {
    weekday: parts.weekday,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function updateTradingStatus() {
  const pill = document.getElementById('header-status');
  const label = document.getElementById('header-status-label');
  if (!pill || !label) return;

  const time = capeTownTimeParts();
  const isSunday = time.weekday === 'Sunday';
  const opensAt = 9 * 60;
  const closesAt = (isSunday ? 13 : 18) * 60;
  const current = time.hour * 60 + time.minute;
  const isOpen = current >= opensAt && current < closesAt;
  const closeLabel = isSunday ? '13:00' : '18:00';

  let statusLabel;
  if (isOpen) {
    statusLabel = `Open until ${closeLabel}`;
  } else if (current < opensAt) {
    statusLabel = 'Opens today at 09:00';
  } else if (time.weekday === 'Saturday') {
    statusLabel = 'Opens Sunday at 09:00';
  } else if (time.weekday === 'Sunday') {
    statusLabel = 'Opens Monday at 09:00';
  } else {
    statusLabel = 'Opens tomorrow at 09:00';
  }

  label.textContent = statusLabel;
  pill.classList.toggle('is-open', isOpen);
}

/* Unit reference grid — only stores with a confirmed unit number, sorted
   numerically. Deliberately doesn't fabricate units for stores that don't
   have one yet (see STORE-INTAKE.md) — an honest partial reference, not a
   full architectural map. */
/* Interactive unit-plan — 25 units, phase one. A schematic grid, not a
   surveyed floor plan (no real site-plan data exists on file). Wired to
   real STORES: 11 units are confirmed, the other real trading stores'
   units are placeholders (unitConfirmed:false, flagged in the UI, not
   presented as fact) pending Saeed confirming them on-site. Whatever's
   left over is a genuinely open unit — routes to the leasing section. */
const TOTAL_UNITS = 25;

function renderUnitPlan() {
  const grid = document.getElementById('plan-grid');
  if (!grid || typeof STORES === 'undefined') return;

  const storeByUnit = new Map(
    STORES.filter((s) => s.unit).map((s) => [Number(s.unit), s])
  );

  grid.innerHTML = '';
  for (let unitNumber = 1; unitNumber <= TOTAL_UNITS; unitNumber += 1) {
    const store = storeByUnit.get(unitNumber);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.unit = String(unitNumber);
    button.setAttribute('role', 'listitem');

    if (store && store.unitConfirmed !== false) {
      button.className = 'plan-unit trading';
      button.setAttribute('aria-label', `Unit ${unitNumber}, ${store.name}, trading`);
    } else if (store) {
      button.className = 'plan-unit trading unconfirmed';
      button.setAttribute('aria-label', `Unit ${unitNumber}, ${store.name}, trading — unit number unconfirmed`);
    } else {
      button.className = 'plan-unit open';
      button.setAttribute('aria-label', `Unit ${unitNumber}, open — enquire about leasing`);
    }

    button.textContent = String(unitNumber).padStart(2, '0');
    button.addEventListener('click', () => selectUnit(unitNumber));
    grid.appendChild(button);
  }

  selectUnit(1);
}

function selectUnit(unitNumber) {
  const store = STORES.find((s) => Number(s.unit) === unitNumber);

  document.querySelectorAll('.plan-unit').forEach((btn) => {
    btn.classList.toggle('selected', Number(btn.dataset.unit) === unitNumber);
  });

  const numberEl = document.getElementById('plan-detail-number');
  const statusEl = document.getElementById('plan-detail-status');
  const nameEl = document.getElementById('plan-detail-name');
  const descEl = document.getElementById('plan-detail-desc');
  const actionsEl = document.getElementById('plan-detail-actions');

  numberEl.textContent = `Unit ${String(unitNumber).padStart(2, '0')}`;

  if (store) {
    const confirmed = store.unitConfirmed !== false;
    statusEl.textContent = confirmed ? 'Trading' : 'Trading — unit number unconfirmed';
    statusEl.className = `plan-detail-status trading${confirmed ? '' : ' unconfirmed'}`;
    nameEl.textContent = store.name;
    descEl.textContent = store.description;
    actionsEl.innerHTML = `<button class="btn btn-primary" type="button" data-open-store="${store.id}">View store <span aria-hidden="true">&rarr;</span></button>`;
  } else {
    statusEl.textContent = 'Open';
    statusEl.className = 'plan-detail-status open';
    nameEl.textContent = 'Space available';
    descEl.textContent = 'This unit is open — enquire about leasing at Pacific Business Park.';
    actionsEl.innerHTML = '<a class="btn btn-primary" href="#business">Enquire about this unit <span aria-hidden="true">&rarr;</span></a>';
  }
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
  if (store.unit) metaParts.push(`Unit ${store.unit}${store.unitConfirmed === false ? ' (TBC)' : ''}`);
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
      <button class="store-card-button" type="button" data-open-store="${store.id}">View store</button>
    </article>
  `;
}

function renderDirectory() {
  const grid = document.getElementById('directory-grid');
  const tabsWrap = document.getElementById('category-tabs');
  if (!grid || typeof STORES === 'undefined') return;

  grid.innerHTML = STORES.map(storeCardHTML).join('');

  const categories = [...new Set(STORES.map((s) => s.category))].sort();
  tabsWrap.innerHTML =
    '<button type="button" class="category-tab active" data-category="all">All</button>' +
    categories.map((c) => `<button type="button" class="category-tab" data-category="${c}">${c}</button>`).join('');

  const cards = Array.from(document.querySelectorAll('.store-card'));
  const searchInput = document.getElementById('store-search');
  const alphaButtons = Array.from(document.querySelectorAll('.alpha-btn'));
  const categoryTabs = Array.from(document.querySelectorAll('.category-tab'));
  const resultText = document.getElementById('directory-results');
  let activeLetter = 'all';
  let activeCategory = 'all';

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const cardCategory = card.dataset.category;
      const startsWithLetter =
        activeLetter === 'all' ? true : name.startsWith(activeLetter);
      const matchesSearch = !query || name.includes(query);
      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;

      const show = startsWithLetter && matchesSearch && matchesCategory;
      card.classList.toggle('hidden', !show);
      if (show) {
        visibleCount += 1;
      }
    });

    resultText.textContent = `Showing ${visibleCount} of ${cards.length} confirmed stores.`;
  };

  searchInput.addEventListener('input', applyFilters);
  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      applyFilters();
    });
  });
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
