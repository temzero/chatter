// hooks/useDevice.ts
import { useEffect } from "react";
import { useDeviceStore } from "@/stores/deviceStore";

export const useDevice = (breakpoint = 800) => {
  const setIsMobile = useDeviceStore((state) => state.setIsMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial check

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile, breakpoint]);
};
