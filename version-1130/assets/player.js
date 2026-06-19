(function () {
    window.setupSitePlayer = function (videoId, stream, triggerId) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        var hls = null;
        var ready = false;
        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.controls = true;
            ready = true;
        }

        function start() {
            prepare();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (trigger) {
            trigger.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!ready) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
}());
