// src/routes/PrivateLayout.tsx
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import MediaModal from "@/components/modal/MediaModal";
import Sidebar from "@/components/sidebar/Sidebar";
import Chat from "@/components/chat/Chat";
import BackgroundContent from "@/components/ui/BackgroundContent";
import { Navigate, useParams } from "react-router-dom";
import { useChatStore } from "@/stores/chatStore";
import { useIsAuthenticated } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

export const ChatContent: React.FC = () => {
  const initializeSidebar = useSidebarStore(
    (state) => state.initializeKeyListeners
  );
  const initializeSidebarInfo = useSidebarInfoStore(
    (state) => state.initializeKeyListeners
  );
  const { id: chatId } = useParams();
  const { activeChat, setActiveChatById } = useChatStore();

  useEffect(() => {
    initializeSidebar();
    initializeSidebarInfo();

    console.log('chatId: ', chatId)

    // Set active chat based on URL
    if (chatId) {
      setActiveChatById(chatId);
    } else {
      setActiveChatById(null)
    }
  }, [chatId, setActiveChatById, initializeSidebar, initializeSidebarInfo]);

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
