export async function initMoviePlayer(settings) {
    const video = document.getElementById(settings.videoId);
    const cover = document.getElementById(settings.coverId);
    const button = document.getElementById(settings.buttonId);
    let attached = false;
    let hls = null;

    if (!video || !settings.source) {
        return;
    }

    async function attach() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = settings.source;
        } else {
            const module = await import('./hls-vendor-dru42stk.js');
            const Hls = module.H;

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(settings.source);
                hls.attachMedia(video);
            } else {
                video.src = settings.source;
            }
        }

        attached = true;
    }

    async function play() {
        await attach();
        video.setAttribute('controls', 'controls');
        if (cover) {
            cover.classList.add('is-hidden');
        }
        try {
            await video.play();
        } catch (error) {
            video.setAttribute('controls', 'controls');
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
