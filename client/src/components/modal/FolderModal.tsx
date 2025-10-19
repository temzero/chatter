// components/modals/AddChatToFolderModal.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { useFolderStore } from "@/stores/folderStore";
import { useModalStore } from "@/stores/modalStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import Checkbox from "../ui/buttons/CheckBox";
import { Button } from "../ui/buttons/Button";

const AddChatToFolderModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = useModalStore((state) => state.closeModal);
  const addChatToFolder = useFolderStore((state) => state.addChatToFolder);
  const folders = useFolderStore((state) => state.folders);
  const setSidebar = useSidebarStore((state) => state.setSidebar);

  const modalContent = useModalStore((state) => state.modalContent);
  const chatId = modalContent?.props?.chatId as string;

  // Pre-check folders that already contain the chat
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!folders || !chatId) return;
    const initialSelected = folders
      .filter((f) => f.chatIds.includes(chatId))
      .map((f) => f.id);
    setSelectedFolderIds(initialSelected);
  }, [folders, chatId]);

  if (!folders || folders.length === 0) return null;

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
      console.error("Failed to add chat to folder:", error);
    }
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-3">
          {t("modal.folder.title")}
        </h2>

        <div className="flex flex-col max-h-60 overflow-y-auto">
          {folders.map((folder) => (
            <label
              key={folder.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-[--hover-color]`}
            >
              <Checkbox
                checked={selectedFolderIds.includes(folder.id)}
                onChange={() => handleToggleFolder(folder.id)}
              />
              <span
                style={{ color: folder.color || "" }}
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
    </motion.div>
  );
};

export default AddChatToFolderModal;
