// SidebarSettingsLanguage.tsx
import React, { useState } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n/languages";

const SidebarSettingsLanguage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    i18n.language || "en"
  );

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <SidebarLayout
      title={t("settings.language")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`settings-item ${
              selectedLanguage === lang.code && "selected"
            }`}
          >
            <span>{lang.label}</span>
            {selectedLanguage === lang.code && (
              <span className="font-bold">✓</span>
            )}
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsLanguage;
