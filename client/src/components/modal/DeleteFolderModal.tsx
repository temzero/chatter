// components/modals/DeleteFolderModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useFolderStore } from "@/stores/folderStore";

const DeleteFolderModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const folderId = modalContent?.props?.folderId as string;

  const folder = useFolderStore.getState().getFolderById(folderId);
  if (!folder) return;

  const handleDelete = () => {
    // Replace with your actual folder deletion logic
    // e.g., folderWebSocketService.deleteFolder({ folderId });
    console.log("Deleting folder:", folderId);
    closeModal();
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-3">
          <span className="material-symbols-outlined text-3xl">
            folder_delete
          </span>
          <h2 className="text-2xl font-semibold">Delete Folder</h2>
        </div>
        <h1
          style={{ color: folder.color ? folder.color : "" }}
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          {/* <span className="material-symbols-outlined text-3xl">
            folder_delete
          </span> */}
          {folder.name}
        </h1>

        <p className="mb-6 mt-4 text-sm opacity-70">
          Deleting this folder would remove it from your workspace.{" "}
          <br />
          All chats currently in this folder will remain in your chat list but
          will no longer be organized in this folder.
        </p>
      </div>
      <div className="flex custom-border-t">
        <button
          className="p-3 text-red-500 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default DeleteFolderModal;
