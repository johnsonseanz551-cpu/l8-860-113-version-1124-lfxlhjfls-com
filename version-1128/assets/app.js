(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.classList.toggle("open", !expanded);
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var previous = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var grid = scope.nextElementSibling;
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value");
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    cards.forEach(function (card) {
                        var text = card.textContent || "";
                        var visible = value === "all" || text.indexOf(value) !== -1;
                        card.style.display = visible ? "" : "none";
                    });
                });
            });
        });
    }

    function escapeHTML(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function movieCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"./" + escapeHTML(movie.file) + "\" aria-label=\"观看" + escapeHTML(movie.title) + "\">",
            "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-year\">" + escapeHTML(movie.year) + "</span>",
            "<span class=\"play-mark\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"./" + escapeHTML(movie.file) + "\">" + escapeHTML(movie.title) + "</a></h3>",
            "<p>" + escapeHTML(movie.oneLine) + "</p>",
            "<div class=\"movie-meta\"><a href=\"./" + escapeHTML(movie.categoryFile) + "\">" + escapeHTML(movie.category) + "</a><span>" + escapeHTML(movie.type) + "</span></div>",
            "<div class=\"tag-list\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function setupSearchPage() {
        var grid = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        var title = document.getElementById("search-title");
        if (!grid || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }

        function render(value) {
            var keyword = String(value || "").trim().toLowerCase();
            var results = window.SEARCH_INDEX.filter(function (movie) {
                if (!keyword || keyword === "all") {
                    return true;
                }
                return movie.searchText.indexOf(keyword) !== -1;
            }).slice(0, 180);
            grid.innerHTML = results.map(movieCard).join("");
            if (title) {
                title.textContent = keyword && keyword !== "all" ? "匹配结果" : "推荐影片";
            }
        }

        render(query || "all");

        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-search-chip]"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-search-chip");
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                if (input) {
                    input.value = value === "all" ? "" : value;
                }
                render(value);
            });
        });
    }

    ready(function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupFilters();
        setupSearchPage();
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        if (!video || !cover || !streamUrl) {
            return;
        }
        var started = false;
        var hls = null;

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            cover.classList.add("hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("hidden");
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("play", function () {
            cover.classList.add("hidden");
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
