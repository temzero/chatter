import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface DataOption {
  code: string;
  labelKey: string; // translation key
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
  const [enabledOptions, setEnabledOptions] = useState<string[]>([]);

  const handleToggle = (code: string) => {
    setEnabledOptions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    // TODO: save to user settings / context
  };

  return (
    <SidebarLayout
      title={t("data_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {dataOptions.map((option) => (
          <div
            key={option.code}
            onClick={() => handleToggle(option.code)}
            className={`settings-item ${
              enabledOptions.includes(option.code) ? "selected" : ""
            }`}
          >
            <span>{t(option.labelKey)}</span>
            {enabledOptions.includes(option.code) && (
              <span className="font-bold">✓</span>
            )}
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsData;
