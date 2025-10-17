// SidebarSettingsTheme.tsx
import React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import ThemeSelector from "@/components/ui/buttons/ThemeSelector";
import { useTranslation } from "react-i18next";

const SidebarSettingsTheme: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SidebarLayout
      title={t("settings.theme")}
      backLocation={SidebarMode.SETTINGS}
    >
      <ThemeSelector />
    </SidebarLayout>
  );
};

export default SidebarSettingsTheme;
