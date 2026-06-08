(function() {
  window.setupPlayer = function(videoUrl) {
    var video = document.getElementById("main-player");
    var layer = document.getElementById("play-layer");
    var button = document.getElementById("play-button");
    var started = false;
    var hlsReady = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function canUseNative() {
      return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    function attach() {
      if (canUseNative()) {
        video.src = videoUrl;
        hlsReady = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });

        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          hlsReady = true;
          if (started) {
            playNow();
          }
        });
      } else {
        video.src = videoUrl;
        hlsReady = true;
      }
    }

    function playNow() {
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }

    function start() {
      started = true;

      if (layer) {
        layer.classList.add("is-hidden");
      }

      video.controls = true;

      if (hlsReady) {
        playNow();
      }
    }

    attach();

    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (layer) {
      layer.addEventListener("click", function() {
        start();
      });
    }

    video.addEventListener("play", function() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
