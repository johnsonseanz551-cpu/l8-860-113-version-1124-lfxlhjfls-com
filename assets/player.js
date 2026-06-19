import { H as Hls } from './video-dru42stk.js';

document.querySelectorAll('[data-player]').forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const message = player.querySelector('[data-player-message]');
  const source = player.dataset.src;
  let hls = null;
  let loaded = false;

  if (!video || !button || !source) return;

  const setMessage = (text) => {
    if (message) message.textContent = text || '';
  };

  const loadSource = () => {
    if (loaded) return Promise.resolve();
    loaded = true;
    setMessage('正在加载高清播放源...');

    return new Promise((resolve, reject) => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('');
          resolve();
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setMessage('视频加载失败，请稍后重试。');
            reject(new Error(data.details || 'HLS fatal error'));
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
          setMessage('');
          resolve();
        }, { once: true });
      } else {
        const error = new Error('当前浏览器不支持 HLS 播放');
        setMessage(error.message);
        reject(error);
      }
    });
  };

  const play = async () => {
    try {
      await loadSource();
      video.controls = true;
      await video.play();
      player.classList.add('is-playing');
      setMessage('');
    } catch (error) {
      video.controls = true;
      setMessage('播放未自动开始，请使用播放器控制栏重试。');
    }
  };

  button.addEventListener('click', play);
  video.addEventListener('play', () => player.classList.add('is-playing'));
  video.addEventListener('pause', () => {
    if (!video.ended) return;
    player.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', () => {
    if (hls) hls.destroy();
  });
});
