// components/SidebarLayout.tsx
import * as React from "react";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";

interface BackLocation {
  mode: SidebarMode;
  data?: unknown;
}

interface SidebarLayoutProps {
  title: string;
  children?: React.ReactNode;
  backLocation?: SidebarMode | BackLocation;
  rightButton?: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  title,
  children,
  backLocation = SidebarMode.MORE,
  rightButton,
}) => {
  const setSidebar = getSetSidebar();

  const handleBackClick = () => {
    if (typeof backLocation === "object") {
      setSidebar(backLocation.mode, backLocation.data);
    } else {
      setSidebar(backLocation);
    }
  };

  return (
    <aside className="h-full w-full relative flex flex-col overflow-x-hidden">
      <header className="flex w-full justify-between items-center min-h-(--header-height) custom-border-b select-none">
        <div className="flex items-center">
          <button className="nav-btn" onClick={handleBackClick}>
            <i className="material-symbols-outlined">arrow_back</i>
          </button>
          <h1 className="font-semibold text-lg truncate">{title}</h1>
        </div>
        {rightButton ? (
          rightButton
        ) : (
          <button
            className="nav-btn"
            onClick={() => setSidebar(SidebarMode.DEFAULT)}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
};

export default SidebarLayout;
