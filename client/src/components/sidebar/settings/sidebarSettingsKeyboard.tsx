// SidebarSettingsKeyboard.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarSettingsKeyboard: React.FC = () => {
  return (
    <SidebarLayout title="Keyboard" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
    </SidebarLayout>
  );
};

export default SidebarSettingsKeyboard;
