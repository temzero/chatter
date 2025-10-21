import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// 🧱 Stores
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useFolderStore } from "@/stores/folderStore";

// 🧩 Socket hooks
import { useWebSocket } from "@/common/hooks/websocket/useWebsocket";
import { useNotificationSocketListeners } from "@/common/hooks/websocket/useNotificationSocketListener";
import { useChatSocketListeners } from "@/common/hooks/websocket/useChatSocketListener";
import { usePresenceSocketListeners } from "@/common/hooks/websocket/usePresenceSocketListeners";
import { useCallSocketListeners } from "@/common/hooks/websocket/useCallSocketListener";
import { useDevice } from "./useDevice";
import { useCleanup } from "./useCleanup";

export const useAppInitialization = () => {
  const { id: chatId } = useParams();
  const [isInitializing, setIsInitializing] = useState(true);

  const { initialize: initializeAuth } = useAuthStore();
  const {
    initialize: initializeChats,
    setActiveChatById,
    error: chatError,
  } = useChatStore();

  const { fetchPendingRequests } = useFriendshipStore();

  const { initialize: initializeFolders, error: folderError } =
    useFolderStore();

  const { initializeKeyListeners: initializeSidebar } = useSidebarStore();
  const { initializeKeyListeners: initializeSidebarInfo } =
    useSidebarInfoStore();

  // 🧩 Socket connections (attach listeners once)
  useDevice();
  useWebSocket();
  useNotificationSocketListeners();
  useChatSocketListeners();
  usePresenceSocketListeners();
  useCallSocketListeners();
  // 🧹 Call cleanup
  useCleanup();

  // ⚙️ Full initialization — runs only once
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth();
        await Promise.all([initializeChats(), fetchPendingRequests()]);
        await initializeFolders();
        initializeSidebar();
        initializeSidebarInfo();
        setActiveChatById(null);
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to initialize application");
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, [
    fetchPendingRequests,
    initializeAuth,
    initializeChats,
    initializeFolders,
    initializeSidebar,
    initializeSidebarInfo,
    setActiveChatById,
  ]);

  // 🧠 Chat switching — independent of full initialization
  useEffect(() => {
    if (!isInitializing) {
      if (chatId) {
        setActiveChatById(chatId);
      } else {
        setActiveChatById(null);
      }
    }
  }, [chatId, isInitializing, setActiveChatById]);

  // ⚠️ Show toast if any store error appears
  useEffect(() => {
    if (chatError || folderError) {
      toast.error(chatError || folderError);
    }
  }, [chatError, folderError]);
};
