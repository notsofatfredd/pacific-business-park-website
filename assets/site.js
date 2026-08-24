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

  var search = document.getElementById('store-search');
  var noResults = document.querySelector('.no-results');
  if (!search) return;

  var cards = Array.prototype.slice.call(directory.querySelectorAll('.card'));

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

    if (noResults) noResults.hidden = visibleCount !== 0;
  });
});
