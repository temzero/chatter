import { useEffect } from "react";
import { toast } from "react-toastify";

// 🧱 Stores
import { useChatStore } from "@/stores/chatStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useCallStore } from "@/stores/callStore";
import { useProfileStore } from "@/stores/profileStore";
import { useFolderStore } from "@/stores/folderStore";

// useAppErrorListeners.ts
export const useAppErrorListeners = () => {
  const chatError = useChatStore((state) => state.error);
  const chatMemberError = useChatMemberStore((state) => state.error);
  const callError = useCallStore((state) => state.error);
  const profileError = useProfileStore((state) => state.error);
  const folderError = useFolderStore((state) => state.error);

  useEffect(() => {
    const error =
      chatError || chatMemberError || callError || profileError || folderError;

    if (error) {
      toast.error(error);
    }
  }, [chatError, chatMemberError, callError, profileError, folderError]);
};
