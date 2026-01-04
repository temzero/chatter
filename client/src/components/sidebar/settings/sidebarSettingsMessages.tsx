import * as React from "react";
import { useTranslation } from "react-i18next";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useSettingsStore, MessageSettings } from "@/stores/settingsStore";
import { MessageReadInfoSelectionDots } from "@/components/ui/selectionDots/MessageReadInfoSelectionDots";
import MessageStyleSelector from "@/components/ui/settings/MessageStyleSelector";
import MessageTailSelector from "@/components/ui/settings/MessageTailSelector";
import SwitchBtn from "@/components/ui/buttons/SwitchBtn";
import SidebarLayout from "@/layouts/SidebarLayout";

interface MessageOption {
  code: keyof MessageSettings; // Use the actual keys from MessageSettings
  label: string;
}

const messageOptions: MessageOption[] = [
  {
    code: "hideTypingIndicator",
    label: "message_settings.options.hide_typing_indicator",
  },
];

const SidebarSettingsMessages: React.FC = () => {
  const { t } = useTranslation();

  // Get the toggle function and current state from Zustand
  const toggleTypingIndicator = useSettingsStore(
    (state) => state.toggleTypingIndicator
  );
  const hideTypingIndicator = useSettingsStore(
    (state) => state.messageSettings.hideTypingIndicator
  );

  // Or use the custom hook you already created:
  // const hideTypingIndicator = useIsHideTypingIndicator();

  const handleToggle = (code: keyof MessageSettings) => {
    if (code === "hideTypingIndicator") {
      toggleTypingIndicator();
      console.log("Toggled hideTypingIndicator to:", !hideTypingIndicator);
    }
  };

  return (
    <SidebarLayout
      title={t("message_settings.title")}
      backLocation={SidebarMode.SETTINGS}
    >
      <div className="flex flex-col">
        {messageOptions.map((option) => (
          <div key={option.code} className="settings-option">
            <span>{t(option.label)}</span>
            <SwitchBtn
              checked={
                option.code === "hideTypingIndicator"
                  ? hideTypingIndicator
                  : false
              }
              onCheckedChange={() => handleToggle(option.code)}
            />
          </div>
        ))}
      </div>

      <div className="settings-option flex-col gap-2.5 items-start!">
        <h1>{t("message_settings.options.read_info")}</h1>
        <MessageReadInfoSelectionDots />
      </div>

      <div className="settings-option flex-col gap-3 items-start!">
        <h1>{t("message_settings.options.message_bubble_style")}</h1>
        <MessageStyleSelector />
        {/* <div className="w-full h-px my-2 bg-(--border-color)"/> */}
        <MessageTailSelector />
      </div>
    </SidebarLayout>
  );
};

export default SidebarSettingsMessages;
