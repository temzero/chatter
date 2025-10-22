// bootstrap.ts
import { bootstrapService } from "@/services/http/boostrapService";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useFolderStore } from "@/stores/folderStore";
import { useThemeStore } from "@/stores/themeStore";
import { toast } from "react-toastify";
import { BootstrapResponse } from "@/shared/types/responses/bootstrap.response";

const bootstrapApp = async () => {
  // Sync initialization
  useThemeStore.getState().initialize();

  try {
    // STEP 1: Initialize auth first
    await useAuthStore.getState().initialize();

    // STEP 2: Check if user is actually authenticated
    const { isAuthenticated, currentUser } = useAuthStore.getState();

    if (!isAuthenticated || !currentUser) {
      console.log("User not authenticated, skipping app data loading");
      return;
    }

    // STEP 3: Only load app data for authenticated users
    const appInitiationData: BootstrapResponse =
      await bootstrapService.getAppData();

    // Initialize stores with their respective data
    useChatStore.getState().setInitialData(appInitiationData.chatData);
    useFolderStore.getState().setInitialData(appInitiationData.folders);
    useFriendshipStore
      .getState()
      .setInitialData(appInitiationData.friendRequests);
  } catch (error) {
    console.error("Bootstrap failed:", error);
    toast.error("Fail to Load App Data");
  }
};

export default bootstrapApp;
