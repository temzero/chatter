import React, { useState, useEffect } from "react";
import { useFolders, useFolderStore } from "@/stores/folderStore";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import Checkbox from "../ui/buttons/CheckBox";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { handleError } from "@/common/utils/error/handleError";
import { getColorFromPreset } from "@/common/constants/folderColor";
import ConfirmDialog from "./layout/ConfirmDialog";

interface AddChatToFolderModalData {
  chat: ChatResponse;
}

const AddChatToFolderModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const setSidebar = getSetSidebar();
  const addChatToFolder = useFolderStore.getState().addChatToFolder;
  const folders = useFolders();
  const data = getModalData() as unknown as
    | AddChatToFolderModalData

  const chat = data?.chat;
  const chatId = chat?.id;
  // Pre-check folders that already contain the chat
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!folders || !chatId) return;
    const initialSelected = folders
      .filter((f) => f.chatIds.includes(chatId))
      .map((f) => f.id);
    setSelectedFolderIds(initialSelected);
  }, [folders, chatId]);

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleUpdateFolder = async () => {
    if (!chatId) return;
    try {
      // Add chat only to folders it isn’t already in
      for (const folderId of selectedFolderIds) {
        const folder = folders.find((f) => f.id === folderId);
        if (folder && !folder.chatIds.includes(chatId)) {
          await addChatToFolder(chatId, folderId);
        }
      }
      closeModal();
      setSidebar(SidebarMode.FOLDERS);
    } catch (error) {
      handleError(error, "Failed to add chat to folder");
    }
  };

  const folderIcon = (
    <span className="material-symbols-outlined text-3xl! font-bold text-blue-500">
      folder_open
    </span>
  );

  const chatInfo = (
    <div className="flex items-center gap-3 mb-4">
      <ChatAvatar chat={chat} />
      <h3 className="text-2xl font-semibold">{chat?.name}</h3>
    </div>
  );

  const folderList = (
    <div className="flex flex-col max-h-60 overflow-y-auto mb-4">
      {folders.map((folder) => (
        <label
          key={folder.id}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-(--hover-color`}
        >
          <Checkbox
            checked={selectedFolderIds.includes(folder.id)}
            onChange={() => handleToggleFolder(folder.id)}
          />
          <span
            style={{ color: getColorFromPreset(folder.color) ?? undefined }}
            className="material-symbols-outlined filled"
          >
            folder_open
          </span>
          {folder.name}
        </label>
      ))}
    </div>
  );

  return (
    <ConfirmDialog
      title={t("modal.folder.title")}
      icon={folderIcon}
      confirmText={t("common.actions.save")}
      onGreenAction={handleUpdateFolder}
      onCancel={closeModal}
    >
      {chatInfo}
      {folderList}
    </ConfirmDialog>
  );
};

export default AddChatToFolderModal;
