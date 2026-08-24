document.addEventListener('DOMContentLoaded', function () {

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mega-menu ---- */
  var megaToggle = document.getElementById('mega-toggle');
  var megaMenu = document.getElementById('mega-menu');

  if (megaToggle && megaMenu) {
    var closeMega = function () {
      megaMenu.hidden = true;
      megaToggle.setAttribute('aria-expanded', 'false');
    };
    var openMega = function () {
      megaMenu.hidden = false;
      megaToggle.setAttribute('aria-expanded', 'true');
    };

    megaToggle.addEventListener('click', function () {
      if (megaMenu.hidden) { openMega(); } else { closeMega(); }
    });
    megaMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMega();
    });
    document.addEventListener('click', function (event) {
      if (megaMenu.hidden) return;
      if (event.target.closest('#mega-menu') || event.target.closest('#mega-toggle')) return;
      closeMega();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !megaMenu.hidden) {
        closeMega();
        megaToggle.focus();
      }
    });
  }

  /* ---- modal (with open/close transition) ---- */
  var overlay = document.getElementById('modal-overlay');
  var modal = overlay ? overlay.querySelector('.modal') : null;
  var modalName = document.getElementById('modal-name');
  var modalCat = document.getElementById('modal-cat');
  var modalBody = document.getElementById('modal-body');
  var modalClose = document.getElementById('modal-close');
  var lastTrigger = null;
  var closeTimer = null;

  function focusableIn(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
    );
  }

  function openModal(trigger) {
    var storeId = trigger.getAttribute('data-store');
    var template = document.getElementById('detail-' + storeId);
    if (!template || !overlay || !modalBody) return;

    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    lastTrigger = trigger;
    modalBody.innerHTML = '';
    modalBody.appendChild(template.content.cloneNode(true));
    if (modalName) modalName.textContent = trigger.getAttribute('data-name') || '';
    if (modalCat) modalCat.textContent = trigger.getAttribute('data-cat') || '';

    overlay.hidden = false;
    void overlay.offsetWidth; /* force reflow so the transition runs */
    overlay.classList.add('is-open');
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('is-open');
    var delay = reduceMotion ? 0 : 200;
    closeTimer = setTimeout(function () {
      overlay.hidden = true;
      if (modalBody) modalBody.innerHTML = '';
    }, delay);
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  }

  document.querySelectorAll('.tile, .showcase-slide').forEach(function (trigger) {
    trigger.addEventListener('click', function () { openModal(trigger); });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'Tab' && modal) {
      var focusable = focusableIn(modal);
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ---- search ---- */
  var search = document.getElementById('store-search');
  var noResults = document.querySelector('.no-results');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.category-group'));
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));

  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      var visibleCount = 0;

      tiles.forEach(function (tile) {
        var text = ((tile.getAttribute('data-name') || '') + ' ' + (tile.getAttribute('data-cat') || '')).toLowerCase();
        var matches = query === '' || text.indexOf(query) !== -1;
        tile.classList.toggle('hidden-by-search', !matches);
        if (matches) visibleCount += 1;
      });

      groups.forEach(function (group) {
        var hasVisibleTile = group.querySelector('.tile:not(.hidden-by-search)');
        group.classList.toggle('hidden-by-search', !hasVisibleTile);
      });

      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  }

  /* ---- store showcase carousel ---- */
  var showcaseTrack = document.getElementById('showcase-track');
  var showcaseDotsWrap = document.getElementById('showcase-dots');

  if (showcaseTrack && showcaseDotsWrap) {
    var slides = Array.prototype.slice.call(showcaseTrack.querySelectorAll('.showcase-slide'));
    var current = 0;
    var timer = null;

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'showcase-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Show ' + (slide.getAttribute('data-name') || 'slide ' + (i + 1)));
      dot.addEventListener('click', function () { goTo(i); restart(); });
      showcaseDotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(showcaseDotsWrap.querySelectorAll('.showcase-dot'));

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = index;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    function next() { goTo((current + 1) % slides.length); }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(next, 4500);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    showcaseTrack.addEventListener('mouseenter', stop);
    showcaseTrack.addEventListener('mouseleave', start);
    showcaseTrack.addEventListener('focusin', stop);
    showcaseTrack.addEventListener('focusout', start);

    start();
  }

  /* ---- count-up stats ---- */
  var statNums = document.querySelectorAll('.stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
        obs.unobserve(el);
        if (reduceMotion) { el.textContent = String(target); return; }
        var start = null;
        var duration = 900;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          el.textContent = String(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = String(target);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNums.forEach(function (el) { el.textContent = el.getAttribute('data-count-to') || '0'; });
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- featured tile tilt (fine pointer only) ---- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tile-featured').forEach(function (tile) {
      tile.addEventListener('mousemove', function (event) {
        var rect = tile.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        tile.style.transform = 'perspective(600px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg) translateY(-2px)';
      });
      tile.addEventListener('mouseleave', function () {
        tile.style.transform = '';
      });
    });
  }
});
