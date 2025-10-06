import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface MessageOption {
  code: string;
  labelKey: string; // key for translation
}

const messageOptions: MessageOption[] = [
  { code: "read-receipts", labelKey: "message_settings.options.read_receipts" },
  {
    code: "typing-indicators",
    labelKey: "message_settings.options.typing_indicators",
  },
  {
    code: "auto-download-media",
    labelKey: "message_settings.options.auto_download_media",
  },
  {
    code: "desktop-notifications",
    labelKey: "message_settings.options.desktop_notifications",
  },
];

const SidebarSettingsMessages: React.FC = () => {
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
      title={t("message_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {messageOptions.map((option) => (
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

export default SidebarSettingsMessages;
