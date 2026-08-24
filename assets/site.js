document.addEventListener('DOMContentLoaded', function () {

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

  /* ---- modal ---- */
  var overlay = document.getElementById('modal-overlay');
  var modal = overlay ? overlay.querySelector('.modal') : null;
  var modalName = document.getElementById('modal-name');
  var modalCat = document.getElementById('modal-cat');
  var modalBody = document.getElementById('modal-body');
  var modalClose = document.getElementById('modal-close');
  var lastTrigger = null;

  function focusableIn(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
    );
  }

  function openModal(tile) {
    var storeId = tile.getAttribute('data-store');
    var template = document.getElementById('detail-' + storeId);
    if (!template || !overlay || !modalBody) return;

    lastTrigger = tile;
    modalBody.innerHTML = '';
    modalBody.appendChild(template.content.cloneNode(true));
    if (modalName) modalName.textContent = tile.getAttribute('data-name') || '';
    if (modalCat) modalCat.textContent = tile.getAttribute('data-cat') || '';

    overlay.hidden = false;
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    if (modalBody) modalBody.innerHTML = '';
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  }

  document.querySelectorAll('.tile').forEach(function (tile) {
    tile.addEventListener('click', function () { openModal(tile); });
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
});
