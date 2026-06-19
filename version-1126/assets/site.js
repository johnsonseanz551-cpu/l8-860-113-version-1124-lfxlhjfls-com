(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './movies.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';

  document.querySelectorAll('[data-filter-card]').forEach(function (filterCard) {
    var section = filterCard.closest('section') || document;
    var grid = section.querySelector('[data-card-grid]');
    var emptyState = section.querySelector('[data-empty-state]');
    var search = filterCard.querySelector('[data-card-search]');
    var sort = filterCard.querySelector('[data-card-sort]');

    if (!grid || !search) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search-card]'));

    if (queryFromUrl) {
      search.value = queryFromUrl;
    }

    function compareCards(first, second) {
      var mode = sort ? sort.value : 'default';
      if (mode === 'year-desc' || mode === 'year-asc') {
        var firstYear = parseInt(first.getAttribute('data-year') || '0', 10) || 0;
        var secondYear = parseInt(second.getAttribute('data-year') || '0', 10) || 0;
        return mode === 'year-desc' ? secondYear - firstYear : firstYear - secondYear;
      }
      if (mode === 'title') {
        return (first.getAttribute('data-title') || '').localeCompare(second.getAttribute('data-title') || '', 'zh-Hans-CN');
      }
      return cards.indexOf(first) - cards.indexOf(second);
    }

    function applyFilter() {
      var query = search.value.trim().toLowerCase();
      var visible = 0;
      cards.slice().sort(compareCards).forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var matched = !query || searchText.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
        grid.appendChild(card);
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    search.addEventListener('input', applyFilter);
    if (sort) {
      sort.addEventListener('change', applyFilter);
    }
    applyFilter();
  });
})();
