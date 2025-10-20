import { create } from "zustand";
import { ModalType } from "@/common/enums/modalType";

interface ModalState {
  type: ModalType | null;
  data: Record<string, unknown> | null;
}

interface ModalActions {
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  type: null,
  data: null,

  openModal: (type, data = {}) =>
    set({
      type,
      data,
    }),

  closeModal: () =>
    set({
      type: null,
      data: null,
    }),
}));

export { ModalType };

// Custom hooks for specific modal types
export const useModalActions = () => {
  const { openModal, closeModal } = useModalStore();

  return {
    openModal,
    closeModal,
    openMediaModal: (attachmentId: string) =>
      openModal(ModalType.MEDIA, { attachmentId }),

    openFocusMessageModal: (messageId: string) =>
      openModal(ModalType.OVERLAY, { focusedMessageId: messageId }),

    // setReplyToMessage: (messageId: string | null) =>
    openReplyToMessageModal: (messageId: string | null) =>
      openModal(ModalType.OVERLAY, { replyToMessageId: messageId }),
  };
};

// Selectors
export const useModalType = () => useModalStore((state) => state.type);
// export const useModalData = () => useModalStore((state) => state.data);
export const useModalData = () => useModalStore.getState().data;

// Specific data selectors
export const useMediaModalData = () => {
  const data = useModalStore((state) => state.data);
  return data?.attachmentId as string | undefined;
};

export const useFocusMessageModalData = () => {
  const data = useModalStore((state) => state.data);
  return data?.focusedMessageId as string | undefined;
};

export const useReplyToMessageId = () => {
  const data = useModalStore((state) => state.data);
  return data?.replyToMessageId as string | undefined;
};

// ✅ Message focus and reply hooks
export const useIsMessageFocus = (messageId: string | null | undefined) =>
  useModalStore(
    (state) => !!messageId && state.data?.focusedMessageId === messageId
  );

export const useIsReplyToThisMessage = (messageId: string | null | undefined) =>
  useModalStore(
    (state) => !!messageId && state.data?.replyToMessageId === messageId
  );
