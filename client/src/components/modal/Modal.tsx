import { ModalType, useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import MediaViewer from "./media/MediaViewer";
import FriendRequestModal from "./FriendRequestModal";
import ForwardMessageModal from "./ForwardMessageModal";
import DeleteMessageModal from "./DeleteMessageModal";
import { useShallow } from "zustand/shallow";
import { modalAnimation } from "@/animations/modalAnimations";

const Modal = () => {
  const { modalContent, closeModal } = useModalStore(
    useShallow((state) => ({
      modalContent: state.modalContent,
      closeModal: state.closeModal,
    }))
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeModal]);

  const handleCloseModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const renderModalContent = useMemo(() => {
    if (!modalContent) return null;

    switch (modalContent.type) {
      case ModalType.MEDIA:
        return <MediaViewer />;
      case ModalType.FRIEND_REQUEST:
        return <FriendRequestModal />;
      case ModalType.FORWARD_MESSAGE:
        return <ForwardMessageModal />;
      case ModalType.DELETE_MESSAGE:
        return <DeleteMessageModal />;
      default:
        return null;
    }
  }, [modalContent]);

  return (
    <AnimatePresence>
      {modalContent && (
        <motion.div
          {...modalAnimation}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[96] flex items-center justify-center text-white"
          onClick={handleCloseModal}
        >
          {renderModalContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
