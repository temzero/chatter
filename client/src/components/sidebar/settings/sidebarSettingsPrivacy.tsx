// SidebarSettingsPrivacy.tsx
import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarSettingsPrivacy: React.FC = () => {
  return (
    <SidebarLayout title="Privacy" backLocation={SidebarMode.SETTINGS}>
      {/* Blocked users list goes here */}
    </SidebarLayout>
  );
};

export default SidebarSettingsPrivacy;
