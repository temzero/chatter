import { useEffect } from "react";
import { useParams } from "react-router-dom";

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
import { useChatStore } from "@/stores/chatStore";

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

  useEffect(() => {
    useChatStore.getState().setActiveChatById(chatId ?? null);
  }, [chatId]);
};
