(function () {
  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var playButton = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-src');
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      attachSource();
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('a')) {
        return;
      }
      playVideo();
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
