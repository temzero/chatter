// hooks/useCallSounds.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/LocalCallStatus";
import { audioService, SoundType } from "@/services/audio.service";

export const useCallSounds = () => {
  const callStatus = useCallStore((state) => state.localCallStatus);

  useEffect(() => {
    // First: stop ALL possible call-related sounds before starting a new one
    audioService.stopAllSounds();

    switch (callStatus) {
      case LocalCallStatus.OUTGOING:
        audioService.playSound(SoundType.OUTGOING_CALL);
        break;

      case LocalCallStatus.INCOMING:
        audioService.playSound(SoundType.INCOMING_CALL);
        break;

      case LocalCallStatus.CONNECTED:
        audioService.playSound(SoundType.CALL_CONNECTED);
        break;

      case LocalCallStatus.ENDED:
      case LocalCallStatus.REJECTED:
      case LocalCallStatus.CANCELED:
        audioService.playSound(SoundType.CALL_END);
        break;

      case LocalCallStatus.ERROR:
        // Stop all sounds immediately when error occurs
        audioService.stopAllSounds();
        break;

      default:
        // nothing to play
        break;
    }

    return () => {
      // Cleanup on unmount: stop all sounds
      audioService.stopAllSounds();
    };
  }, [callStatus]);
};
