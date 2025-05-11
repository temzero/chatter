// Modal.tsx

import MediaModal from "./media/MediaModal";
import FriendRequestModal from "./FriendRequestModal";
import { useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

// Modal.tsx improvements:
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

  // Consider adding escape key and backdrop click handlers

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  function renderModalContent() {
    if (!modalContent) return null;
    switch (modalContent.type) {
      case "media":
        return <MediaModal {...modalContent.props} />;
      case "friend-request":
        return (
          <FriendRequestModal
            user={{
              id: "",
              username: "",
              firstName: "",
              lastName: "",
              avatar: "",
            }}
            {...modalContent.props}
          />
        );
      default:
        return null;
    }
  }

  return (
    <AnimatePresence>
      {modalContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[99] flex flex-col items-center justify-center text-white"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.6 }}
            className="relative"
          >
            {renderModalContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
