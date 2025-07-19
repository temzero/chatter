import defaultSound from "@/assets/sound/message-pop.mp3";

export const playSoundEffect = (soundUrl?: string, volume = 0.5) => {
  try {
    const src = soundUrl || defaultSound;
    const audio = new Audio(src);
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
