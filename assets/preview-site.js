// Pacific Business Park — concept switcher preview.
// All 3 concepts (Trusted / Canal Walk / Waterfront) coexist in the DOM at
// once (hidden via CSS on html[data-concept]), so every id from the
// original per-concept files was suffixed "--trusted" / "--canalwalk" /
// "--waterfront" at build time to avoid collisions. This file is the
// scoped equivalent of each concept's own assets/site.js, run 3x.

const CONCEPTS = ["trusted", "canalwalk", "waterfront"];

document.addEventListener("DOMContentLoaded", () => {
  initSwitcher();
  CONCEPTS.forEach((suffix) => {
    initMobileMenu(suffix);
    renderDirectory(suffix);
    initShowcase(suffix);
    renderUnitGrid(suffix);
    renderHighlights(suffix);
    renderCollections(suffix);
  });
  initSmoothScroll();
  initThemeToggle();
});

function initSwitcher() {
  const buttons = document.querySelectorAll(".switcher-tabs button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.documentElement.setAttribute("data-concept", btn.dataset.set);
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    });
  });
}

function initMobileMenu(suffix) {
  const button = document.getElementById(`mobile-menu-button--${suffix}`);
  const menu = document.getElementById(`mobile-menu--${suffix}`);
  if (!button || !menu) return;

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      document.querySelectorAll(".mobile-menu.open").forEach((m) => m.classList.remove("open"));
      document
        .querySelectorAll('.mobile-menu-button[aria-expanded="true"]')
        .forEach((b) => b.setAttribute("aria-expanded", "false"));
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* Theme toggle — one shared data-theme on <html>, wired to all 3 concepts'
   own toggle buttons (only the active concept's button is visible, but
   binding all 3 costs nothing and keeps this simple). */
function initThemeToggle() {
  const root = document.documentElement;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const buttons = document.querySelectorAll(".theme-toggle");
  if (!buttons.length) return;

  function isDark() {
    const explicit = root.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return mql.matches;
  }
  function sync() {
    const dark = isDark();
    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    });
  }
  sync();

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("pbp-theme", next);
      } catch (e) {}
      sync();
    });
  });
}

function storeCardHTML(store) {
  const metaParts = [];
  if (store.unit) metaParts.push(`Unit ${store.unit}`);
  if (store.phone) metaParts.push(store.phone);
  if (store.website) metaParts.push(store.website);

  const head = store.logo
    ? `<div class="store-head">
         <img src="${store.logo}" alt="${store.name} logo" class="store-logo${store.logoOnDark ? " logo-on-dark" : ""}">
       </div>`
    : `<div class="store-head store-placeholder">
         <span>${store.name}</span>
       </div>`;

  return `
    <article class="store-card" data-name="${store.name}" data-category="${store.category}">
      ${head}
      <h3>${store.name}</h3>
      <p class="store-cat">${store.category}</p>
      ${metaParts.length ? `<p class="store-meta">${metaParts.join(" · ")}</p>` : ""}
      ${store.hours ? `<p class="store-hours">${store.hours}</p>` : ""}
      <p class="store-desc">${store.description}</p>
    </article>
  `;
}

function renderDirectory(suffix) {
  const grid = document.getElementById(`directory-grid--${suffix}`);
  const categoryFilter = document.getElementById(`category-filter--${suffix}`);
  if (!grid || typeof STORES === "undefined") return;

  grid.innerHTML = STORES.map(storeCardHTML).join("");

  const categories = [...new Set(STORES.map((s) => s.category))].sort();
  if (categoryFilter) {
    categoryFilter.innerHTML =
      '<option value="all">All categories</option>' +
      categories.map((c) => `<option value="${c}">${c}</option>`).join("");
  }

  const cards = Array.from(grid.querySelectorAll(".store-card"));
  const searchInput = document.getElementById(`store-search--${suffix}`);
  const alphaFilter = document.getElementById(`alpha-filter--${suffix}`);
  const alphaButtons = alphaFilter ? Array.from(alphaFilter.querySelectorAll(".alpha-btn")) : [];
  const resultText = document.getElementById(`directory-results--${suffix}`);
  let activeLetter = "all";

  const applyFilters = () => {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const category = categoryFilter ? categoryFilter.value : "all";
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const cardCategory = card.dataset.category;
      const startsWithLetter = activeLetter === "all" ? true : name.startsWith(activeLetter);
      const matchesSearch = !query || name.includes(query);
      const matchesCategory = category === "all" || cardCategory === category;

      const show = startsWithLetter && matchesSearch && matchesCategory;
      card.classList.toggle("hidden", !show);
      if (show) visibleCount += 1;
    });

    if (resultText) resultText.textContent = `Showing ${visibleCount} of ${cards.length} confirmed stores.`;
  };

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  alphaButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alphaButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      activeLetter = btn.dataset.letter;
      applyFilters();
    });
  });

  // Run once on load so the results count reflects the real store count
  // immediately, instead of relying on static placeholder text in the HTML
  // staying manually in sync with stores-data.js (it drifted at least once
  // already - "22 of 22" survived in Concept C's markup after a 23rd store
  // was added, only self-correcting once a user actually touched a filter).
  applyFilters();
}

function renderUnitGrid(suffix) {
  const grid = document.getElementById(`unit-grid--${suffix}`);
  if (!grid || typeof STORES === "undefined") return;

  const withUnits = STORES.filter((s) => s.unit).sort((a, b) => parseInt(a.unit, 10) - parseInt(b.unit, 10));
  if (!withUnits.length) return;

  grid.innerHTML = withUnits
    .map((s) => `<div class="unit-card"><strong>${s.unit}</strong><span>${s.name}</span></div>`)
    .join("");
}

function initShowcase(suffix) {
  const stage = document.getElementById(`storeShowcase--${suffix}`);
  if (!stage) return;
  const ring = stage.querySelector(".badge-ring");
  const counter = document.getElementById(`showcaseCounter--${suffix}`);
  if (!ring || typeof STORES === "undefined") return;

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
    .join("");

  const slides = Array.from(ring.querySelectorAll(".badge-slide"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = Math.floor(Math.random() * slides.length);
  let timer = null;

  function show(i) {
    slides.forEach((slide, j) => slide.classList.toggle("is-active", j === i));
    if (counter) counter.textContent = `${String(i + 1).padStart(2, "0")} / ${slides.length}`;
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
  stage.addEventListener("mouseenter", stop);
  stage.addEventListener("mouseleave", start);
  stage.addEventListener("focusin", stop);
  stage.addEventListener("focusout", start);
}

function renderHighlights(suffix) {
  const grid = document.getElementById(`highlights-grid--${suffix}`);
  if (!grid || typeof STORES === "undefined") return;

  const pickIds = ["elysian-labels", "golden-shilajit", "vintage-barbershop", "visfabriek"];
  const picks = pickIds.map((id) => STORES.find((s) => s.id === id)).filter(Boolean);

  grid.innerHTML = picks
    .map(
      (s) => `
      <article class="highlight-card">
        <div class="highlight-logo"><img src="${s.logo}" alt="${s.name} logo" loading="lazy" /></div>
        <h3>${s.name}</h3>
        <p class="highlight-cat">${s.category}</p>
        <p class="highlight-desc">${s.description}</p>
      </article>
    `
    )
    .join("");
}

function renderCollections(suffix) {
  const grid = document.getElementById(`collections-grid--${suffix}`);
  if (!grid || typeof STORES === "undefined") return;

  const byCategory = {};
  STORES.forEach((s) => {
    (byCategory[s.category] = byCategory[s.category] || []).push(s);
  });
  const categories = Object.keys(byCategory).sort();

  grid.innerHTML = categories
    .map((cat) => {
      const items = byCategory[cat];
      const names = items.map((s) => s.name).slice(0, 3).join(", ");
      return `
        <a class="collection-card" href="#directory--${suffix}">
          <h3>${cat}</h3>
          <p class="collection-count">${items.length} store${items.length === 1 ? "" : "s"}</p>
          <p class="collection-names">${names}${items.length > 3 ? "…" : ""}</p>
        </a>
      `;
    })
    .join("");
}
