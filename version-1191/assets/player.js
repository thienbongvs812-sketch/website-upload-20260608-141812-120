function setupHlsPlayer(options) {
    var video = document.querySelector(options.selector);
    var overlay = document.querySelector(options.overlaySelector);
    var source = options.source;
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function bindSource() {
        if (initialized) {
            return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        bindSource();
        video.controls = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {
                video.controls = true;
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (!initialized) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
