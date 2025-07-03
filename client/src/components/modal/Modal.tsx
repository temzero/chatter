import { ModalType, useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import MediaModal from "./media/MediaModal";
import FriendRequestModal from "./FriendRequestModal";
import ForwardMessageModal from "./ForwardMessageModal";
import DeleteMessageModal from "./DeleteMessageModal";
import { MessageResponse } from "@/types/responses/message.response";

// Animation presets for different modal types
const modalAnimations = {
  default: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    content: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
      transition: { duration: 0.2 },
    },
  },
  message: {
    // No animation for message modal
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    content: {},
  },
};

const Modal = () => {
  const { modalContent, closeModal } = useModalStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeModal]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const renderModalContent = () => {
    if (!modalContent) return null;

    switch (modalContent.type) {
      case ModalType.MEDIA:
        return <MediaModal {...modalContent.props} />;

      case ModalType.FRIEND_REQUEST:
        return (
          <FriendRequestModal
            receiver={{
              id: "",
              username: "",
              firstName: "",
              lastName: "",
              avatarUrl: "",
            }}
            {...modalContent.props}
          />
        );

      case ModalType.FORWARD_MESSAGE:
        return (
          <ForwardMessageModal
            message={modalContent.props?.message as MessageResponse}
          />
        );

      case ModalType.DELETE_MESSAGE:
        return (
          <DeleteMessageModal
            message={modalContent.props?.message as MessageResponse}
          />
        );

      default:
        return null;
    }
  };

  const type = modalContent?.type;

  const animation =
    type && type in modalAnimations
      ? modalAnimations[type as keyof typeof modalAnimations]
      : modalAnimations.default;

  return (
    <AnimatePresence>
      {modalContent && (
        <motion.div
          key={modalContent.type}
          {...animation.backdrop}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[96] flex flex-col items-center justify-center text-white"
          onClick={handleBackdropClick}
        >
          {type === "message" ? (
            <div className="relative">{renderModalContent()}</div>
          ) : (
            <motion.div {...animation.content} className="relative">
              {renderModalContent()}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
