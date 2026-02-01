// services/mediaManager.ts
type MediaPlayer = HTMLMediaElement | { pause: () => void };

let currentMedia: MediaPlayer | null = null;

const mediaManager = {
  /**
   * Play the given media element, pausing any previous one
   */
  play(media: MediaPlayer) {
    if (currentMedia && currentMedia !== media) {
      currentMedia.pause();
    }
    currentMedia = media;
    try {
      if ("play" in media) media.play();
    } catch (err) {
      console.warn("Autoplay blocked", err);
    }
  },

  /**
   * Pause the given media if it is currently playing
   */
  stop(media: MediaPlayer) {
    if (currentMedia === media) currentMedia = null;
    media.pause();
  },

  /**
   * Stop all media
   */
  stopAll() {
    if (currentMedia) {
      currentMedia.pause();
      currentMedia = null;
    }
  },
};

export default mediaManager;
