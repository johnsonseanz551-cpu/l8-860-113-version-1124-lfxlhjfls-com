(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            button.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
        });
    }

    function bindHero() {
        var carousel = document.querySelector("[data-hero]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function bindPageFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter]"));
        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute("data-page-filter");
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
                });
            });
        });
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function renderSearchPage() {
        var box = document.querySelector("[data-search-box]");
        var results = document.querySelector("[data-search-results]");
        if (!box || !results || !window.movieSearchData) {
            return;
        }

        function render(keyword) {
            var term = keyword.trim().toLowerCase();
            box.value = keyword;
            if (!term) {
                results.innerHTML = "";
                return;
            }
            var matched = window.movieSearchData.filter(function (movie) {
                return movie.title.toLowerCase().indexOf(term) !== -1 ||
                    movie.genre.toLowerCase().indexOf(term) !== -1 ||
                    movie.tags.toLowerCase().indexOf(term) !== -1 ||
                    movie.region.toLowerCase().indexOf(term) !== -1;
            }).slice(0, 80);
            results.innerHTML = matched.map(function (movie) {
                return [
                    '<a class="search-result-card" href="' + movie.href + '">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                    '<span>',
                    '<strong>' + escapeHtml(movie.title) + '</strong>',
                    '<span class="pill">' + escapeHtml(movie.year) + '</span> ',
                    '<span class="pill">' + escapeHtml(movie.genre) + '</span>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '</span>',
                    '</a>'
                ].join("");
            }).join("");
        }

        box.addEventListener("input", function () {
            render(box.value);
        });
        render(getQuery("q"));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            if (character === "&") {
                return "&amp;";
            }
            if (character === "<") {
                return "&lt;";
            }
            if (character === ">") {
                return "&gt;";
            }
            if (character === String.fromCharCode(34)) {
                return "&quot;";
            }
            return "&#39;";
        });
    }


    window.initPlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        if (!video) {
            return;
        }
        var source = options.src;
        var hlsInstance = null;

        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function play() {
            if (!video.src) {
                attach();
            }
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hidden");
                    }
                });
            }
        }

        attach();
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    onReady(function () {
        bindMenu();
        bindHero();
        bindPageFilters();
        renderSearchPage();
    });
})();
