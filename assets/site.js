document.addEventListener('DOMContentLoaded', function () {
  var directory = document.querySelector('.directory');
  if (!directory) return;

  directory.addEventListener('click', function (event) {
    var head = event.target.closest('.card-head');
    if (!head) return;
    var card = head.closest('.card');
    if (!card) return;
    var isOpen = card.getAttribute('data-open') === 'true';
    directory.querySelectorAll('.card[data-open="true"]').forEach(function (c) {
      if (c !== card) c.setAttribute('data-open', 'false');
    });
    card.setAttribute('data-open', isOpen ? 'false' : 'true');
  });

  var groups = Array.prototype.slice.call(directory.querySelectorAll('.category-group'));
  var cards = Array.prototype.slice.call(directory.querySelectorAll('.card'));

  var search = document.getElementById('store-search');
  var noResults = document.querySelector('.no-results');

  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var name = card.querySelector('.name');
        var cat = card.querySelector('.cat');
        var text = ((name ? name.textContent : '') + ' ' + (cat ? cat.textContent : '')).toLowerCase();
        var matches = query === '' || text.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-search', !matches);
        if (matches) visibleCount += 1;
      });

      groups.forEach(function (group) {
        var hasVisibleCard = group.querySelector('.card:not(.hidden-by-search)');
        group.classList.toggle('hidden-by-search', !hasVisibleCard);
      });

      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  }

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
      if (megaMenu.hidden) {
        openMega();
      } else {
        closeMega();
      }
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
});
