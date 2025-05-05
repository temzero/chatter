// src/components/common/BackgroundContent.tsx
import { useTheme } from "@/contexts/ThemeContext";
import backgroundLight from "@/assets/image/backgroundSky.jpg";
import backgroundDark from "@/assets/image/backgroundDark.jpg";

const BackgroundContent = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        className="w-full h-full object-cover"
        src={resolvedTheme === "dark" ? backgroundDark : backgroundLight}
        alt="Background"
        aria-hidden="true"
      />
      {/* Optional: Dark overlay for better text contrast */}
      <div
        className={`absolute inset-0 ${
          resolvedTheme === "dark" ? "bg-black/30" : "bg-white/10"
        }`}
      />
    </div>
  );
};

export default BackgroundContent;
