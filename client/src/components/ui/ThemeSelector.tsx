import { ThemeOption, useThemeStore } from "@/stores/themeStore";

const ThemeSelector = () => {
  const themeOption = useThemeStore((state) => state.themeOption);
  const setTheme = useThemeStore((state) => state.setTheme);

  const getOptionClass = (value: string) =>
    `flex items-center gap-4 px-4 py-2 w-full cursor-pointer transition-colors custom-border-b
     ${
       themeOption === value
         ? "bg-[var(--primary-green)]/20"
         : "hover:bg-[var(--primary-green)]/10"
     }`;

  return (
    <div id="theme-switcher" className="flex flex-col gap-1">
      <div
        className={getOptionClass(ThemeOption.Light)}
        onClick={() => setTheme(ThemeOption.Light)}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            themeOption === ThemeOption.Light
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {themeOption === ThemeOption.Light && (
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
          )}
        </div>
        <span>Light</span>
        {/* <i className="material-symbols-outlined ml-auto">light_mode</i> */}
      </div>

      <div
        className={getOptionClass(ThemeOption.Dark)}
        onClick={() => setTheme(ThemeOption.Dark)}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            themeOption === ThemeOption.Dark
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {themeOption === ThemeOption.Dark && (
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
          )}
        </div>
        <span>Dark</span>
        {/* <i className="material-symbols-outlined ml-auto">dark_mode</i> */}
      </div>

      <div
        className={getOptionClass(ThemeOption.Auto)}
        onClick={() => setTheme(ThemeOption.Auto)}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            themeOption === ThemeOption.Auto
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {themeOption === ThemeOption.Auto && (
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
          )}
        </div>
        <span>Auto</span>
        {/* <i className="material-symbols-outlined ml-auto">routine</i> */}
      </div>
    </div>
  );
};

export default ThemeSelector;
