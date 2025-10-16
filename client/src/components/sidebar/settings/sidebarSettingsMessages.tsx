import React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SwitchBtn from "@/components/ui/SwitchBtn";

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

  // State to track which options are enabled
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      messageOptions.forEach((opt) => (initialState[opt.code] = false));
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
      title={t("message_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {messageOptions.map((option) => (
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

export default SidebarSettingsMessages;
