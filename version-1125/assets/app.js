(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var navLinks = document.querySelector('[data-nav-links]');
        if (menuButton && navLinks) {
            menuButton.addEventListener('click', function () {
                navLinks.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    start();
                });
            });
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var filterScope = document.querySelector('[data-filter-scope]');
        if (filterScope) {
            var searchInput = filterScope.querySelector('[data-filter-search]');
            var regionSelect = filterScope.querySelector('[data-filter-region]');
            var sortSelect = filterScope.querySelector('[data-filter-sort]');
            var resetButton = filterScope.querySelector('[data-filter-reset]');
            var list = filterScope.querySelector('[data-filter-list]');
            var empty = filterScope.querySelector('[data-filter-empty]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function filterCards() {
                if (!list) {
                    return;
                }
                var query = normalize(searchInput ? searchInput.value : '');
                var region = regionSelect ? regionSelect.value : 'all';
                var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardRegion = card.getAttribute('data-region') || '';
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedRegion = region === 'all' || cardRegion === region;
                    var show = matchedQuery && matchedRegion;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });

                if (sortSelect && sortSelect.value !== 'default') {
                    var visibleCards = cards.filter(function (card) {
                        return card.style.display !== 'none';
                    });
                    visibleCards.sort(function (a, b) {
                        if (sortSelect.value === 'heat') {
                            return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
                        }
                        if (sortSelect.value === 'year') {
                            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                        }
                        return 0;
                    });
                    visibleCards.forEach(function (card) {
                        list.appendChild(card);
                    });
                }

                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', filterCards);
            }
            if (regionSelect) {
                regionSelect.addEventListener('change', filterCards);
            }
            if (sortSelect) {
                sortSelect.addEventListener('change', filterCards);
            }
            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (regionSelect) {
                        regionSelect.value = 'all';
                    }
                    if (sortSelect) {
                        sortSelect.value = 'default';
                    }
                    filterCards();
                });
            }
            filterCards();
        }

        var player = document.querySelector('[data-player]');
        if (player) {
            var video = player.querySelector('[data-player-video]');
            var button = player.querySelector('[data-play-button]');
            var initialized = false;
            var hlsInstance = null;

            function setupVideo() {
                if (!video || initialized) {
                    return;
                }
                var source = video.getAttribute('data-src');
                if (!source) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                initialized = true;
            }

            function playVideo() {
                setupVideo();
                if (!video) {
                    return;
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!initialized) {
                        playVideo();
                    }
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    if (button && video.currentTime === 0) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
}());
