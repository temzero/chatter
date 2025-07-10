// audioManager.ts
let currentAudio: HTMLAudioElement | null = null;

export const playAudio = (audioElement: HTMLAudioElement) => {
  // Pause the currently playing audio if it exists
  if (currentAudio && currentAudio !== audioElement) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Set the new audio as current and play it
  currentAudio = audioElement;
  audioElement.play();
};

export const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};
