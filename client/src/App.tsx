// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "@/routes/AppRoutes";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "./stores/uiStore";

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeUI = useUIStore((state) => state.initialize);

  // Initialize app state
  useEffect(() => {
    initializeAuth();
    initializeUI();
  }, [initializeAuth, initializeUI]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;