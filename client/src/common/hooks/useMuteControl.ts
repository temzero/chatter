// hooks/chat/useMuteControl.ts
import { useChatStore } from "@/stores/chatStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { handleError } from "@/common/utils/error/handleError";

export function useMuteControl(chatId: string, myMemberId: string) {
  const openModal = getOpenModal();
  const setMute = useChatStore.getState().setMute;

  const mute = () => {
    openModal(ModalType.MUTE, {
      chatId,
      myMemberId,
    });
  };

  const unmute = async () => {
    try {
      setMute(chatId, myMemberId, null);
    } catch (error) {
      handleError(error, "Failed to unmute chat");
    }
  };

  return {
    mute,
    unmute,
  };
}
