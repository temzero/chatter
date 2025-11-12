// src/common/hooks/app/fetchInitialAppData.ts
import { bootstrapService } from "@/services/http/boostrapService";
import { useChatStore } from "@/stores/chatStore";
import { useFolderStore } from "@/stores/folderStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import type { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";
import logger from "@/common/utils/logger";

export const fetchInitialAppData = async () => {
  const data: BootstrapResponse = await bootstrapService.fetchAppData();

  logger.log({ prefix: "FETCH", timestamp: true }, "BootstrapResponse-data", data);

  useChatStore.getState().setInitialData(data.chatData);
  useFolderStore.getState().setInitialData(data.folderData);
  useFriendshipStore.getState().setInitialData(data.friendRequestData);
};
