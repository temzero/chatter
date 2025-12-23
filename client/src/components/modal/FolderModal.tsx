// components/modals/AddChatToFolderModal.tsx
import React, { useState, useEffect } from "react";
import { useFolders, useFolderStore } from "@/stores/folderStore";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import Checkbox from "../ui/buttons/CheckBox";
import Button from "../ui/buttons/Button";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { handleError } from "@/common/utils/error/handleError";
import { getColorFromPreset } from "@/common/constants/folderColor";

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
    | undefined;

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

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-semibold">{t("modal.folder.title")}</h2>

        <div className="flex items-center gap-3 my-2">
          <ChatAvatar chat={chat} />
          <h3 className="text-2xl font-semibold">{chat?.name}</h3>
        </div>

        <div className="flex flex-col max-h-60 overflow-y-auto">
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
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleUpdateFolder}
          className="text-green-500"
        >
          {t("common.actions.save")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default AddChatToFolderModal;
