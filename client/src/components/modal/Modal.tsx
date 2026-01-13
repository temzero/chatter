import { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModalType } from "@/common/enums/modalType";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { getCloseModal, useModalType } from "@/stores/modalStore";

// modal imports...
// const MediaViewer = lazy(() => import("./media/MediaViewer"));
// const FriendRequestModal = lazy(() => import("./FriendRequestModal"));
// const ForwardMessageModal = lazy(() => import("./ForwardMessageModal"));
// const DeleteMessageModal = lazy(() => import("./DeleteMessageModal"));
// const DeleteFolderModal = lazy(() => import("./DeleteFolderModal"));
// const BlockUserModal = lazy(() => import("./BlockUserModal"));
// const UnblockUserModal = lazy(() => import("./UnblockUserModal"));
// const MuteChatModal = lazy(() => import("./MuteChatModal"));
// const DeleteChatModal = lazy(() => import("./DeleteChatModal"));
// const UnfriendModal = lazy(() => import("./UnfriendModal"));
// const LeaveChatModal = lazy(() => import("./LeaveChatModal"));
// const AddMemberModal = lazy(() => import("./AddMemberModal"));
// const SetNicknameModal = lazy(() => import("./SetNicknameModal"));
// const DeleteCallModal = lazy(() => import("./DeleteCallModal"));
// const AddChatToFolderModal = lazy(() => import("./AddChatToFolderModal"));
// const CallModal = lazy(() => import("./call/CallModal"));
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
import DeleteCallModal from "./DeleteCallModal";
import AddChatToFolderModal from "./AddChatToFolderModal";
import CallModal from "./call/CallModal";

import FeedbackModal from "./FeedbackModal";

// Map modal types to components
const modalMap: Record<ModalType, ComponentType | null> = {
  [ModalType.OVERLAY]: null,
  [ModalType.CALL]: CallModal,
  [ModalType.MEDIA]: MediaViewer,
  [ModalType.FRIEND_REQUEST]: FriendRequestModal,
  [ModalType.FORWARD_MESSAGE]: ForwardMessageModal,
  [ModalType.DELETE_MESSAGE]: DeleteMessageModal,
  [ModalType.FOLDER]: AddChatToFolderModal,
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
  [ModalType.FEEDBACK]: FeedbackModal,
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
            className=" w-[400px] bg-(--panel-color) rounded-lg overflow-hidden custom-border"
          >
            <Component />
          </motion.div>
        ))}
    </motion.div>
  );
};

const Modal = () => {
  const type = useModalType();
  const closeModal = getCloseModal();

  return (
    <AnimatePresence>
      {type && <ModalContent type={type} onClose={closeModal} />}
    </AnimatePresence>
  );
};

export default Modal;
