import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleToggle = (code: string) => {
    setSelectedOptions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    // TODO: save to user settings / context
  };

  return (
    <SidebarLayout
      title={t("display_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {displayOptions.map((option) => (
          <div
            key={option.code}
            onClick={() => handleToggle(option.code)}
            className={`settings-item ${
              selectedOptions.includes(option.code) ? "selected" : ""
            }`}
          >
            <span>{t(option.labelKey)}</span>
            {selectedOptions.includes(option.code) && (
              <span className="font-bold">✓</span>
            )}
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsDisplay;
