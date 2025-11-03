// src/common/hooks/app/fetchInitialAppData.ts
import { bootstrapService } from "@/services/http/boostrapService";
import { useChatStore } from "@/stores/chatStore";
import { useFolderStore } from "@/stores/folderStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import type { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

export const fetchInitialAppData = async () => {
  const data: BootstrapResponse = await bootstrapService.fetchAppData();
  // console.log("BootstrapResponse-data", data);
  useChatStore.getState().setInitialData(data.chatData);
  useFolderStore.getState().setInitialData(data.folderData);
  useFriendshipStore.getState().setInitialData(data.friendRequestData);
};
