// hooks/useCallSounds.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";
import { audioService, SoundType } from "@/services/audio.service";

export const useCallSounds = () => {
  const localCallStatus = useCallStore((state) => state.localCallStatus);

  useEffect(() => {
    // Stop all previous sounds first
    audioService.stopAllSounds();

    // Delay a tick to let browser reset audio state
    const timer = setTimeout(() => {
      switch (localCallStatus) {
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
          audioService.playSound(SoundType.ERROR);
          break;
        default:
          break;
      }
    }, 50); // 50ms is usually enough

    return () => {
      clearTimeout(timer);
      audioService.stopAllSounds();
    };
  }, [localCallStatus]);
};
