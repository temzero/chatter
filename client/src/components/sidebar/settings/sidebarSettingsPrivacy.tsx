import * as React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";

const SidebarSettingsPrivacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SidebarLayout
      title={t("privacy_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div>Coming soon...</div>
    </SidebarLayout>
  );
};

export default SidebarSettingsPrivacy;
