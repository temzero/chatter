// store/modalStore.ts
import { create } from "zustand";

export enum ModalType {
  MEDIA = "media",
  FRIEND_REQUEST = "friend-request",
  MESSAGE = "message",
  FORWARD_MESSAGE = "forward-message",
  DELETE_MESSAGE = "delete-message",
}

type ModalContent = {
  type: ModalType | null;
  props?: Record<string, unknown>;
};

interface ModalState {
  modalContent: ModalContent | null;
  currentMediaId: string | null;
  focusMessageId: string | null;
}

interface ModalActions {
  openModal: (type: ModalType, props?: Record<string, unknown>) => void;
  openMessageModal: (messageId: string) => void;
  openMediaModal: (mediaId: string) => void;
  closeModal: () => void;
  setFocusMessageId: (messageId: string | null) => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  modalContent: null,
  currentMediaId: null,
  focusMessageId: null,

  openModal: (type, props) => {
    set({
      modalContent: { type, props },
    });
  },

  openMessageModal: (messageId) =>
    set({
      focusMessageId: messageId,
      modalContent: { type: ModalType.MEDIA, props: { messageId } },
    }),

  openMediaModal: (mediaId) =>
    set({
      currentMediaId: mediaId,
      modalContent: { type: ModalType.MEDIA, props: { mediaId } },
    }),

  closeModal: () =>
    set({
      modalContent: null,
      currentMediaId: null,
      focusMessageId: null,
    }),

  setFocusMessageId: (messageId) => set({ focusMessageId: messageId }),
}));

export const useCurrentMediaId = () =>
  useModalStore((state) => state.currentMediaId);

export const useModalContent = () =>
  useModalStore((state) => state.modalContent);

export const useIsModalOpen = () =>
  useModalStore((state) => state.modalContent !== null);

export const useModalActions = () =>
  useModalStore((state) => ({
    openModal: state.openModal,
    openMediaModal: state.openMediaModal,
    closeModal: state.closeModal,
    setFocusMessageId: state.setFocusMessageId,
  }));

export const useFocusMessageId = () =>
  useModalStore((state) => state.focusMessageId);
