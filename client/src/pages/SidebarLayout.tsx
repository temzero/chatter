import React from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface SidebarLayoutProps {
  title: string;
  children?: React.ReactNode;
  backLocation?: SidebarMode;
  rightButton?: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  title,
  children,
  backLocation = SidebarMode.MORE,
  rightButton,
}) => {
  const { setSidebar } = useSidebarStore();

  return (
    <aside className="relative w-[var(--sidebar-width)] flex h-full flex-col">
      <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
        <div className="flex items-center">
          <i
            className="material-symbols-outlined nav-btn"
            onClick={() => setSidebar(backLocation)}
          >
            arrow_back
          </i>
          <h1 className="font-semibold text-xl">{title}</h1>
        </div>
        {rightButton ? (
          rightButton
        ) : (
          <i
            className="material-symbols-outlined nav-btn ml-auto"
            onClick={() => setSidebar(SidebarMode.DEFAULT)}
          >
            close
          </i>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
};

export default SidebarLayout;
