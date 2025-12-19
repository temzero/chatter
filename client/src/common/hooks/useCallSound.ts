// hooks/useCallSounds.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { audioManager, SoundType } from "@/services/audioManager";

export const useCallSounds = () => {
  const localCallStatus = useCallStore((state) => state.localCallStatus);

  useEffect(() => {
    // Stop all previous sounds first
    audioManager.stopAllSounds();

    // Delay a tick to let browser reset audio state
    const timer = setTimeout(() => {
      switch (localCallStatus) {
        case LocalCallStatus.OUTGOING:
          audioManager.playSound(SoundType.OUTGOING_CALL, undefined, true);
          break;
        case LocalCallStatus.INCOMING:
          audioManager.playSound(SoundType.INCOMING_CALL, undefined, true);
          break;
        // case LocalCallStatus.CONNECTED:
        //   audioManager.playSound(SoundType.CALL_CONNECTED);
        //   break;
        // case LocalCallStatus.ENDED:
        case LocalCallStatus.DECLINED:
        case LocalCallStatus.CANCELED:
        case LocalCallStatus.TIMEOUT:
          audioManager.playSound(SoundType.CALL_END);
          break;
        case LocalCallStatus.ERROR:
          audioManager.playSound(SoundType.ERROR);
          break;
        default:
          break;
      }
    }, 100); // 50ms is usually enough

    return () => {
      clearTimeout(timer);
      audioManager.stopAllSounds();
    };
  }, [localCallStatus]);
};
