import { useSettingsStore } from "@/stores/settingsStore";
import { SelectionBar, SelectionBarOption } from "../selectionBar/SelectionBar";
import { SizeEnum } from "../../../shared/types/enums/size.enum";

export const TextSizeSelectionBar = () => {
  const options: SelectionBarOption<SizeEnum>[] = [
    {
      value: SizeEnum.S,
      label: SizeEnum.S,
      textSize: "text-sm",
    },
    {
      value: SizeEnum.M,
      label: SizeEnum.M,
      textSize: "text-base",
    },
    {
      value: SizeEnum.L,
      label: SizeEnum.L,
      textSize: "text-lg",
    },
    {
      value: SizeEnum.XL,
      label: SizeEnum.XL,
      textSize: "text-xl",
    },
  ];

  const textSize = useSettingsStore((state) => state.displaySettings.textSize);
  const setTextSize = useSettingsStore((state) => state.setTextSize);

  return (
    <SelectionBar<SizeEnum>
      options={options}
      selected={textSize}
      onSelect={setTextSize}
      className="w-full h-12"
    />
  );
};
