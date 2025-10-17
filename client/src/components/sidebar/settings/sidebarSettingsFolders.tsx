import React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";

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

  // State to track which options are enabled
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      folderOptions.forEach((opt) => (initialState[opt.code] = false));
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
      title={t("folder_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {folderOptions.map((option) => (
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

export default SidebarSettingsFolders;
