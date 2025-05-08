// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "@/routes/AppRoutes";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "./stores/uiStore";
import { useChatStore } from "@/stores/chatStore";

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeUI = useUIStore((state) => state.initialize);
  const getChats = useChatStore((state) => state.getChats);
  const currentUser = useAuthStore((state) => state.currentUser);

  // Initialize app state
  useEffect(() => {
    initializeAuth();
    initializeUI();
  }, [initializeAuth, initializeUI]);

  // Initialize chats when user is available
  useEffect(() => {
    if (currentUser?.id) {
      getChats(currentUser.id);
    }
  }, [currentUser?.id, getChats]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;