// // services/mediaManager.ts
// type MediaPlayer = HTMLMediaElement | { pause: () => void };

import WaveSurfer from "wavesurfer.js";

// let currentMedia: MediaPlayer | null = null;

// const mediaManager = {
//   /**
//    * Play the given media element, pausing any previous one
//    */
//   play(media: MediaPlayer) {
//     if (currentMedia && currentMedia !== media) {
//       currentMedia.pause();
//     }
//     currentMedia = media;
//     try {
//       if ("play" in media) media.play();
//     } catch (err) {
//       console.warn("Autoplay blocked", err);
//     }
//   },

//   /**
//    * Pause the given media if it is currently playing
//    */
//   stop(media: MediaPlayer) {
//     if (currentMedia === media) currentMedia = null;
//     media.pause();
//   },

//   /**
//    * Stop all media
//    */
//   stopAll() {
//     if (currentMedia) {
//       currentMedia.pause();
//       currentMedia = null;
//     }
//   },
// };

// export default mediaManager

// services/mediaManager.ts
type MediaPlayer =
  | HTMLMediaElement
  | { pause: () => void; isPlaying?: () => boolean }
  | WaveSurfer;

let currentMedia: MediaPlayer | null = null;

const mediaManager = {
  /**
   * Play the given media element, pausing any previous one
   */
  play(media: MediaPlayer) {
    if (currentMedia && currentMedia !== media) {
      // Check if it's a WaveSurfer instance or HTMLMediaElement
      if (
        "isPlaying" in currentMedia &&
        typeof currentMedia.isPlaying === "function" &&
        currentMedia.isPlaying()
      ) {
        currentMedia.pause();
      } else if ("pause" in currentMedia) {
        currentMedia.pause();
      }
    }
    currentMedia = media;
    try {
      if ("play" in media) {
        media.play();
      }
    } catch (err) {
      console.warn("Autoplay blocked", err);
    }
  },

  /**
   * Pause the given media if it is currently playing
   */
  stop(media: MediaPlayer) {
    if (currentMedia === media) currentMedia = null;
    if ("pause" in media) media.pause();
  },

  /**
   * Stop all media
   */
  stopAll() {
    if (currentMedia) {
      if ("pause" in currentMedia) currentMedia.pause();
      currentMedia = null;
    }
  },
};

export default mediaManager;
