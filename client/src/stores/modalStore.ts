import { create } from "zustand";
import { useShallow } from "zustand/shallow";

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
  currentAttachmentId: string | null;
  focusMessageId: string | null;
  replyToMessageId: string | null;
}

interface ModalActions {
  openModal: (type: ModalType, props?: Record<string, unknown>) => void;
  openMessageModal: (messageId: string) => void;
  openMediaModal: (mediaId: string) => void;
  closeModal: () => void;
  setFocusMessageId: (messageId: string | null) => void;
  setReplyToMessageId: (messageId: string | null) => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  modalContent: null,
  currentAttachmentId: null,
  focusMessageId: null,
  replyToMessageId: null,

  openModal: (type, props) => {
    set({
      modalContent: { type, props },
      focusMessageId: null,
    });
  },

  openMessageModal: (messageId) =>
    set({
      focusMessageId: messageId,
      modalContent: { type: ModalType.MEDIA, props: { messageId } },
    }),

  openMediaModal: (mediaId) =>
    set({
      currentAttachmentId: mediaId,
      modalContent: { type: ModalType.MEDIA, props: { mediaId } },
    }),

  closeModal: () =>
    set({
      modalContent: null,
      // currentAttachmentId: null,
      focusMessageId: null,
      replyToMessageId: null,
    }),

  setFocusMessageId: (messageId) => set({ focusMessageId: messageId }),
  setReplyToMessageId: (messageId) => set({ replyToMessageId: messageId }),
}));

// Selectors and custom hooks
export const useCurrentMediaId = () =>
  useModalStore((state) => state.currentAttachmentId);

export const useModalContent = () =>
  useModalStore((state) => state.modalContent);

export const useIsModalOpen = () =>
  useModalStore((state) => state.modalContent !== null);

export const useIsMessageFocus = (messageId: string) =>
  useModalStore(useShallow((state) => state.focusMessageId === messageId));

export const useReplyToMessageId = () =>
  useModalStore(useShallow((state) => state.replyToMessageId));

export const useIsReplyToThisMessage = (messageId: string) =>
  useModalStore(useShallow((state) => state.replyToMessageId === messageId));

export const useSetReplyToMessageId = () =>
  useModalStore((state) => state.setReplyToMessageId);
