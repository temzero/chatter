// components/ui/ThemeSelectionBar.tsx
import React from "react";
import { SelectionBar } from "@/components/ui/selectionBar/SelectionBar";
import { useThemeMode, getSetTheme } from "@/stores/themeStore";
import { ThemeMode } from "@/shared/types/enums/theme.enum";

const themeOptions = [
  {
    id: "light" as ThemeMode,
    label: "settings.theme_mode.light",
    icon: "light_mode",
  },
  {
    id: "dark" as ThemeMode,
    label: "settings.theme_mode.dark",
    icon: "dark_mode",
  },
  {
    id: "auto" as ThemeMode,
    label: "settings.theme_mode.auto",
    icon: "routine",
  },
] as const;

interface ThemeSelectionBarProps {
  className?: string;
}

const ThemeSelectionBar: React.FC<ThemeSelectionBarProps> = ({ className }) => {
  const themeMode = useThemeMode();
  const setTheme = getSetTheme();

  const handleThemeSelect = (selectedOption: string) => {
    setTheme(selectedOption as ThemeMode);
  };

  const getThemeIcon = (themeId: string) => {
    const option = themeOptions.find((opt) => opt.id === themeId);
    return option?.icon || "";
  };

  return (
    <SelectionBar
      options={themeOptions.map((opt) => opt.id)}
      selected={themeMode}
      onSelect={handleThemeSelect}
      getIcon={getThemeIcon}
      className={`mx-0! mb-0! ${className}`} 
    />
  );
};

export default ThemeSelectionBar;
