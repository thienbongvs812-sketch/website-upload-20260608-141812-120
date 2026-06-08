(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setHero(index, slides, dots) {
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function filterGrid(grid, query) {
        var text = normalize(query);
        var cards = grid.querySelectorAll("[data-search-text]");
        cards.forEach(function(card) {
            var haystack = normalize(card.getAttribute("data-search-text"));
            card.classList.toggle("is-hidden-card", text !== "" && haystack.indexOf(text) === -1);
        });
    }

    ready(function() {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var current = 0;
            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    current = Number(dot.getAttribute("data-hero-dot")) || 0;
                    setHero(current, slides, dots);
                });
            });
            window.setInterval(function() {
                current = (current + 1) % slides.length;
                setHero(current, slides, dots);
            }, 5000);
        }

        document.querySelectorAll("[data-search-input]").forEach(function(input) {
            var grid = document.querySelector("[data-search-grid]");
            input.addEventListener("input", function() {
                if (grid) {
                    filterGrid(grid, input.value);
                }
            });
        });

        var searchPageInput = document.querySelector("[data-search-page-input]");
        var searchPageGrid = document.querySelector("[data-search-grid]");
        if (searchPageInput && searchPageGrid) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            searchPageInput.value = query;
            filterGrid(searchPageGrid, query);
            searchPageInput.addEventListener("input", function() {
                filterGrid(searchPageGrid, searchPageInput.value);
            });
        }

        var filterBar = document.querySelector("[data-filter-bar]");
        var filterGridElement = document.querySelector("[data-filter-grid]");
        if (filterBar && filterGridElement) {
            filterBar.querySelectorAll("[data-filter-target]").forEach(function(button) {
                button.addEventListener("click", function() {
                    var target = button.getAttribute("data-filter-target");
                    filterBar.querySelectorAll("button").forEach(function(item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    filterGridElement.querySelectorAll("[data-filter-value]").forEach(function(card) {
                        var value = card.getAttribute("data-filter-value");
                        card.classList.toggle("is-hidden-card", target !== "all" && value !== target);
                    });
                });
            });
        }
    });
})();
