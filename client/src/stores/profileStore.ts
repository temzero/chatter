import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userService } from "@/services/userService";
import { storageService } from "@/services/storage/storageService";
import { useAuthStore } from "./authStore";
import { MyProfileProps } from "@/data/types";

type ProfileState = {
  currentProfile: MyProfileProps | null;
  loading: boolean;
  error: string | null;
};

type ProfileActions = {
  updateProfile: (updatedData: Partial<MyProfileProps>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  reset: () => void;
  deleteProfile: () => Promise<void>;
};

const initialState: ProfileState = {
  currentProfile: null,
  loading: false,
  error: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateProfile: async (updatedData) => {
        set({ loading: true, error: null });
        try {
          const updatedUser = await userService.updateUser(updatedData);
          storageService.setUser(updatedUser);
          useAuthStore.getState().setCurrentUser(updatedUser);

          set({
            currentProfile: updatedUser,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      refreshProfile: async () => {
        set({ loading: true });
        try {
          // Assuming we can get current user by their ID from storage
          const currentUserId = get().currentProfile?.id;
          if (!currentUserId) {
            throw new Error("No user logged in");
          }
          const user = await userService.getUserById(currentUserId);
          storageService.setUser(user);
          set({ currentProfile: user, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to refresh profile";
          set({ error: errorMessage, loading: false });
        }
      },

      deleteProfile: async () => {
        set({ loading: true, error: null });
        try {
          await userService.deleteUser();
          storageService.clearUser();
          set(initialState);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete profile";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      reset: () => {
        storageService.clearUser();
        set(initialState);
      },
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({ currentProfile: state.currentProfile }),
    }
  )
);
