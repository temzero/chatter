// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "@/routes/AppRoutes";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeTheme = useThemeStore((state) => state.initialize);

  // Initialize app state
  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;