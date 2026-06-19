(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = qsa("[data-hero-slide]");
        var dots = qsa("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function initGlobalSearch() {
        qsa("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function initImageFallback() {
        qsa("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.style.opacity = "0";
                if (img.parentElement) {
                    img.parentElement.classList.add("cover-empty");
                }
            }, { once: true });
        });
    }

    function initCardFilter() {
        var input = qs("[data-card-filter]");
        var select = qs("[data-card-select]");
        var cards = qsa("[data-card]");
        var status = qs("[data-filter-status]");
        if (!cards.length || (!input && !select)) {
            return;
        }
        function apply() {
            var keyword = normalize(input && input.value);
            var selected = normalize(select && select.value);
            var shown = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var selectMatch = !selected || text.indexOf(selected) !== -1;
                var visible = keywordMatch && selectMatch;
                card.classList.toggle("is-hidden-card", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (status) {
                status.textContent = keyword || selected ? "匹配到 " + shown + " 部影片" : "";
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
    }

    function createSearchCard(item) {
        var tag = item.tags && item.tags.length ? item.tags.slice(0, 3).map(function (value) {
            return "<span>" + escapeHtml(value) + "</span>";
        }).join("") : "";
        return "<article class=\"movie-card\">" +
            "<a class=\"card-link\" href=\"" + escapeHtml(item.href) + "\">" +
            "<span class=\"cover-frame\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"card-badge\">" + escapeHtml(item.category) + "</span></span>" +
            "<span class=\"card-body\"><strong>" + escapeHtml(item.title) + "</strong><span class=\"card-desc\">" + escapeHtml(item.desc) + "</span>" +
            "<span class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span class=\"rating\">★ " + escapeHtml(item.rating) + "</span></span>" +
            "<span class=\"tag-line\">" + tag + "</span></span></a></article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initSearchPage() {
        var data = window.SEARCH_MOVIES || [];
        var form = qs("[data-search-page-form]");
        var input = qs("[data-search-input]");
        var results = qs("[data-search-results]");
        var title = qs("[data-search-title]");
        if (!form || !input || !results || !data.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render(query) {
            var key = normalize(query);
            if (!key) {
                if (title) {
                    title.textContent = "热门推荐";
                }
                return;
            }
            var list = data.filter(function (item) {
                return normalize([
                    item.title,
                    item.category,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.tags.join(" "),
                    item.desc
                ].join(" ")).indexOf(key) !== -1;
            }).slice(0, 120);
            if (title) {
                title.textContent = "搜索：" + query;
            }
            results.innerHTML = list.length ? list.map(createSearchCard).join("") : "<p class=\"filter-note\">没有找到匹配影片</p>";
            initImageFallback();
        }
        render(initial);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var nextUrl = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
            window.history.replaceState(null, "", nextUrl);
            render(value);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initImageFallback();
        initCardFilter();
        initSearchPage();
    });
}());
