// bootstrap.ts
import { useAuthStore } from "@/stores/authStore";
import { fetchInitialAppData } from "./fetchInitialAppData";
import { handleError } from "@/common/utils/handleError";

const bootstrapApp = async () => {
  console.log('bootstrapApp')
  try {
    // STEP 1: Initialize auth first and get boolean result
    const isAuth = await useAuthStore.getState().initialize();

    // STEP 2: Only load app data if authenticated
    if (!isAuth) {
      console.warn("User not authenticated");
      return;
    }

    // STEP 3: Fetch initial app data for authenticated users
    await fetchInitialAppData();
  } catch (error) {
    handleError(error, "Fail to Load App Data");
  }
};

export default bootstrapApp;
