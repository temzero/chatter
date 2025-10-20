// components/modals/DeleteFolderModal.tsx
import React from "react";
import { useModalActions, useModalData } from "@/stores/modalStore";
import { useFolderStore } from "@/stores/folderStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface DeleteFolderModalData {
  folderId: string;
}

const DeleteFolderModal: React.FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useModalActions();
  const deleteFolder = useFolderStore((state) => state.deleteFolder);
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const getFolderById = useFolderStore((state) => state.getFolderById);
  const data = useModalData() as unknown as DeleteFolderModalData | undefined;

  const folderId = data?.folderId;
  const folder = folderId ? getFolderById(folderId) : undefined;

  if (!folder) return null;

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
    <>
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
        <Button
          variant="ghost"
          fullWidth
          onClick={handleDelete}
          className="text-red-500"
        >
          {t("common.actions.delete")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default DeleteFolderModal;
