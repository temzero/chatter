// SidebarSettingsTheme.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import ThemeSelector from "@/components/ui/ThemeSelector";

const SidebarSettingsTheme: React.FC = () => {
  return (
    <SidebarLayout title="Theme" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
      <ThemeSelector/>
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
