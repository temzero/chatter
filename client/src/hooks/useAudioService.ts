// hooks/useAudioService.ts
import { useState } from "react";
import { audioService, SoundType } from "@/services/audio.service";

export const useAudioService = () => {
  const [volume, setVolumeState] = useState(audioService.getVolume());

  const setVolume = (v: number) => {
    audioService.setVolume(v);
    setVolumeState(audioService.getVolume());
  };

  return {
    playSound: audioService.playSound.bind(audioService),
    stopSound: audioService.stopSound.bind(audioService),
    muteAll: audioService.muteAll.bind(audioService),
    unmuteAll: audioService.unmuteAll.bind(audioService),
    setVolume,
    volume,
    SoundType,
  };
};
