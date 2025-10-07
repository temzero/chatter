import React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SwitchBtn from "@/components/ui/SwitchBtn";

interface NotificationOption {
  code: string;
  labelKey: string; // use translation key
}

const notificationOptions: NotificationOption[] = [
  {
    code: "message-sounds",
    labelKey: "notification_settings.options.message_sounds",
  },
  {
    code: "desktop-banners",
    labelKey: "notification_settings.options.desktop_banners",
  },
  {
    code: "mentions-only",
    labelKey: "notification_settings.options.mentions_only",
  },
  {
    code: "email-notifications",
    labelKey: "notification_settings.options.email_notifications",
  },
  { code: "vibrate", labelKey: "notification_settings.options.vibrate" },
];

const SidebarSettingsNotifications: React.FC = () => {
  const { t } = useTranslation();

  // State to track which options are enabled
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      notificationOptions.forEach((opt) => (initialState[opt.code] = false));
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
      title={t("notification_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {notificationOptions.map((option) => (
          <div
            key={option.code}
            className="settings-option"
          >
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

export default SidebarSettingsNotifications;
