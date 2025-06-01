// SidebarSettingsTheme.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarSettingsTheme: React.FC = () => {
  return (
    <SidebarLayout title="Theme" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
