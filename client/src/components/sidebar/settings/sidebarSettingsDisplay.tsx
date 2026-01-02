import React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { TextSizeSelectionBar } from "@/components/ui/settings/textSizeSelectionBar";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";
import { useSettingsStore } from "@/stores/settingsStore"; // Import the store
import { FontStyleSelectionBar } from "@/components/ui/settings/fontStyleSelectionBar";

interface DisplayOption {
  code: keyof {
    reduceMotion: boolean;
    reduceTransparency: boolean;
    highContrast: boolean;
  };
  labelKey: string;
}

const displayOptions: DisplayOption[] = [
  { code: "reduceMotion", labelKey: "display_settings.options.reduce_motion" },
  { code: "reduceTransparency", labelKey: "display_settings.options.reduce_transparency" },
  { code: "highContrast", labelKey: "display_settings.options.high_contrast" },
];

const SidebarSettingsDisplay: React.FC = () => {
  const { t } = useTranslation();
  
  // Use the Zustand store instead of local state
  const displaySettings = useSettingsStore((state) => state.displaySettings);
  const updateDisplaySettings = useSettingsStore((state) => state.updateDisplaySettings);

  const handleToggle = (code: DisplayOption["code"]) => {
    // Update the specific setting in the store
    updateDisplaySettings({
      [code]: !displaySettings[code]
    });
  };

  return (
    <SidebarLayout
      title={t("display_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="settings-option flex-col gap-2.5 items-start!">
        <h1>{t("display_settings.options.text_size")}</h1>
        <TextSizeSelectionBar />
      </div>
      <div className="settings-option flex-col gap-2.5 items-start!">
        <h1>{t("display_settings.options.font_style")}</h1>
        <FontStyleSelectionBar />
      </div>
      {displayOptions.map((option) => (
        <div key={option.code} className="settings-option">
          <span>{t(option.labelKey)}</span>
          <SwitchBtn
            checked={displaySettings[option.code]}
            onCheckedChange={() => handleToggle(option.code)}
          />
        </div>
      ))}
    </SidebarLayout>
  );
};

export default SidebarSettingsDisplay;