document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dotsBox = carousel.querySelector("[data-hero-dots]");
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function renderDots() {
      if (!dotsBox) {
        return;
      }

      dotsBox.innerHTML = "";
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === current ? "hero-dot active" : "hero-dot";
        dot.setAttribute("aria-label", "切换焦点影片");
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
        dotsBox.appendChild(dot);
      });
    }

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      renderDots();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  document.querySelectorAll("[data-card-filter]").forEach(function (input) {
    var list = document.querySelector("[data-card-list]") || document;
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input.hasAttribute("data-query-sync") && initial) {
      input.value = initial;
    }

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        card.classList.toggle("hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  });
});
