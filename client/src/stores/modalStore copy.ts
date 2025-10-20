import { create } from "zustand";
import { ModalType } from "@/common/enums/modalType";

interface ModalState {
  type: ModalType | null;
  data: Record<string, unknown> | null;
  focusMessageId: string | null;
  replyToMessageId: string | null;
}

interface ModalActions {
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  openOverlayModal: (messageId: string) => void;
  openMediaModal: (attachmentId: string) => void;
  setReplyToMessageId: (messageId: string | null) => void;
  closeModal: () => void;
}

export { ModalType };

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  type: null,
  data: null,
  focusMessageId: null,
  replyToMessageId: null,

  // ✅ generic modal open
  openModal: (type, data = {}) =>
    set({
      type,
      data,
      focusMessageId: null,
      replyToMessageId: null,
    }),

  // ✅ open message focus modal
  openOverlayModal: (messageId) =>
    set({
      type: ModalType.OVERLAY,
      data: { messageId },
      focusMessageId: messageId,
    }),

  // ✅ open media modal
  openMediaModal: (attachmentId) =>
    set({
      type: ModalType.MEDIA,
      data: { attachmentId },
    }),

  setReplyToMessageId: (messageId) => set({ replyToMessageId: messageId }),

  // ✅ clean close
  closeModal: () =>
    set({
      type: null,
      data: null,
      focusMessageId: null,
      replyToMessageId: null,
    }),
}));

// --------------------------
// 🔍 Custom Selectors / Hooks
// --------------------------

export const useModalType = () => useModalStore((state) => state.type);
export const useModalData = () => useModalStore.getState().data;
export const useOpenModal = () => useModalStore((state) => state.openModal);
export const useCloseModal = () => useModalStore((state) => state.closeModal);

export const useIsMessageFocus = (messageId: string | null | undefined) =>
  useModalStore((state) =>
    messageId ? state.focusMessageId === messageId : false
  );

export const useIsReplyToThisMessage = (messageId: string | null | undefined) =>
  useModalStore((state) =>
    messageId ? state.replyToMessageId === messageId : false
  );
