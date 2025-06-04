import { useThemeStore } from "@/stores/themeStore";

const ThemeSelector = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const getOptionClass = (value: string) =>
    `flex items-center gap-4 px-4 py-2 w-full cursor-pointer transition-colors custom-border-b
     ${
       theme === value
         ? "bg-[var(--primary-green)]/20"
         : "hover:bg-[var(--primary-green)]/10"
     }`;

  return (
    <div id="theme-switcher" className="flex flex-col gap-1">
      <div
        className={getOptionClass("light")}
        onClick={() => setTheme("light")}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            theme === "light"
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {theme === "light" && (
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
          )}
        </div>
        <span>Light</span>
        {/* <i className="material-symbols-outlined ml-auto">light_mode</i> */}
      </div>

      <div className={getOptionClass("dark")} onClick={() => setTheme("dark")}>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            theme === "dark"
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {theme === "dark" && (
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]"></div>
          )}
        </div>
        <span>Dark</span>
        {/* <i className="material-symbols-outlined ml-auto">dark_mode</i> */}
      </div>

      <div className={getOptionClass("auto")} onClick={() => setTheme("auto")}>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
          ${
            theme === "auto"
              ? "border-[var(--primary-green)]"
              : "border-gray-400"
          }`}
        >
          {theme === "auto" && (
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
