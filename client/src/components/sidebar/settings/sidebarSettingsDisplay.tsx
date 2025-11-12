import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";
import logger from "@/common/utils/logger";

interface DisplayOption {
  code: string;
  labelKey: string;
}

const displayOptions: DisplayOption[] = [
  { code: "animations", labelKey: "display_settings.options.animations" },
  { code: "reduce-motion", labelKey: "display_settings.options.reduce_motion" },
  { code: "high-contrast", labelKey: "display_settings.options.high_contrast" },
  {
    code: "text-size-large",
    labelKey: "display_settings.options.text_size_large",
  },
];

const SidebarSettingsDisplay: React.FC = () => {
  const { t } = useTranslation();

  // State to track which options are enabled
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    // Initialize all options to false by default
    const initialState: Record<string, boolean> = {};
    displayOptions.forEach((opt) => (initialState[opt.code] = false));
    return initialState;
  });

  const handleToggle = (code: string) => {
    setSettings((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
    logger.log("Toggled:", code, !settings[code]);
    // TODO: save to user settings / context
  };

  return (
    <SidebarLayout
      title={t("display_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="">
        {displayOptions.map((option) => (
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

export default SidebarSettingsDisplay;
