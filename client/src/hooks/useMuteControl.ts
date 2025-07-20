// hooks/chat/useMuteControl.ts
import { useChatStore } from "@/stores/chatStore";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { toast } from "react-toastify";

export function useMuteControl(chatId: string, myMemberId: string) {
  const openModal = useModalStore((state) => state.openModal);
  const setMute = useChatStore((state) => state.setMute);

  const mute = () => {
    openModal(ModalType.MUTE, {
      chatId,
      myMemberId,
    });
  };

  const unmute = async () => {
    try {
      await setMute(chatId, myMemberId, null);
      toast.success("Unmuted successfully");
    } catch (error) {
      console.error("Failed to unmute chat:", error);
      toast.error("Failed to unmute chat");
    }
  };

  return {
    mute,
    unmute,
  };
}
