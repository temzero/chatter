import { create } from "zustand";

type ModalType = "media" | "friend-request" | "forward-message" | null;
type ModalContent = {
  type: ModalType;
  props?: Record<string, unknown>;
};

interface ModalState {
  modalContent: ModalContent | null;
  currentMediaId: string | null; // Keeping for backward compatibility
}

interface ModalActions {
  openModal: (type: ModalType, props?: Record<string, unknown>) => void;
  openMediaModal: (mediaId: string) => void; // Legacy support
  closeModal: () => void;
}

export const useModalStore = create<ModalState & ModalActions>((set) => ({
  modalContent: null,
  currentMediaId: null,

  openModal: (type, props) =>
    set({
      modalContent: { type, props },
    }),

  openMediaModal: (mediaId) =>
    set({
      currentMediaId: mediaId,
      modalContent: { type: "media", props: { mediaId } },
    }),

  closeModal: () =>
    set({
      modalContent: null,
      currentMediaId: null,
    }),
}));

// Selector hooks for modal
export const useCurrentMediaId = () =>
  useModalStore((state) => state.currentMediaId);
export const useModalContent = () =>
  useModalStore((state) => state.modalContent);
export const useModalActions = () =>
  useModalStore((state) => ({
    openModal: state.openModal,
    openMediaModal: state.openMediaModal,
    closeModal: state.closeModal,
  }));
