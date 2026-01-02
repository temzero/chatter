// components/ui/ThemeSelectionBar.tsx
import React from "react";
import {
  SelectionBar,
  SelectionBarOption,
} from "@/components/ui/selectionBar/SelectionBar";
import { useThemeMode, getSetTheme } from "@/stores/themeStore";
import { ThemeMode } from "@/shared/types/enums/theme.enum";

interface ThemeSelectionBarProps {
  className?: string;
}

const ThemeSelectionBar: React.FC<ThemeSelectionBarProps> = ({ className }) => {
  const options: SelectionBarOption<ThemeMode>[] = [
    {
      value: ThemeMode.LIGHT,
      icon: "light_mode",
    },
    {
      value: ThemeMode.DARK,
      icon: "dark_mode",
    },
    {
      value: ThemeMode.AUTO,
      icon: "routine",
    },
  ];

  const themeMode = useThemeMode();
  const setTheme = getSetTheme();

  const handleThemeSelect = (selectedOption: ThemeMode) => {
    setTheme(selectedOption);
  };

  return (
    <SelectionBar<ThemeMode>
      options={options}
      selected={themeMode}
      onSelect={handleThemeSelect}
      className={className}
    />
  );
};

export default ThemeSelectionBar;
