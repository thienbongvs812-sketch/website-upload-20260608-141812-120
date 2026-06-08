(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = !document.body.classList.contains("menu-open");
            document.body.classList.toggle("menu-open", open);
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function initSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-target") || "search.html";
                var query = input ? input.value.trim() : "";
                var url = query ? target + "?q=" + encodeURIComponent(query) : target;
                window.location.href = url;
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("active", Number(dot.getAttribute("data-hero-dot")) === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                schedule();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }

        schedule();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var container = document.querySelector("[data-card-container]");
        if (!panel || !container) {
            return;
        }

        var keyword = panel.querySelector("[data-filter-keyword]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var count = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (keyword && initialQuery) {
            keyword.value = initialQuery;
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initBackToTop() {
        document.querySelectorAll(".back-to-top").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initFilters();
        initBackToTop();
    });
})();
