import { useSettingsStore } from "@/stores/settingsStore";
import { SelectionBar, SelectionBarOption } from "../selectionBar/SelectionBar";
import { TextSize } from "../../../shared/types/enums/text-size.enum";

export const TextSizeSelectionBar = () => {
  const options: SelectionBarOption<TextSize>[] = [
    {
      value: TextSize.S,
      label: TextSize.S,
      textSize: "text-sm",
    },
    {
      value: TextSize.M,
      label: TextSize.M,
      textSize: "text-base",
    },
    {
      value: TextSize.L,
      label: TextSize.L,
      textSize: "text-lg",
    },
    {
      value: TextSize.XL,
      label: TextSize.XL,
      textSize: "text-xl",
    },
  ];

  const textSize = useSettingsStore((state) => state.displaySettings.textSize);
  const setTextSize = useSettingsStore((state) => state.setTextSize);

  return (
    <SelectionBar<TextSize>
      options={options}
      selected={textSize}
      onSelect={setTextSize}
      className="w-full h-12"
    />
  );
};
