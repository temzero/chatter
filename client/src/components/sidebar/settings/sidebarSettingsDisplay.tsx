// SidebarSettingsDisplay.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarSettingsDisplay: React.FC = () => {
  return (
    <SidebarLayout title="Display" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
    </SidebarLayout>
  );
};

export default SidebarSettingsDisplay;
