(function () {
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-menu-toggle]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var index = 0;
  var timer = null;

  function setSlide(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setSlide(index + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      stopHero();
      setSlide(index - 1);
      startHero();
    });
  });

  document.querySelectorAll('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      stopHero();
      setSlide(index + 1);
      startHero();
    });
  });

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      stopHero();
      setSlide(dotIndex);
      startHero();
    });
  });

  setSlide(0);
  startHero();

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterForms.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-search]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedType && matchedRegion && matchedYear));
      });
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  function playVideo(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-src') || (video ? video.getAttribute('data-src') : '');

    if (!video || !source) {
      return;
    }

    shell.classList.add('is-playing');

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      video._hlsPlayer = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }

      video.play().catch(function () {});
    } else {
      if (video.src !== source) {
        video.src = source;
      }

      video.play().catch(function () {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target.closest('[data-play]') || event.target === shell) {
        playVideo(shell);
      }
    });
  });
})();
