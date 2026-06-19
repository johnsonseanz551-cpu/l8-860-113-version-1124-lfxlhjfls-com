(function () {
    const mobileButton = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (input) {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const value = input.value.trim();
                if (value) {
                    const prefix = input.getAttribute('data-prefix') || '';
                    window.location.href = prefix + 'search.html?q=' + encodeURIComponent(value);
                }
            }
        });
    });

    const filterInput = document.querySelector('[data-page-filter]');
    if (filterInput) {
        const cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        filterInput.addEventListener('input', function () {
            const keyword = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot && Array.isArray(window.MOVIE_SEARCH_DATA)) {
        const keywordInput = searchRoot.querySelector('[data-search-keyword]');
        const typeSelect = searchRoot.querySelector('[data-search-type]');
        const regionSelect = searchRoot.querySelector('[data-search-region]');
        const yearSelect = searchRoot.querySelector('[data-search-year]');
        const results = searchRoot.querySelector('[data-search-results]');
        const urlKeyword = new URLSearchParams(window.location.search).get('q') || '';

        if (keywordInput) {
            keywordInput.value = urlKeyword;
        }

        function cardTemplate(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '">',
                '<div class="poster-wrap">',
                '<img loading="lazy" decoding="async" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '<span class="card-badge">' + escapeHtml(movie.type || movie.region) + '</span>',
                '<span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
                '<div class="poster-mask"></div>',
                '<div class="play-chip"><span>立即观看</span><span>▶</span></div>',
                '</div>',
                '<div class="card-body">',
                '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
                '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>·</span><span>' + escapeHtml(movie.region) + '</span></div>',
                '</div>',
                '</a>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function renderOptions() {
            const types = Array.from(new Set(window.MOVIE_SEARCH_DATA.map(function (movie) { return movie.type; }).filter(Boolean))).slice(0, 36);
            const regions = Array.from(new Set(window.MOVIE_SEARCH_DATA.map(function (movie) { return movie.region; }).filter(Boolean))).slice(0, 36);
            const years = Array.from(new Set(window.MOVIE_SEARCH_DATA.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse().slice(0, 36);

            types.forEach(function (value) {
                typeSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
            });
            regions.forEach(function (value) {
                regionSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
            });
            years.forEach(function (value) {
                yearSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
            });
        }

        function renderSearch() {
            const keyword = (keywordInput.value || '').trim().toLowerCase();
            const type = typeSelect.value;
            const region = regionSelect.value;
            const year = yearSelect.value;
            const filtered = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                const searchable = [movie.title, movie.desc, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
                return (!keyword || searchable.indexOf(keyword) !== -1) &&
                    (!type || movie.type === type) &&
                    (!region || movie.region === region) &&
                    (!year || movie.year === year);
            }).slice(0, 96);

            if (!filtered.length) {
                results.innerHTML = '<div class="empty-state">暂无匹配内容，请尝试更换关键词或筛选条件。</div>';
                return;
            }

            results.innerHTML = '<div class="card-grid grid-wide">' + filtered.map(cardTemplate).join('') + '</div>';
        }

        renderOptions();
        renderSearch();
        [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            control.addEventListener('input', renderSearch);
            control.addEventListener('change', renderSearch);
        });
    }
})();
