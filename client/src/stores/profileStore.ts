import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userService } from "@/services/http/userService";
import { localStorageService } from "@/services/storage/localStorageService";
import { useAuthStore } from "./authStore";
import { ProfileFormData } from "@/components/sidebar/SidebarProfileEdit";
import logger from "@/common/utils/logger";

interface ProfileState {
  loading: boolean;
  error: string | null;
}

interface ProfileActions {
  updateProfile: (updatedData: ProfileFormData) => Promise<void>;
  reset: () => void;
}

const initialState: ProfileState = {
  loading: false,
  error: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      ...initialState,

      updateProfile: async (updatedData) => {
        set({ loading: true, error: null });
        const updatedUser = await userService.updateProfile(updatedData);

        if (process.env.NODE_ENV === "development") {
          logger.log("updated User: ", updatedUser);
        }

        // Optimized: Get and update auth store in one operation
        const currentUser = useAuthStore.getState().currentUser;
        const setCurrentUser = useAuthStore.getState().setCurrentUser; // ✅ Good
        const mergedUser = currentUser
          ? { ...currentUser, ...updatedUser }
          : updatedUser;
        setCurrentUser(mergedUser);

        set({ loading: false });
      },

      updateUserNickname: async () => {},

      reset: () => {
        localStorageService.clearAuth();
        set(initialState);
      },
    }),
    {
      name: "profile-storage",
      // Optional: Skip persisting certain fields if needed
      partialize: (state) => ({
        ...state,
        loading: false, // Don't persist loading state
        error: null, // Don't persist errors
      }),
    }
  )
);
