import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, storageService } from "@/services/api/auth";
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
};

const initialState: ProfileState = {
  currentProfile: null,
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
          const updatedUser = await authService.updateProfile(updatedData);
          storageService.setUser(updatedUser);
          set({
            currentProfile: updatedUser,
            loading: false,
          });
        } catch (error) {
          set({ error: "Failed to update profile", loading: false });
          throw error;
        }
      },

      refreshProfile: async () => {
        set({ loading: true });
        try {
          const user = await authService.getCurrentUser();
          storageService.setUser(user);
          set({ currentProfile: user, loading: false });
        } catch (error) {
          set({ error: "Failed to refresh profile", loading: false });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({ currentProfile: state.currentProfile }),
    }
  )
);