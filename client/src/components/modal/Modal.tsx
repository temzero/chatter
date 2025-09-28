import { ModalType, useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import MediaViewer from "./media/MediaViewer";
import FriendRequestModal from "./FriendRequestModal";
import ForwardMessageModal from "./ForwardMessageModal";
import DeleteMessageModal from "./DeleteMessageModal";
import { useShallow } from "zustand/shallow";
import { modalAnimation } from "@/animations/modalAnimations";
import AddFolderModal from "./AddFolderModal";
import DeleteFolderModal from "./DeleteFolderModal";
import BlockUserModal from "./BlockUserModal";
import UnblockUserModal from "./UnblockUserModal";
import MuteChatModal from "./MuteChatModal";
import DeleteChatModal from "./DeleteChatModal";
import UnfriendModal from "./UnfriendModal";
import LeaveChatModal from "./LeaveChatModal";
import AddMemberModal from "./AddMemberModal";
import SetNicknameModal from "./SetNicknameModal";
import CallModal from "./CallModal";
import DeleteCallModal from "./DeleteCallModal";

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
      case ModalType.DELETE_FOLDER:
        return <DeleteFolderModal />;
      case ModalType.ADD_FOLDER:
        return <AddFolderModal />;

      case ModalType.CALL:
        return <CallModal />;

      case ModalType.MUTE:
        return <MuteChatModal />;
      case ModalType.BLOCK_USER:
        return <BlockUserModal />;
      case ModalType.UNBLOCK_USER:
        return <UnblockUserModal />;

      case ModalType.DELETE_CHAT:
        return <DeleteChatModal />;
      case ModalType.UNFRIEND:
        return <UnfriendModal />;
      case ModalType.LEAVE_CHAT:
        return <LeaveChatModal />;
      case ModalType.ADD_MEMBER:
        return <AddMemberModal />;
      case ModalType.SET_NICKNAME:
        return <SetNicknameModal />;

      case ModalType.DELETE_CALL:
        return <DeleteCallModal />;

      default:
        return null;
    }
  }, [modalContent]);

  return (
    <AnimatePresence>
      {modalContent && (
        <motion.div
          {...modalAnimation}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[96] flex items-center justify-center"
          onClick={handleCloseModal}
        >
          {renderModalContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
