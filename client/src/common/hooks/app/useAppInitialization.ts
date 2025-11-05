import { useParams } from "react-router-dom";
import { useWebSocket } from "@/common/hooks/websocket/useWebsocket";
import { useNotificationSocketListeners } from "@/common/hooks/websocket/useNotificationSocketListener";
import { useChatSocketListeners } from "@/common/hooks/websocket/useChatSocketListener";
import { usePresenceSocketListeners } from "@/common/hooks/websocket/usePresenceSocketListeners";
import { useCallSocketListeners } from "@/common/hooks/websocket/useCallSocketListener";
import { useDevice } from "@/common/hooks/useDevice";
import { useCleanup } from "@/common/hooks/useCleanup";
import { useGlobalKeyListeners } from "../keyEvent/useGlobalKeyListener";
import { useChatStore } from "@/stores/chatStore";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const useAppInitialization = () => {
  console.log("useAppInitialization");
  const { id: chatId } = useParams();

  useEffect(() => {
    if (chatId) {
      try {
        useChatStore.getState().setActiveChatId(chatId);
      } catch {
        toast.error("Chat not found or deleted!");
        window.history.pushState({}, "", "/");
        // Optionally, reset active chat in store
        useChatStore.getState().setActiveChatId(null);
      }
    }
  }, [chatId]);

  // 🧩 Socket + device setup
  useDevice();
  useWebSocket();
  useNotificationSocketListeners();
  usePresenceSocketListeners();
  useChatSocketListeners();
  useCallSocketListeners();
  useGlobalKeyListeners();
  useCleanup();
};
