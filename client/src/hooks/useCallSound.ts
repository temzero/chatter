// hooks/useCallSounds.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallStatus } from "@/types/enums/CallStatus";
import { audioService, SoundType } from "@/services/audio.service";

export const useCallSounds = () => {
  const callStatus = useCallStore((state) => state.callStatus);

  useEffect(() => {
    switch (callStatus) {
      case CallStatus.OUTGOING:
        audioService.playSound(SoundType.OUTGOING_CALL);
        break;
      case CallStatus.INCOMING:
        audioService.playSound(SoundType.INCOMING_CALL);
        break;

      case CallStatus.CONNECTED:
        audioService.stopSound(SoundType.CALL_CONNECTED);
        break;

      case CallStatus.ENDED:
      case CallStatus.REJECTED:
      case CallStatus.CANCELED:
        audioService.playSound(SoundType.CALL_END);
        audioService.stopSound(SoundType.INCOMING_CALL);
        break;

      default:
        audioService.stopSound(SoundType.INCOMING_CALL);
    }

    return () => {
      // Cleanup on unmount
      audioService.stopSound(SoundType.INCOMING_CALL);
    };
  }, [callStatus]);
};
