import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface FolderOption {
  code: string;
  labelKey: string; // use key for translation
}

const folderOptions: FolderOption[] = [
  {
    code: "show-unread-count",
    labelKey: "folder_settings.options.show_unread_count",
  },
  { code: "auto-archive", labelKey: "folder_settings.options.auto_archive" },
  { code: "sort-by-date", labelKey: "folder_settings.options.sort_by_date" },
  { code: "sort-by-name", labelKey: "folder_settings.options.sort_by_name" },
  { code: "hide-empty", labelKey: "folder_settings.options.hide_empty" },
];

const SidebarSettingsFolders: React.FC = () => {
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
      title={t("folder_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {folderOptions.map((option) => (
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

export default SidebarSettingsFolders;
