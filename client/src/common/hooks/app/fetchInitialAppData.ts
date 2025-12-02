// src/common/hooks/app/fetchInitialAppData.ts
import { bootstrapService } from "@/services/http/boostrapService";
import { useChatStore } from "@/stores/chatStore";
import { useFolderStore } from "@/stores/folderStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import type { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";
import { useCallStore } from "@/stores/callStore";

export const fetchInitialAppData = async () => {
  const appData: BootstrapResponse | null =
    await bootstrapService.fetchAppData();

  if (appData) {
    useChatStore.getState().setInitialData(appData.chatData);
    useFolderStore.getState().setInitialData(appData.folderData);
    useFriendshipStore.getState().setInitialData(appData.friendRequestData);
    if (appData.pendingCall) {
      useCallStore.getState().setIncomingCall(appData.pendingCall);
    }
  }
};
