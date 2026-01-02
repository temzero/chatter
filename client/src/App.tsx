// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { useResolvedTheme, useThemeStore } from "./stores/themeStore";
import { ResolvedTheme } from "./shared/types/enums/theme.enum";
import { ToastContainer } from "react-toastify";
import { useDevice } from "./common/hooks/useDevice";
import AppRoutes from "@/routes/AppRoutes";
import BackgroundWallpaper from "./components/ui/layout/BackgroundWallpaper";
import { SettingsEffects } from "./components/ui/settings/SettingsEffect";
import { MotionConfigProvider } from "./components/chat/components/providers/MotionConfigProvider";

const App: React.FC = () => {
  useDevice();
  const initializeTheme = useThemeStore.getState().initialize;
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <Router>
      <SettingsEffects />

      <MotionConfigProvider>
        <AppRoutes />
      </MotionConfigProvider>

      <BackgroundWallpaper />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        // closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={resolvedTheme}
        toastStyle={{
          padding: "12px",
          ...(resolvedTheme === ResolvedTheme.DARK
            ? {
                backgroundColor: "#222",
                color: "#fff",
                border: "2px solid #444",
              }
            : {
                backgroundColor: "#fff",
                color: "#1a202c",
                border: "2px solid #ddd",
              }),
        }}
      />
    </Router>
  );
};

export default App;
