// components/PrivateLayout.tsx
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
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
import { usePresenceStore } from "@/stores/presenceStore";
import { useChatSocketListeners } from "@/lib/websocket/hooks/useChatSocketListener";
import { useWebSocket } from "@/lib/websocket/hooks/useWebsocket";
import { PuffLoader } from "react-spinners";
import ErrorView from "@/components/ui/ErrorView";

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
    isLoading: chatsLoading,
    error: chatError,
  } = useChatStore();
  const {
    fetchPendingRequests,
    isLoading: friendshipsLoading,
    error: friendshipsError,
  } = useFriendshipStore();
  const { initialize: initializePresence } = usePresenceStore();

  useWebSocket();
  useChatSocketListeners();

  useEffect(() => {
    const initialize = async () => {
      try {
        // setInitializationStatus("loading");

        // 1. Initialize auth first
        await initializeAuth();

        // 2. Initialize chats and friendships in parallel
        await Promise.all([initializeChats(), fetchPendingRequests()]);

        // 3. Set active chat after data is loaded
        await setActiveChatById(chatId || null);

        // 4. Initialize presence
        initializePresence();

        // 5. Initialize sidebar UI components
        initializeSidebar();
        initializeSidebarInfo();

        // setInitializationStatus("success");
      } catch (error) {
        console.error("Initialization error:", error);
        // setInitializationStatus("error");
      }
    };

    initialize();
  }, [
    chatId,
    fetchPendingRequests,
    initializeAuth,
    initializeChats,
    initializePresence,
    initializeSidebar,
    initializeSidebarInfo,
    setActiveChatById,
  ]);

  // Show loading if initialization is in progress or stores are loading
  if (chatsLoading || friendshipsLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PuffLoader color="#6a6a6a" />;
      </div>
    );
  }

  // Show error if initialization failed or stores have errors
  if (chatError || friendshipsError) {
    return (
      <ErrorView
        message={
          chatError || friendshipsError || "Failed to initialize application"
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

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
