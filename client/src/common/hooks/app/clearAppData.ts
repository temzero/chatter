import { useChatStore } from "@/stores/chatStore";
import { useFolderStore } from "@/stores/folderStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useMessageStore } from "@/stores/messageStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useModalStore } from "@/stores/modalStore";
import { useCallStore } from "@/stores/callStore";
import { useAuthStore } from "@/stores/authStore";
import { useAttachmentStore } from "@/stores/messageAttachmentStore";
import { usePresenceStore } from "@/stores/presenceStore";
import { useProfileStore } from "@/stores/profileStore";
import { useTypingStore } from "@/stores/typingStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useSidebarStore } from "@/stores/sidebarStore";

export const clearAppData = () => {
  // Clear auth first
  useAuthStore.getState().clearAuthStore();

  // Clear UI/modals before clearing data stores
  useModalStore.getState().clearModalStore();
  useCallStore.getState().clearCallStore();

  // Clear all session-based data
  useChatMemberStore.getState().clearChatMemberStore();
  useChatStore.getState().clearChatStore();
  useFolderStore.getState().clearFolderStore();
  useFriendshipStore.getState().clearFriendshipStore();
  useMessageStore.getState().clearMessageStore();
  useAttachmentStore.getState().clearAttachmentStore();
  usePresenceStore.getState().clearPresenceStore();
  useProfileStore.getState().clearProfileStore();
  useTypingStore.getState().clearTypingStore();

  // Clear sidebar configurations
  useSidebarStore.getState().clearSidebarStore();
  useSidebarInfoStore.getState().clearSidebarInfoStore();
};
