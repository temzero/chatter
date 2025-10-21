import { ThemeOption, getSetTheme, useThemeOption } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";

const ThemeSelector = () => {
  const { t } = useTranslation();
  const themeOption = useThemeOption();
  const setTheme = getSetTheme();

  const getOptionClass = (value: string) =>
    `flex items-center gap-4 p-4 w-full cursor-pointer transition-colors custom-border-b
     ${
       themeOption === value
         ? "bg-[var(--primary-green)]/20"
         : "hover:bg-[var(--primary-green)]/10"
     }`;

  return (
    <div id="theme-switcher" className="flex flex-col gap-1">
      {[ThemeOption.Light, ThemeOption.Dark, ThemeOption.Auto].map((option) => (
        <div
          key={option}
          className={getOptionClass(option)}
          onClick={() => setTheme(option)}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
            ${
              themeOption === option
                ? "border-[var(--primary-green)]"
                : "border-gray-400"
            }`}
          >
            {themeOption === option && (
              <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
            )}
          </div>
          <span>{t(`settings.theme_options.${option}`)}</span>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
