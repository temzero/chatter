import {
  compactSupportedSidebars,
  useCurrentSidebar,
  useIsCompactSidebar,
} from "@/stores/sidebarStore";
import { useIsMobile } from "@/stores/deviceStore";

// hooks/useSidebarWidth.ts
export const useSidebarWidth = () => {
  const isMobile = useIsMobile();
  const currentSidebar = useCurrentSidebar();
  const isSidebarCompact = useIsCompactSidebar();

  if (isMobile) return "w-full";

  const getSidebarWidth = () => {
    // Default behavior
    const compactSupported = compactSupportedSidebars.includes(currentSidebar);
    return compactSupported && isSidebarCompact
      ? "w-[var(--sidebar-width-small)]"
      : "w-[var(--sidebar-width)]";
  };

  return getSidebarWidth();
};
