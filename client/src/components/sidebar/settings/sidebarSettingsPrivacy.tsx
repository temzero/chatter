import * as React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import { EndToEndEncryption } from "@/components/ui/EndtoEndEncryption";

const SidebarSettingsPrivacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SidebarLayout
      title={t("privacy_settings.title")}
      backLocation={SidebarMode.SETTINGS}
      padding
    >
      <EndToEndEncryption/>
    </SidebarLayout>
  );
};

export default SidebarSettingsPrivacy;
