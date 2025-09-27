// src/components/common/BackgroundContent.tsx
import backgroundLight from "@/assets/image/backgroundSky.jpg";
import backgroundDark from "@/assets/image/backgroundDark.jpg";
import { Theme, useTheme } from "@/stores/themeStore";

const BackgroundContent = () => {
  const theme = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        className="w-full h-full object-cover"
        src={theme === Theme.Dark ? backgroundDark : backgroundLight}
        alt="Background"
        aria-hidden="true"
      />
      {/* Optional: Dark overlay for better text contrast */}
      <div
        className={`absolute inset-0 ${
          theme === Theme.Dark ? "bg-black/30" : "bg-white/10"
        }`}
      />
    </div>
  );
};

export default BackgroundContent;
