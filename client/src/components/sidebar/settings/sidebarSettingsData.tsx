import React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SwitchBtn from "@/components/ui/SwitchBtn";

interface DataOption {
  code: string;
  labelKey: string;
}

const dataOptions: DataOption[] = [
  {
    code: "auto-download-media",
    labelKey: "data_settings.options.auto_download_media",
  },
  { code: "limit-storage", labelKey: "data_settings.options.limit_storage" },
  { code: "clear-cache", labelKey: "data_settings.options.clear_cache" },
  { code: "low-data-mode", labelKey: "data_settings.options.low_data_mode" },
  {
    code: "backup-messages",
    labelKey: "data_settings.options.backup_messages",
  },
];

const SidebarSettingsData: React.FC = () => {
  const { t } = useTranslation();

  // State to track which options are enabled
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      dataOptions.forEach((opt) => (initialState[opt.code] = false));
      return initialState;
    }
  );

  const handleToggle = (code: string) => {
    setSettings((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
    console.log("Toggled:", code, !settings[code]);
    // TODO: save to user settings / context
  };

  return (
    <SidebarLayout
      title={t("data_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {dataOptions.map((option) => (
          <div key={option.code} className="settings-option">
            <span>{t(option.labelKey)}</span>
            <SwitchBtn
              checked={settings[option.code]}
              onCheckedChange={() => handleToggle(option.code)}
            />
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsData;
