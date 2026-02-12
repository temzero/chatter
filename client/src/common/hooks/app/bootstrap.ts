// bootstrap.ts
import { useAuthStore } from "@/stores/authStore";
import { fetchInitialAppData } from "./fetchInitialAppData";
import { detectLanguage } from "@/common/utils/detectLanguage";

const bootstrapApp = async () => {
  try {
    // STEP 0: Detect language on the first time app launch
    detectLanguage();

    // STEP 1: Initialize auth first and get boolean result
    const isAuth = await useAuthStore.getState().initialize();

    // STEP 2: Only load app data if authenticated
    if (!isAuth) {
      console.warn("[AUTH]", "User not authenticated");
      return;
    }

    // STEP 3: Fetch initial app data for authenticated users
    await fetchInitialAppData();
  } catch {
    useAuthStore.getState().logout();
    console.log("[INIT] BootstrapApp Failed");
    return;
  }
};

export default bootstrapApp;
