// src/routes/PrivateLayout.tsx
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import MediaModal from "@/components/modal/MediaModal";
import Sidebar from "@/components/sidebar/Sidebar";
import Chat from "@/components/chat/Chat";
import BackgroundContent from "@/components/ui/BackgroundContent";
import { Navigate } from "react-router-dom";
import { useChatStore } from "@/stores/chatStore";
import { useIsAuthenticated } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const ChatContent: React.FC = () => {
  const initializeSidebar = useSidebarStore(
    (state) => state.initializeKeyListeners
  );
  const initializeSidebarInfo = useSidebarInfoStore(
    (state) => state.initializeKeyListeners
  );

  // Initialize app state
  useEffect(() => {
    initializeSidebar();
    initializeSidebarInfo();
  }, [initializeSidebar, initializeSidebarInfo]);

  const activeChat = useChatStore((state) => state.activeChat);
  return activeChat ? <Chat /> : null;
};

const PrivateLayout: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <MediaModal />
      <BackgroundContent />

      <Sidebar />
      <ChatContent />
    </div>
  );
};

export default PrivateLayout;
