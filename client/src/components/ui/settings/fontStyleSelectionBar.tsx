// components/ui/settings/fontStyleSelectionBar.tsx
import { useSettingsStore } from "@/stores/settingsStore";
import { SelectionBar, SelectionBarOption } from "../selectionBar/SelectionBar";
import { FontStyle } from "@/shared/types/enums/font-style.enum";

export const FontStyleSelectionBar = () => {
  const options: SelectionBarOption<FontStyle>[] = [
    {
      value: FontStyle.SANS,
      label: "Sans",
      fontClass: "font-sans",
    },
    {
      value: FontStyle.SERIF,
      label: "Serif",
      fontClass: "font-serif",
    },
    {
      value: FontStyle.MONO,
      label: "Mono",
      fontClass: "font-mono",
    },
  ];

  const fontStyle = useSettingsStore(
    (state) => state.displaySettings.fontStyle
  );
  const setFontStyle = useSettingsStore((state) => state.setFontStyle);

  return (
    <SelectionBar
      options={options}
      selected={fontStyle}
      onSelect={setFontStyle}
      className="w-full h-12"
    />
  );
};
