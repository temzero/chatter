// SidebarSettingsNotifications.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarSettingsNotifications: React.FC = () => {
  return (
    <SidebarLayout title="Notifications Settings" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
    </SidebarLayout>
  );
};

export default SidebarSettingsNotifications;
