import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// 🧱 Stores
import { useAuthStore, useIsAuthenticated } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useFolderStore } from "@/stores/folderStore";

// 🧩 Socket hooks
import { useWebSocket } from "@/lib/websocket/hooks/useWebsocket";
import { useNotificationSocketListeners } from "@/lib/websocket/hooks/useNotificationSocketListener";
import { useChatSocketListeners } from "@/lib/websocket/hooks/useChatSocketListener";
import { usePresenceSocketListeners } from "@/lib/websocket/hooks/usePresenceSocketListeners";
import { useCallSocketListeners } from "@/lib/websocket/hooks/useCallSocketListener";

// 🧭 Utils
import { useIsMobile } from "@/hooks/useIsMobile";

export const useAppInitialization = () => {
  const { id: chatId } = useParams();
  const [isInitializing, setIsInitializing] = useState(true);

  // 🧱 Store hooks
  const isAuthenticated = useIsAuthenticated();
  const isMobile = useIsMobile();

  const { initialize: initializeAuth } = useAuthStore();
  const {
    initialize: initializeChats,
    setActiveChatById,
    isLoading: chatsLoading,
    error: chatError,
  } = useChatStore();

  const { fetchPendingRequests, isLoading: friendshipsLoading } =
    useFriendshipStore();

  const {
    initialize: initializeFolders,
    isLoading: foldersLoading,
    error: folderError,
  } = useFolderStore();

  const { initializeKeyListeners: initializeSidebar } = useSidebarStore();
  const { initializeKeyListeners: initializeSidebarInfo } =
    useSidebarInfoStore();

  // 🧩 Socket connections (attach listeners once)
  useWebSocket();
  useNotificationSocketListeners();
  useChatSocketListeners();
  usePresenceSocketListeners();
  useCallSocketListeners();

  // ⚙️ Full initialization — runs only once
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth();
        await Promise.all([initializeChats(), fetchPendingRequests()]);
        await initializeFolders();
        initializeSidebar();
        initializeSidebarInfo();
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to initialize application");
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, [fetchPendingRequests, initializeAuth, initializeChats, initializeFolders, initializeSidebar, initializeSidebarInfo]);

  // 🧠 Chat switching — independent of full initialization
  useEffect(() => {
    if (!isInitializing && chatId) {
      setActiveChatById(chatId);
    }
  }, [chatId, isInitializing, setActiveChatById]);

  // ⚠️ Show toast if any store error appears
  useEffect(() => {
    if (chatError || folderError) {
      toast.error(chatError || folderError);
    }
  }, [chatError, folderError]);

  // 🌀 Loading and error states
  const isLoading =
    isInitializing || chatsLoading || friendshipsLoading || foldersLoading;

  const hasError = chatError || folderError;

  const status = hasError ? "error" : isLoading ? "loading" : "ready";

  // ✅ Return unified API
  return {
    status,
    isAuthenticated,
    isMobile,
    error: hasError,
  };
};
