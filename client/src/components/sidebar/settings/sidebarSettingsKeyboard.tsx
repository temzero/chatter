import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";

interface KeyboardOption {
  code: string;
  labelKey: string; // key for translation
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
  const [selectedOption, setSelectedOption] = useState<string>("enter-send");

  const handleSelect = (code: string) => {
    setSelectedOption(code);
    // TODO: save to user settings / context
  };

  return (
    <SidebarLayout
      title={t("settings.keyboard")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {keyboardOptions.map((option) => (
          <div
            key={option.code}
            onClick={() => handleSelect(option.code)}
            className={`settings-item ${
              selectedOption === option.code ? "selected" : ""
            }`}
          >
            <span>{t(option.labelKey)}</span>
            {selectedOption === option.code && (
              <span className="font-bold">✓</span>
            )}
          </div>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsKeyboard;
