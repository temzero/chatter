import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import Sidebar from "@/components/sidebar/Sidebar";
import Chat from "@/components/chat/Chat";
import BackgroundContent from "@/components/ui/BackgroundContent";
import { Navigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useIsAuthenticated } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useChatSocketListeners } from "@/lib/websocket/hooks/useChatSocketListener";
import { useWebSocket } from "@/lib/websocket/hooks/useWebsocket";
import { usePresenceSocketListeners } from "@/lib/websocket/hooks/usePresenceSocketListeners";

export const ChatContent: React.FC = () => {
  const { id: chatId } = useParams();
  const { initializeKeyListeners: initializeSidebar } = useSidebarStore();
  const { initializeKeyListeners: initializeSidebarInfo } =
    useSidebarInfoStore();
  const { initialize: initializeAuth } = useAuthStore();
  const {
    initialize: initializeChats,
    activeChat,
    setActiveChatById,
  } = useChatStore();
  const { fetchPendingRequests } = useFriendshipStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useWebSocket();
  usePresenceSocketListeners();
  useChatSocketListeners();

  // Initialization effect with proper sequencing
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Initialize auth first (everything depends on this)
        await initializeAuth();

        // 2. Initialize chats in parallel with friendships (they both need auth but don't depend on each other)
        await Promise.all([initializeChats(), fetchPendingRequests()]);

        // 3. Set active chat after chats are loaded
        await setActiveChatById(chatId || null);

        // 4. Initialize sidebar UI components (can happen last)
        initializeSidebar();
        initializeSidebarInfo();
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize application data");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [
    chatId,
    fetchPendingRequests,
    initializeAuth,
    initializeChats,
    initializeSidebar,
    initializeSidebarInfo,
    setActiveChatById,
  ]); // Only chatId as dependency since store methods are stable

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return activeChat ? <Chat /> : "";
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
