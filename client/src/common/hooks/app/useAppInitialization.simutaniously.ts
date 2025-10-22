import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// 🧱 Stores
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useChatStore } from "@/stores/chatStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useFolderStore } from "@/stores/folderStore";

// 🧩 Socket hooks
import { useWebSocket } from "@/common/hooks/websocket/useWebsocket";
import { useNotificationSocketListeners } from "@/common/hooks/websocket/useNotificationSocketListener";
import { useChatSocketListeners } from "@/common/hooks/websocket/useChatSocketListener";
import { usePresenceSocketListeners } from "@/common/hooks/websocket/usePresenceSocketListeners";
import { useCallSocketListeners } from "@/common/hooks/websocket/useCallSocketListener";
import { useDevice } from "@/common/hooks/useDevice";
import { useCleanup } from "@/common/hooks/useCleanup";
import { useGlobalKeyListeners } from "../keyEvent/useGlobalKeyListener";
import { useAppErrorListeners } from "./useAppErrorListener";

export const useAppInitialization = () => {
  console.log("useAppInitialization");
  const { id: chatId } = useParams();

  // 🧩 Socket + device setup
  useDevice();
  useWebSocket();
  useNotificationSocketListeners();
  usePresenceSocketListeners();
  useChatSocketListeners();
  useCallSocketListeners();
  useGlobalKeyListeners();
  useAppErrorListeners();
  useCleanup();

  // ✅ One-time app initialization
  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          useAuthStore.getState().initialize(),
          useChatStore.getState().initialize(),
          useFriendshipStore.getState().initialize(),
          useFolderStore.getState().initialize(),
          useThemeStore.getState().initialize(),
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to initialize application");
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    useChatStore.getState().setActiveChatById(chatId ?? null);
  }, [chatId]);
};
