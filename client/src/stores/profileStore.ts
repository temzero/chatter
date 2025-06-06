import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userService } from "@/services/userService";
import { localStorageService } from "@/services/storage/localStorageService";
import { useAuthStore } from "./authStore";
import { ProfileFormData } from "@/components/sidebar/SidebarProfileEdit";

type ProfileState = {
  loading: boolean;
  error: string | null;
};

type ProfileActions = {
  updateProfile: (updatedData: ProfileFormData) => Promise<void>;
  reset: () => void;
  deleteProfile: () => Promise<void>;
};

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
        try {
          const updatedUser = await userService.updateProfile(updatedData);

          // Optimized: Avoid unnecessary `console.log` in production
          if (process.env.NODE_ENV === "development") {
            console.log("updated User: ", updatedUser);
          }

          // Optimized: Get and update auth store in one operation
          const { currentUser, setCurrentUser } = useAuthStore.getState();
          const mergedUser = currentUser
            ? { ...currentUser, ...updatedUser }
            : updatedUser;
          setCurrentUser(mergedUser);

          set({ loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          set({ error: errorMessage, loading: false });
          throw error; // Re-throw for error boundaries or further handling
        }
      },

      updateUserNickname: async () => {},

      deleteProfile: async () => {
        set({ loading: true, error: null });
        try {
          await userService.deleteUser();
          localStorageService.clearAuth();
          set(initialState);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete profile";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

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
