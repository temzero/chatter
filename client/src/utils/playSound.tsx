/**
 * Plays a sound from a given URL
 * @param soundUrl - Path/URL to the audio file
 * @param volume - Volume level (0.0 to 1.0, default: 0.5)
 */
export const playSound = (soundUrl: string, volume = 0.5) => {
  try {
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.play().catch((e) => console.error("Audio playback error:", e));

    // Cleanup after playback (optional)
    audio.addEventListener("ended", () => {
      audio.remove();
    });
  } catch (e) {
    console.error("Sound initialization failed:", e);
  }
};
