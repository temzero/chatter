import { create } from "zustand";
import { ModalType } from "@/common/enums/modalType";

// ---- STATE + ACTIONS ----
interface ModalState {
  type: ModalType | null;
  data: Record<string, unknown> | null;
  focusMessageId: string | null;
  replyToMessageId: string | null;
}

interface ModalActions {
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const initialState: ModalState = {
  type: null,
  data: null,
  focusMessageId: null,
  replyToMessageId: null,
};

// ---- STORE ----
export const useModalStore = create<ModalState & ModalActions>((set) => ({
  ...initialState,

  openModal: (type, data = {}) => set({ type, data }),

  closeModal: () =>
    set({
      type: null,
      data: null,
      focusMessageId: null,
      replyToMessageId: null,
    }),
}));

export { ModalType };

// EXPORT HOOKS

// ---- SELECTORS ----
export const useModalType = () => useModalStore((state) => state.type);
export const getModalType = () => useModalStore.getState().type
export const getModalData = () => useModalStore.getState().data;
export const useReplyToMessageId = () =>
  useModalStore((state) => state.replyToMessageId);
export const useMediaModalData = () => {
  const data = useModalStore((state) => state.data);
  return data?.attachmentId as string | undefined;
};

// ---- MESSAGE STATE HOOKS ----
export const useIsMessageFocus = (messageId: string) =>
  useModalStore((state) => state.focusMessageId === messageId);

export const useIsReplyToThisMessage = (messageId: string) =>
  useModalStore((state) => state.replyToMessageId === messageId);

// ---- SPECIALIZED ACTION HOOKS ----
export const getOpenModal = () => useModalStore.getState().openModal;
export const getCloseModal = () => useModalStore.getState().closeModal;

export const setOpenMediaModal = (attachmentId: string) => {
  useModalStore.setState({
    type: ModalType.MEDIA,
    data: { attachmentId },
  });
};

export const setOpenFocusMessageModal = (messageId: string) => {
  useModalStore.setState({
    type: ModalType.OVERLAY,
    focusMessageId: messageId,
  });
};

export const setOpenReplyToMessageModal = (messageId: string) => {
  useModalStore.setState({
    type: ModalType.OVERLAY,
    replyToMessageId: messageId,
  });
};
