import { SelectionBar } from "../selectionBar/SelectionBar";
import { TextSize } from "../../../shared/types/enums/text-size.enum";
import { useSettingsStore } from "@/stores/settingsStore";

interface TextSizeOption {
  id: TextSize;
  label: string;
  fontSizeClass: string;
}

export const TextSizeSelectionBar = () => {
  const textSizeOptions: TextSizeOption[] = [
    {
      id: TextSize.S,
      label: TextSize.S,
      fontSizeClass: "text-sm!",
    },
    {
      id: TextSize.M,
      label: TextSize.M,
      fontSizeClass: "text-base",
    },
    {
      id: TextSize.L,
      label: TextSize.L,
      fontSizeClass: "text-lg!",
    },
    {
      id: TextSize.XL,
      label: TextSize.XL,
      fontSizeClass: "text-xl!",
    },
  ];

  // ✅ Get data from Zustand store
  const textSize = useSettingsStore((state) => state.displaySettings.textSize);
  const setTextSize = useSettingsStore((state) => state.setTextSize);

  const getTextSizeLabel = (optionId: TextSize) => {
    const option = textSizeOptions.find((opt) => opt.id === optionId);
    return option?.label ?? optionId;
  };

  return (
    <div className="flex items-center w-full">
      <SelectionBar
        options={textSizeOptions.map((opt) => opt.id)}
        selected={textSize}
        onSelect={setTextSize}
        getLabel={getTextSizeLabel}
        className="w-full"
      />
    </div>
  );
};
