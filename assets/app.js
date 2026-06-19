(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.hasAttribute('hidden');
      mobilePanel.toggleAttribute('hidden', !open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    prev?.addEventListener('click', () => {
      show(index - 1);
      start();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      start();
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  document.querySelectorAll('[data-filter-page]').forEach((page) => {
    const input = page.querySelector('[data-card-search]');
    const sort = page.querySelector('[data-card-sort]');
    const list = page.querySelector('[data-card-list]');
    const cards = [...page.querySelectorAll('.movie-card')];
    const count = page.querySelector('[data-result-count]');
    let activeRegion = 'all';

    const apply = () => {
      const keyword = (input?.value || '').trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase() + ' ' + Object.values(card.dataset).join(' ').toLowerCase();
        const regionOk = activeRegion === 'all' || card.dataset.region === activeRegion;
        const keywordOk = !keyword || text.includes(keyword);
        const show = regionOk && keywordOk;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });

      if (count) count.textContent = `共 ${visible} 部影片`;
    };

    const applySort = () => {
      if (!list || !sort) return;
      const value = sort.value;
      const sorted = [...cards].sort((a, b) => {
        if (value === 'year-desc') return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        if (value === 'year-asc') return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        if (value === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
        return 0;
      });
      sorted.forEach((card) => list.appendChild(card));
      apply();
    };

    input?.addEventListener('input', apply);
    sort?.addEventListener('change', applySort);

    page.querySelectorAll('[data-region]').forEach((button) => {
      button.addEventListener('click', () => {
        activeRegion = button.dataset.region || 'all';
        page.querySelectorAll('[data-region]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
        apply();
      });
    });
  });

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const form = searchPage.querySelector('[data-global-search-form]');
    const input = searchPage.querySelector('[data-global-search-input]');
    const results = searchPage.querySelector('[data-global-search-results]');
    const count = searchPage.querySelector('[data-global-search-count]');
    let data = [];

    const card = (movie) => `
      <article class="movie-card">
        <a href="${movie.url}" class="movie-card-link" aria-label="观看 ${escapeHtml(movie.title)}">
          <div class="movie-thumb">
            <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="year-badge">${escapeHtml(movie.year)}</span>
            <span class="play-badge">▶</span>
          </div>
          <div class="movie-info">
            <p class="movie-kicker">${escapeHtml(movie.category)}</p>
            <h3>${escapeHtml(movie.title)}</h3>
            <p class="movie-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.type)} · ${escapeHtml(movie.year)}</p>
            <p class="movie-desc">${escapeHtml(movie.oneLine || movie.summary || '')}</p>
          </div>
        </a>
      </article>`;

    const render = (keyword) => {
      const q = keyword.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        count.textContent = '输入关键词开始搜索';
        return;
      }
      const matched = data.filter((movie) => {
        const text = [
          movie.title,
          movie.region,
          movie.regionGroup,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.summary,
          ...(movie.tags || [])
        ].join(' ').toLowerCase();
        return text.includes(q);
      }).slice(0, 120);
      count.textContent = `找到 ${matched.length} 条结果${matched.length === 120 ? '，已显示前 120 条' : ''}`;
      results.innerHTML = matched.map(card).join('');
    };

    const bootSearch = (json) => {
      data = Array.isArray(json) ? json : [];
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      input.value = q;
      render(q);
    };

    if (Array.isArray(window.MOVIE_DATA)) {
      bootSearch(window.MOVIE_DATA);
    } else {
      fetch('./assets/movies.json')
        .then((response) => response.json())
        .then(bootSearch)
        .catch(() => {
          count.textContent = '搜索数据加载失败，请刷新页面重试';
        });
    }

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const q = input.value || '';
      const url = new URL(window.location.href);
      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
      render(q);
    });

    searchPage.querySelectorAll('[data-search-word]').forEach((button) => {
      button.addEventListener('click', () => {
        input.value = button.dataset.searchWord || '';
        form?.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
