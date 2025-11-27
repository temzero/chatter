import * as React from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";

interface KeyboardOption {
  code: string;
  labelKey: string;
}

const keyboardOptions: KeyboardOption[] = [
  { code: "enter-send", labelKey: "keyboard_settings.options.enter_send" },
  {
    code: "ctrl-enter-send",
    labelKey: "keyboard_settings.options.ctrl_enter_send",
  },
  { code: "vim-mode", labelKey: "keyboard_settings.options.vim_mode" },
  { code: "emacs-mode", labelKey: "keyboard_settings.options.emacs_mode" },
];

const SidebarSettingsKeyboard: React.FC = () => {
  const { t } = useTranslation();

  // For toggle switches, we can store state in a record
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      keyboardOptions.forEach((opt) => (initialState[opt.code] = false));
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
      title={t("settings.keyboard")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {keyboardOptions.map((option) => (
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

export default SidebarSettingsKeyboard;
