// SidebarSettingsTheme.tsx
import * as React from "react";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import ThemeSelector from "@/components/ui/buttons/ThemeSelector";

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
