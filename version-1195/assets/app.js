(function () {
    var header = document.querySelector("[data-site-header]");
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 40) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startHero();
            });
        });

        if (slides.length > 1) {
            startHero();
        }
    }

    var filterForm = document.querySelector("[data-filter-form]");
    if (filterForm) {
        var queryInput = filterForm.querySelector("[data-filter-query]");
        var typeSelect = filterForm.querySelector("[data-filter-type]");
        var regionSelect = filterForm.querySelector("[data-filter-region]");
        var yearSelect = filterForm.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);

        if (queryInput && params.get("q")) {
            queryInput.value = params.get("q");
        }
        if (typeSelect && params.get("type")) {
            typeSelect.value = params.get("type");
        }
        if (regionSelect && params.get("region")) {
            regionSelect.value = params.get("region");
        }
        if (yearSelect && params.get("year")) {
            yearSelect.value = params.get("year");
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(queryInput ? queryInput.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        filterForm.addEventListener("input", applyFilters);
        filterForm.addEventListener("change", applyFilters);
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
        });
        applyFilters();
    }
})();

function initializeMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
        return;
    }

    var panel = video.closest(".player-panel");
    var overlay = panel ? panel.querySelector("[data-play-overlay]") : null;
    var hlsPlayer = null;
    var streamReady = false;

    function bindStream() {
        if (streamReady) {
            return;
        }
        streamReady = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        bindStream();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (!streamReady) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
