import { useSettingsStore } from "@/stores/settingsStore";
import { SelectionBar, SelectionBarOption } from "../selectionBar/SelectionBar";
import { MessageReadInfoOptions } from "../../../shared/types/enums/message-setting.enum";
import { useTranslation } from "react-i18next";

export const MessageReadInfoSelectionBar = () => {
  const { t } = useTranslation();
  const options: SelectionBarOption<MessageReadInfoOptions>[] = [
    {
      value: MessageReadInfoOptions.ALL,
      label: t("common.options.all"),
      textSize: "text-sm",
    },
    {
      value: MessageReadInfoOptions.OTHER,
      label: t("common.options.other"),
      textSize: "text-sm",
    },
    {
      value: MessageReadInfoOptions.YOU,
      label: t("common.options.you"),
      textSize: "text-sm",
    },

    {
      value: MessageReadInfoOptions.NONE,
      label: t("common.options.none"),
      textSize: "text-sm",
    },
  ];

  const readInfo = useSettingsStore((state) => state.messageSettings.readInfo);
  console.log("readInfo", readInfo);
  const setReadDisplay = useSettingsStore((state) => state.setReadDisplay);

  return (
    <SelectionBar<MessageReadInfoOptions>
      options={options}
      selected={readInfo}
      onSelect={setReadDisplay}
      className="w-full h-12"
    />
  );
};
