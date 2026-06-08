(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-category") || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function setupCardFilters() {
    var lists = selectAll("[data-card-list]");
    if (!lists.length) {
      return;
    }

    var queryInput = document.querySelector("[data-card-search]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function apply() {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";

      lists.forEach(function (list) {
        selectAll(".movie-card", list).forEach(function (card) {
          var ok = true;
          if (q && textOf(card).indexOf(q) === -1) {
            ok = false;
          }
          if (year && (card.getAttribute("data-year") || "") !== year) {
            ok = false;
          }
          if (type && (card.getAttribute("data-type") || "") !== type) {
            ok = false;
          }
          if (category && (card.getAttribute("data-category") || "") !== category) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      });
    }

    [queryInput, yearSelect, typeSelect, categorySelect].forEach(function (el) {
      if (!el) {
        return;
      }
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });

    selectAll(".inline-filter").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }

      function loadAndPlay() {
        var src = video.getAttribute("data-src");
        if (!src) {
          return;
        }

        if (!video.dataset.ready) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
          } else {
            video.src = src;
          }
          video.dataset.ready = "1";
        }

        shell.classList.add("is-playing");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      overlay.addEventListener("click", loadAndPlay);
      video.addEventListener("click", function () {
        if (!video.dataset.ready) {
          loadAndPlay();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupHero();
    setupCardFilters();
    setupPlayers();
  });
})();
