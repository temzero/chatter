// components/PrivateLayout.tsx
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
import { usePresenceUserStore } from "@/stores/presenceStore";
import { useChatSocketListeners } from "@/lib/websocket/hooks/useChatSocketListener";
import { useWebSocket } from "@/lib/websocket/hooks/useWebsocket";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
// Remove usePresenceSocketListeners import

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
  const { initialize: initializePresence } = usePresenceUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useWebSocket();
  useChatSocketListeners();

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Initialize auth first
        await initializeAuth();

        // 2. Initialize chats and friendships
        await Promise.all([initializeChats(), fetchPendingRequests()]);

        // 3. Set active chat
        await setActiveChatById(chatId || null);

        // 4. Initialize presence (after chats are loaded)
        const cleanupPresence = initializePresence();

        // 5. Initialize sidebar UI components
        initializeSidebar();
        initializeSidebarInfo();

        // Cleanup on unmount
        return () => {
          cleanupPresence();
        };
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
    initializePresence, // Add to dependencies
    initializeSidebar,
    initializeSidebarInfo,
    setActiveChatById,
  ]);

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

  return activeChat ? (
    <section className="w-full h-full border-4">
      <Chat />
      <div className="border-4">
        <ChatSidebar />
      </div>
    </section>
  ) : (
    ""
  );
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
