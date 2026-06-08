import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let index = 0;
  let timer = null;

  function activate(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot) => {
      dot.classList.toggle('is-active', Number(dot.dataset.heroDot) === index);
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => activate(index + 1), 5200);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      activate(Number(dot.dataset.heroDot || 0));
      restartTimer();
    });
  });

  activate(0);
  restartTimer();
}

function initCardFilter() {
  const input = document.querySelector('.js-card-filter');
  const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));

  if (!input || !cards.length) {
    return;
  }

  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.textContent,
      ].join(' ').toLowerCase();

      card.hidden = keyword.length > 0 && !haystack.includes(keyword);
    });
  });
}

function createSearchCard(movie) {
  const article = document.createElement('article');
  article.className = 'movie-card';
  article.dataset.title = movie.title;
  article.dataset.region = movie.regionGroup;
  article.dataset.type = movie.typeGroup;
  article.dataset.year = movie.year;
  article.dataset.genre = `${movie.genre} ${movie.tags}`;

  const tagHtml = String(movie.tags || movie.genre || '')
    .split(/[,，、/｜|\s]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');

  article.innerHTML = `
    <a class="poster-frame" href="./${movie.url}" aria-label="播放 ${escapeHtml(movie.title)}">
      <img src="./${movie.image}" alt="${escapeHtml(movie.title)} 封面" loading="lazy" data-image>
      <span class="poster-badge">${escapeHtml(movie.year)}</span>
      <span class="poster-play">▶</span>
    </a>
    <div class="movie-card-body">
      <div class="movie-meta-line">
        <span>${escapeHtml(movie.region)}</span>
        <span>${escapeHtml(movie.type)}</span>
      </div>
      <h3><a href="./${movie.url}">${escapeHtml(movie.title)}</a></h3>
      <p>${escapeHtml(movie.oneLine)}</p>
      <div class="tag-row">${tagHtml}</div>
    </div>
  `;

  return article;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const page = document.querySelector('[data-search-page]');

  if (!page || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const form = page.querySelector('[data-search-form]');
  const results = page.querySelector('[data-search-results]');
  const summary = page.querySelector('[data-search-summary]');
  const params = new URLSearchParams(window.location.search);

  form.q.value = params.get('q') || '';
  form.region.value = params.get('region') || '';
  form.type.value = params.get('type') || '';
  form.year.value = params.get('year') || '';

  function render() {
    const keyword = form.q.value.trim().toLowerCase();
    const region = form.region.value;
    const type = form.type.value;
    const year = form.year.value.trim();

    const matched = window.MOVIE_SEARCH_DATA.filter((movie) => {
      const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
        .join(' ')
        .toLowerCase();

      if (keyword && !haystack.includes(keyword)) {
        return false;
      }

      if (region && movie.regionGroup !== region) {
        return false;
      }

      if (type && movie.typeGroup !== type) {
        return false;
      }

      if (year && !String(movie.year).includes(year)) {
        return false;
      }

      return true;
    }).slice(0, 120);

    results.innerHTML = '';
    matched.forEach((movie) => results.appendChild(createSearchCard(movie)));

    const total = window.MOVIE_SEARCH_DATA.length;
    if (matched.length) {
      summary.textContent = `共检索到 ${matched.length} 条结果（最多展示 120 条），全站影片 ${total} 部。`;
    } else {
      summary.textContent = `没有找到匹配影片，请尝试更短的关键词。全站影片 ${total} 部。`;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = new URLSearchParams(new FormData(form));
    window.history.replaceState(null, '', `${window.location.pathname}?${next.toString()}`);
    render();
  });

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video[data-video-src]');
    const button = player.querySelector('[data-play]');

    if (!video || !button) {
      return;
    }

    const source = video.dataset.videoSrc;
    let hlsInstance = null;

    function loadAndPlay() {
      if (!source) {
        return;
      }

      if (!video.dataset.loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        video.dataset.loaded = 'true';
      }

      button.classList.add('is-hidden');
      video.controls = true;
      video.play().catch(() => {
        button.classList.remove('is-hidden');
      });
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('play', () => button.classList.add('is-hidden'));

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

function initImageFallbacks() {
  document.querySelectorAll('img[data-image]').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    }, { once: true });
  });
}

ready(() => {
  initMobileMenu();
  initHero();
  initCardFilter();
  initSearchPage();
  initPlayers();
  initImageFallbacks();
});
