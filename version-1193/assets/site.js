(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  document.addEventListener("DOMContentLoaded", function() {
    var button = $("[data-menu-button]");
    var menu = $("[data-mobile-menu]");

    if (button && menu) {
      button.addEventListener("click", function() {
        menu.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var slides = $all("[data-hero-slide]");
    var dots = $all("[data-hero-dot]");

    if (!slides.length || !dots.length) {
      return;
    }

    var current = 0;

    function show(index) {
      current = index;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });

    window.setInterval(function() {
      show((current + 1) % slides.length);
    }, 5000);
  }

  function setupFilters() {
    var panel = $("[data-filter-panel]");

    if (!panel) {
      return;
    }

    var input = $("[data-filter-input]", panel);
    var year = $("[data-filter-year]", panel);
    var type = $("[data-filter-type]", panel);
    var cards = $all("[data-search]");
    var empty = $("[data-empty-filter]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input && input.value);
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var yearMatch = !y || card.getAttribute("data-year") === y;
        var typeMatch = !t || card.getAttribute("data-type") === t;
        var searchMatch = !q || text.indexOf(q) !== -1;
        var matched = yearMatch && typeMatch && searchMatch;

        card.classList.toggle("hidden-by-filter", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type].forEach(function(item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
  }
})();
