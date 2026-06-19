(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startHeroTimer() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHeroTimer();
        });
    });

    startHeroTimer();

    const filterInput = document.querySelector('[data-page-filter]');
    const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));

    if (filterInput && filterCards.length) {
        filterInput.addEventListener('input', function () {
            const query = filterInput.value.trim().toLowerCase();
            filterCards.forEach(function (card) {
                const text = card.getAttribute('data-search') || '';
                card.hidden = query.length > 0 && !text.includes(query);
            });
        });
    }
}());
