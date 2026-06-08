(function () {
    const hlsSourceUrl = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    let hlsLoaderPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = hlsSourceUrl;
            script.async = true;
            script.onload = () => resolve(window.Hls || null);
            script.onerror = () => reject(new Error("hls"));
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function initMoviePlayer(video, button, cover, streamUrl) {
        if (!video || !streamUrl) {
            return;
        }

        let initialized = false;

        async function attachStream() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            try {
                const HlsLibrary = await loadHlsLibrary();
                if (HlsLibrary && HlsLibrary.isSupported()) {
                    const hls = new HlsLibrary({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = streamUrl;
                }
            } catch (error) {
                video.src = streamUrl;
            }
        }

        async function playVideo() {
            await attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            try {
                await video.play();
            } catch (error) {
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", () => {
            if (video.paused) {
                playVideo();
            }
        });
    }

    function initMobileNavigation() {
        const toggle = document.querySelector(".menu-toggle");
        const mobileNav = document.querySelector(".mobile-nav");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", () => {
            const opened = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            toggle.textContent = opened ? "×" : "☰";
        });
    }

    function initHeroSlider() {
        const slides = Array.from(document.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll(".hero-dot"));
        const prev = document.querySelector(".hero-prev");
        const next = document.querySelector(".hero-next");

        if (!slides.length) {
            return;
        }

        let index = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, current) => {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle("active", current === index);
            });
        }

        if (prev) {
            prev.addEventListener("click", () => show(index - 1));
        }

        if (next) {
            next.addEventListener("click", () => show(index + 1));
        }

        dots.forEach((dot, current) => {
            dot.addEventListener("click", () => show(current));
        });

        window.setInterval(() => show(index + 1), 6500);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        const list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }

        const input = document.querySelector("[data-filter-input]");
        const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
        const cards = Array.from(list.querySelectorAll(".movie-card, .rank-row"));
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";

        if (input && q) {
            input.value = q;
        }

        function applyFilter() {
            const keyword = normalize(input ? input.value : "");
            const selected = new Map();

            selects.forEach(select => {
                selected.set(select.dataset.filterSelect, normalize(select.value));
            });

            cards.forEach(card => {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));

                let visible = !keyword || text.includes(keyword);

                selected.forEach((value, key) => {
                    if (value && normalize(card.dataset[key]) !== value) {
                        visible = false;
                    }
                });

                card.classList.toggle("hidden-by-filter", !visible);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        selects.forEach(select => {
            select.addEventListener("change", applyFilter);
        });

        applyFilter();
    }

    function initHeaderState() {
        const header = document.querySelector(".site-header");
        if (!header) {
            return;
        }

        const update = () => {
            header.classList.toggle("scrolled", window.scrollY > 40);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    window.initMoviePlayer = initMoviePlayer;

    initMobileNavigation();
    initHeroSlider();
    initFilters();
    initHeaderState();
})();
