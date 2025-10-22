import { useEffect } from "react";
import { getSetSidebar, useSidebarStore } from "@/stores/sidebarStore";
import {
  getSetSidebarInfo,
  useSidebarInfoStore,
} from "@/stores/sidebarInfoStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { getCloseModal, useModalType } from "@/stores/modalStore";

export const useGlobalKeyListeners = () => {
  const setSidebar = getSetSidebar();
  const setSidebarInfo = getSetSidebarInfo();
  const toggleSidebarInfo = useSidebarInfoStore.getState().toggleSidebarInfo;
  const toggleCompact = useSidebarStore.getState().toggleCompact;
  const closeModal = getCloseModal();
  const modalType = useModalType();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();

      if (e.key === "F1") {
        e.preventDefault();
      }

      if (modalType) {
        if (e.key === "Escape") {
          closeModal();
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          setSidebar(SidebarMode.DEFAULT);
          setSidebarInfo(SidebarInfoMode.DEFAULT);
          break;
        case "F1":
          toggleCompact();
          break;
        case "F2":
          toggleSidebarInfo();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    modalType,
    closeModal,
    setSidebar,
    setSidebarInfo,
    toggleCompact,
    toggleSidebarInfo,
  ]);
};
