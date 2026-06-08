(function() {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
        var input = scope.querySelector('[data-list-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
        var activeChip = '全部';

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var chip = normalize(activeChip);
            cards.forEach(function(card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var chipMatch = chip === '全部' || haystack.indexOf(chip) !== -1;
                card.classList.toggle('is-hidden', !(queryMatch && chipMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                activeChip = chip.getAttribute('data-filter-chip') || '全部';
                chips.forEach(function(item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilter();
            });
        });

        if (scope.hasAttribute('data-search-page') && input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
        }

        applyFilter();
    });

    window.createM3u8Player = function(video, source, overlay, button) {
        if (!video || !source) {
            return;
        }

        var attached = false;
        var hls = null;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function() {});
            }
        }

        function attachSource() {
            if (attached) {
                playVideo();
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function() {
                    hls.loadSource(source);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    playVideo();
                });
                return;
            }

            video.src = source;
            video.load();
            playVideo();
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            hideOverlay();
            attachSource();
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('play', hideOverlay);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
