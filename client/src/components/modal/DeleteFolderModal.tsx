// components/modals/DeleteFolderModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { useFolderStore } from "@/stores/folderStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getColorFromPreset } from "@/common/constants/folderColor";
import ConfirmDialog from "./layout/ConfirmDialog";

interface DeleteFolderModalData {
  folderId: string;
}

const DeleteFolderModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const setSidebar = getSetSidebar();
  const deleteFolder = useFolderStore.getState().deleteFolder;
  const getFolderById = useFolderStore.getState().getFolderById;
  const data = getModalData() as unknown as DeleteFolderModalData | undefined;

  const folderId = data?.folderId;
  const folder = folderId ? getFolderById(folderId) : undefined;

  if (!folder) return null;

  const handleDelete = async () => {
    closeModal();
    await deleteFolder(folderId)
      .then(() => {
        setSidebar(SidebarMode.FOLDERS);
      })
      .catch((error) => {
        console.error("Error deleting folder:", error);
      });
    toast.success(t("toast.folder.deleted", { name: folder.name }));
  };

  const folderColor = getColorFromPreset(folder.color);

  return (
    <ConfirmDialog
      title={t("modal.delete_folder.title")}
      description={t("modal.delete_folder.description")}
      icon={
        <span
          style={{ color: folderColor ?? "" }}
          className="material-symbols-outlined text-3xl!"
        >
          folder_delete
        </span>
      }
      confirmText={t("common.actions.delete")}
      onRedAction={handleDelete}
    />
  );
};

export default DeleteFolderModal;
