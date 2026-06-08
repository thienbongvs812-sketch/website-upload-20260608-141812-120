document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play]");
    var stream = box.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function runPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function prepare(done) {
      if (!video || !stream) {
        done();
        return;
      }

      if (ready) {
        done();
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          done();
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }

      done();
    }

    function start() {
      if (button) {
        button.classList.add("is-hidden");
      }
      box.classList.add("is-playing");
      prepare(runPlay);
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
});
