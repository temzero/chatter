import { useSettingsStore } from "@/stores/settingsStore";
import { MessageReadInfoOptions } from "../../../shared/types/enums/message-setting.enum";
import { useTranslation } from "react-i18next";
import { SelectionDots, SelectionDotsOption } from "./SelectionDots";

export const MessageReadInfoSelectionDots = () => {
  const { t } = useTranslation();
  
  const options: SelectionDotsOption<MessageReadInfoOptions>[] = [
    {
      value: MessageReadInfoOptions.ALL,
      label: t("common.options.all"),
    },
    {
      value: MessageReadInfoOptions.OTHER,
      label: t("common.options.other"),
    },
    {
      value: MessageReadInfoOptions.YOU,
      label: t("common.options.only_you"),
    },
    {
      value: MessageReadInfoOptions.NONE,
      label: t("common.options.none"),
    },
  ];

  const readInfo = useSettingsStore((state) => state.messageSettings.readInfo);
  const setReadDisplay = useSettingsStore((state) => state.setReadDisplay);

  return (
    <SelectionDots<MessageReadInfoOptions>
      options={options}
      selected={readInfo}
      onSelect={setReadDisplay}
      className="w-full"
      variant="card"
      orientation="vertical"
    />
  );
};