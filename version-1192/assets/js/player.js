(function() {
    function createMoviePlayer(videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }

        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
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

        function start() {
            prepare();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function() {});
            }
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.createMoviePlayer = createMoviePlayer;
})();
