import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// 🧱 Stores
import { useAuthStore } from "@/stores/authStore";
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
import { useDevice } from "./useDevice";

export const useAppInitialization = () => {
  const { id: chatId } = useParams();
  const location = useLocation();
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
  }, [
    fetchPendingRequests,
    initializeAuth,
    initializeChats,
    initializeFolders,
    initializeSidebar,
    initializeSidebarInfo,
  ]);

  // 🧠 Chat switching — independent of full initialization
  // useEffect(() => {
  //   if (!isInitializing) {
  //     if (chatId) {
  //       setActiveChatById(chatId);
  //     } else {
  //       setActiveChatById(null);
  //     }
  //   }
  // }, [chatId, isInitializing, setActiveChatById]);
  useEffect(() => {
    if (isInitializing) return;

    // check the current path
    const path = location.pathname;

    if (path.startsWith("/chat/")) {
      const currentChatId = chatId || path.split("/chat/")[1];
      setActiveChatById(currentChatId);
    } else if (path === "/chat" || path === "/") {
      setActiveChatById(null);
    }
  }, [chatId, isInitializing, location.pathname, setActiveChatById]);

  // ⚠️ Show toast if any store error appears
  useEffect(() => {
    if (chatError || folderError) {
      toast.error(chatError || folderError);
    }
  }, [chatError, folderError]);

  // ⚡ No return needed — just initialize app internally
};
