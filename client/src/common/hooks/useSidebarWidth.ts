import {
  compactSupportedSidebars,
  useCurrentSidebar,
  useIsCompactSidebar,
} from "@/stores/sidebarStore";
import { useIsMobile } from "@/stores/deviceStore";
import { SIDEBAR_WIDTHS } from "../constants/sidebarWidth";

// hooks/useSidebarWidth.ts
export const useSidebarWidth = () => {
  const isMobile = useIsMobile();
  const currentSidebar = useCurrentSidebar();
  const isSidebarCompact = useIsCompactSidebar();

  if (isMobile) return SIDEBAR_WIDTHS.MOBILE;

  const getSidebarWidth = () => {
    // Default behavior
    const compactSupported = compactSupportedSidebars.includes(currentSidebar);
    return compactSupported && isSidebarCompact
      ? SIDEBAR_WIDTHS.DESKTOP_COMPACT
      : SIDEBAR_WIDTHS.DESKTOP;
  };

  return getSidebarWidth();
};
