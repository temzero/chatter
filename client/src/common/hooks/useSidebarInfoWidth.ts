import { useMemo } from "react";
import { useIsMobile } from "@/stores/deviceStore";
import { SIDEBAR_WIDTHS } from "../constants/sidebarWidth";

export const useSidebarInfoWidth = () => {
  const isMobile = useIsMobile();
  return useMemo(
    () => (isMobile ? SIDEBAR_WIDTHS.MOBILE : SIDEBAR_WIDTHS.DESKTOP),
    [isMobile]
  );
};
