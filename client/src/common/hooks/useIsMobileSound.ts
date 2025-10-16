import { useEffect, useRef } from "react";
import { audioService, SoundType } from "@/services/audio.service";

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
      audioService.playSound(SoundType.POP1, 0.3);
    } else if (prevIsMobileRef.current === true && isMobile === false) {
      // Mobile → Desktop
      audioService.playSound(SoundType.POP2, 0.3);
    }

    prevIsMobileRef.current = isMobile; // update previous value
  }, [isMobile]);
};
