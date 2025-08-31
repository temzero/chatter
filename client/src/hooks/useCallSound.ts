// hooks/useCallSounds.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallStatus } from "@/types/enums/CallStatus";
import { audioService, SoundType } from "@/services/audio.service";

export const useCallSounds = () => {
  const callStatus = useCallStore((state) => state.callStatus);

  useEffect(() => {
    // First: stop ALL possible call-related sounds before starting a new one
    audioService.stopAllSounds();

    switch (callStatus) {
      case CallStatus.OUTGOING:
        audioService.playSound(SoundType.OUTGOING_CALL);
        break;

      case CallStatus.INCOMING:
        audioService.playSound(SoundType.INCOMING_CALL);
        break;

      case CallStatus.CONNECTED:
        audioService.playSound(SoundType.CALL_CONNECTED);
        break;

      case CallStatus.ENDED:
      case CallStatus.REJECTED:
      case CallStatus.CANCELED:
        audioService.playSound(SoundType.CALL_END);
        break;

      case CallStatus.ERROR:
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
