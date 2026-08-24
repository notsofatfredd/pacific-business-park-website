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
});
