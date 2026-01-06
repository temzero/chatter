import { useEffect, useRef } from "react";
import { audioManager, SoundType } from "@/services/media/audioManager";

export const useIsMobileSound = (isMobile: boolean) => {
  const firstRenderRef = useRef(true);
  const prevIsMobileRef = useRef(isMobile);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      prevIsMobileRef.current = isMobile; // set initial value
      return;
    }

    if (prevIsMobileRef.current === false && isMobile === true) {
      // Desktop → Mobile
      audioManager.playSound(SoundType.POP1, 0.3);
    } else if (prevIsMobileRef.current === true && isMobile === false) {
      // Mobile → Desktop
      audioManager.playSound(SoundType.POP2, 0.3);
    }

    prevIsMobileRef.current = isMobile; // update previous value
  }, [isMobile]);
};
