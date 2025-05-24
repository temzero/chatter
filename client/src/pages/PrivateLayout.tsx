import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import Modal from "@/components/modal/Modal";
import Sidebar from "@/components/sidebar/Sidebar";
import Chat from "@/components/chat/Chat";
import BackgroundContent from "@/components/ui/BackgroundContent";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useIsAuthenticated } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

export const ChatContent: React.FC = () => {
  const { initializeKeyListeners: initializeSidebar } = useSidebarStore();
  const { initializeKeyListeners: initializeSidebarInfo } =
    useSidebarInfoStore();
  const { initialize: initializeAuth } = useAuthStore();
  const {
    initialize: initializeChats,
    activeChat,
    setActiveChatById,
  } = useChatStore();
  const { id: chatId } = useParams();
  const navigate = useNavigate();

  // Initialization effect
  useEffect(() => {
    initializeSidebar();
    initializeSidebarInfo();
    initializeAuth();
    initializeChats();
  }, [
    initializeSidebar,
    initializeSidebarInfo,
    initializeAuth,
    initializeChats,
  ]);

  // Chat ID effect
  useEffect(() => {
    setActiveChatById(chatId || null);
  }, [chatId, setActiveChatById]);

  // Navigation effect
  useEffect(() => {
    const handlePopState = () => {
      navigate(ROUTES.PRIVATE.HOME, { replace: true });
      setActiveChatById(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, setActiveChatById]);

  return activeChat ? <Chat /> : null;
};

const PrivateLayout: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundContent />
      <Sidebar />
      <ChatContent />
      <Modal />
    </div>
  );
};

export default PrivateLayout;
