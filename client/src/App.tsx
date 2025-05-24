// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import { useThemeStore } from "./stores/themeStore";
import AppRoutes from "@/routes/AppRoutes";

const App: React.FC = () => {
  // const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeTheme = useThemeStore((state) => state.initialize);

  // Initialize app state
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;