// components/modals/DeleteFolderModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { modalAnimations } from "@/animations/modalAnimations";
import { useFolderStore } from "@/stores/folderStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useTranslation } from "react-i18next";

const DeleteFolderModal: React.FC = () => {
  const { t } = useTranslation();
  const deleteFolder = useFolderStore((state) => state.deleteFolder);
  const closeModal = useModalStore((state) => state.closeModal);
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const modalContent = useModalStore((state) => state.modalContent);
  const folderId = modalContent?.props?.folderId as string;

  const folder = useFolderStore.getState().getFolderById(folderId);
  if (!folder) return;

  const handleDelete = () => {
    closeModal();
    deleteFolder(folderId)
      .then(() => {
        setSidebar(SidebarMode.FOLDERS);
      })
      .catch((error) => {
        console.error("Error deleting folder:", error);
      });
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-3">
          {t("modal.delete_folder.title")}
        </h2>
        <h1
          style={{ color: folder.color ? folder.color : "" }}
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <span className="material-symbols-outlined text-3xl">
            folder_delete
          </span>
          {folder.name}
        </h1>

        <p className="mb-6 mt-4 text-sm opacity-70">
          {t("modal.delete_folder.description")}
        </p>
      </div>
      <div className="flex custom-border-t">
        <button
          className="p-3 text-red-500 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={handleDelete}
        >
          {t("common.actions.delete")}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          {t("common.actions.cancel")}
        </button>
      </div>
    </motion.div>
  );
};

export default DeleteFolderModal;
