import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

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
  const [enabledOptions, setEnabledOptions] = useState<string[]>([]);

  const handleToggle = (code: string) => {
    setEnabledOptions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
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

export default SidebarSettingsNotifications;
