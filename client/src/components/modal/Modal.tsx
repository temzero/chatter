import { ComponentType, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModalType } from "@/common/enums/modalType";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { useModalActions, useModalType } from "@/stores/modalStore";

// modal imports...
import MediaViewer from "./media/MediaViewer";
import FriendRequestModal from "./FriendRequestModal";
import ForwardMessageModal from "./ForwardMessageModal";
import DeleteMessageModal from "./DeleteMessageModal";
import DeleteFolderModal from "./DeleteFolderModal";
import BlockUserModal from "./BlockUserModal";
import UnblockUserModal from "./UnblockUserModal";
import MuteChatModal from "./MuteChatModal";
import DeleteChatModal from "./DeleteChatModal";
import UnfriendModal from "./UnfriendModal";
import LeaveChatModal from "./LeaveChatModal";
import AddMemberModal from "./AddMemberModal";
import SetNicknameModal from "./SetNicknameModal";
import CallModal from "./call/CallModal";
import DeleteCallModal from "./DeleteCallModal";
import FolderModal from "./FolderModal";

// Map modal types to components
const modalMap: Record<ModalType, ComponentType | null> = {
  [ModalType.OVERLAY]: null,
  [ModalType.CALL]: CallModal,
  [ModalType.MEDIA]: MediaViewer,
  [ModalType.FRIEND_REQUEST]: FriendRequestModal,
  [ModalType.FORWARD_MESSAGE]: ForwardMessageModal,
  [ModalType.DELETE_MESSAGE]: DeleteMessageModal,
  [ModalType.FOLDER]: FolderModal,
  [ModalType.DELETE_FOLDER]: DeleteFolderModal,
  [ModalType.MUTE]: MuteChatModal,
  [ModalType.BLOCK_USER]: BlockUserModal,
  [ModalType.UNBLOCK_USER]: UnblockUserModal,
  [ModalType.DELETE_CHAT]: DeleteChatModal,
  [ModalType.UNFRIEND]: UnfriendModal,
  [ModalType.LEAVE_CHAT]: LeaveChatModal,
  [ModalType.ADD_MEMBER]: AddMemberModal,
  [ModalType.SET_NICKNAME]: SetNicknameModal,
  [ModalType.DELETE_CALL]: DeleteCallModal,
};

const ModalContent = ({
  type,
  onClose,
}: {
  type: ModalType;
  onClose: () => void;
}) => {
  const Component = modalMap[type];
  const isCustomAnimated = type === ModalType.CALL || type === ModalType.MEDIA;

  return (
    <motion.div
      {...modalAnimations.modal}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        if (!isCustomAnimated && e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 99 }}
    >
      {/* ✅ Only render modal content if Component exists */}
      {Component &&
        (isCustomAnimated ? (
          <Component />
        ) : (
          <motion.div
            {...modalAnimations.children}
            className="bg-[var(--sidebar-color)] w-[400px] rounded custom-border"
          >
            <Component />
          </motion.div>
        ))}
    </motion.div>
  );
};

const Modal = () => {
  const type = useModalType();
  const { closeModal } = useModalActions();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeModal]);

  return (
    <AnimatePresence>
      {type && <ModalContent type={type} onClose={closeModal} />}
    </AnimatePresence>
  );
};

export default Modal;
