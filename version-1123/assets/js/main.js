(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
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
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var playerCard = document.querySelector('[data-player-source]');

    if (playerCard) {
        var player = playerCard.querySelector('video');
        var playerButton = playerCard.querySelector('[data-player-button]');
        var playerStatus = playerCard.querySelector('[data-player-status]');
        var source = playerCard.getAttribute('data-player-source');
        var loaded = false;
        var hlsInstance = null;

        var setStatus = function (text) {
            if (playerStatus) {
                playerStatus.textContent = text;
            }
        };

        var loadSource = function () {
            if (!player || loaded || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(player);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('视频已就绪');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放源加载异常，请稍后重试');
                    }
                });
                loaded = true;
                return;
            }

            if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = source;
                loaded = true;
                setStatus('视频已就绪');
                return;
            }

            setStatus('当前浏览器暂不支持此播放源');
        };

        var playVideo = function () {
            loadSource();

            if (player) {
                var playPromise = player.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('点击视频区域继续播放');
                    });
                }
            }
        };

        if (playerButton) {
            playerButton.addEventListener('click', playVideo);
        }

        playerCard.addEventListener('click', function (event) {
            if (event.target.closest('button') || event.target.closest('video')) {
                return;
            }

            playVideo();
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');

    if (searchResults && window.MovieIndex) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (searchInput) {
            searchInput.value = query;
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase();
        };

        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        };

        var renderCard = function (movie) {
            var title = escapeHtml(movie.title);
            var cover = escapeHtml(movie.cover);
            var url = escapeHtml(movie.url);
            var year = escapeHtml(movie.year);
            var type = escapeHtml(movie.type);
            var score = escapeHtml(movie.score);
            var oneLine = escapeHtml(movie.oneLine);
            var genre = escapeHtml(movie.genre);

            return [
                '<article class="movie-card">',
                '    <a href="' + url + '" class="movie-card-link" aria-label="' + title + '">',
                '        <div class="poster">',
                '            <img src="' + cover + '" alt="' + title + '" loading="lazy">',
                '        </div>',
                '        <div class="movie-card-body">',
                '            <div class="movie-meta-line">',
                '                <span>' + year + '</span>',
                '                <span>' + type + '</span>',
                '                <span>' + score + '分</span>',
                '            </div>',
                '            <h3>' + title + '</h3>',
                '            <p>' + oneLine + '</p>',
                '            <div class="tag-row"><span>' + genre + '</span></div>',
                '        </div>',
                '    </a>',
                '</article>'
            ].join('');
        };

        var results = window.MovieIndex;

        if (query) {
            var key = normalize(query);
            results = window.MovieIndex.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(key) !== -1;
            });
        }

        if (!results.length) {
            searchResults.innerHTML = '<div class="empty-state">没有匹配结果</div>';
        } else {
            searchResults.innerHTML = results.slice(0, 120).map(renderCard).join('');
        }
    }
})();
