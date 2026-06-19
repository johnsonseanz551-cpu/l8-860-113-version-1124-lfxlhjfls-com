(function () {
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');
    const movies = window.SITE_MOVIE_INDEX || [];
    const params = new URLSearchParams(window.location.search);

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function movieCard(movie) {
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link">' +
            '<figure class="movie-thumb">' +
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">' +
            '<span class="pill pill-left">' + escapeHtml(movie.region) + '</span>' +
            '<span class="pill pill-right">' + escapeHtml(movie.type) + '</span>' +
            '<span class="year-pill">' + escapeHtml(movie.year) + '</span>' +
            '<span class="play-mark">▶</span>' +
            '</figure>' +
            '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-genre">' + escapeHtml(movie.genre) + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function search(query) {
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
            results.innerHTML = '';
            status.textContent = '输入关键词即可查看匹配影片。';
            return;
        }

        const matched = movies.filter(function (movie) {
            const text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return text.includes(keyword);
        }).slice(0, 120);

        if (!matched.length) {
            results.innerHTML = '';
            status.textContent = '没有找到匹配影片。';
            return;
        }

        status.textContent = '为你找到相关影片：';
        results.innerHTML = matched.map(movieCard).join('');
    }

    if (input) {
        const initial = params.get('q') || '';
        input.value = initial;
        search(initial);

        input.addEventListener('input', function () {
            search(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            search(input ? input.value : '');
        });
    }
}());
