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

export const useAppInitialization = () => {
  console.log("useAppInitialization");
  const { id: chatId } = useParams();

  useEffect(() => {
    if (chatId) {
      useChatStore.getState().setActiveChatId(chatId);
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
