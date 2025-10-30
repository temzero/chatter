// components/sidebar/SidebarNewFolder.tsx
import React, { useRef, useState, useEffect } from "react";
import { getChats } from "@/stores/chatStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useFolderStore } from "@/stores/folderStore";
import { getSetSidebar, useSidebarStore } from "@/stores/sidebarStore";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ChatListItemSelection from "@/components/ui/chat/ChatListItemSelection";
import SidebarLayout from "@/layouts/SidebarLayout";

const COLORS = [
  null,
  "#FF5252",
  "#E040FB",
  "#536DFE",
  "#00BCD4",
  "#4CAF50",
  "#CDDC39",
  "#FFEB3B",
  "#FF9800",
];

interface folderToEdit {
  id: string;
  name: string;
  color: string | null;
  chatIds: string[];
  types: (ChatType.DIRECT | ChatType.GROUP | ChatType.CHANNEL)[];
}

const SidebarNewFolder: React.FC = () => {
  const { t } = useTranslation();
  const chats = getChats();
  const setSidebar = getSetSidebar();
  const createFolder = useFolderStore.getState().createFolder;
  const updateFolder = useFolderStore.getState().updateFolder;

  const sidebarData = useSidebarStore((state) => state.sidebarData) as
    | { folderToEdit?: folderToEdit }
    | undefined;
  const folderToEdit = sidebarData?.folderToEdit;
  const isEditMode = !!folderToEdit;

  const folderNameRef = useRef<HTMLInputElement>(null);
  const [folderTypes, setFolderTypes] = useState<
    (ChatType.DIRECT | ChatType.GROUP | ChatType.CHANNEL)[]
  >(folderToEdit?.types || []);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    folderToEdit?.color || COLORS[0]
  );
  const [selectedChats, setSelectedChats] = useState<string[]>(
    folderToEdit?.chatIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats
    .filter((chat) => {
      const isSelected = selectedChats.includes(chat.id);
      const isTypeAlreadyIncluded = folderTypes.includes(
        chat.type as (typeof folderTypes)[number]
      );
      return isSelected || !isTypeAlreadyIncluded;
    })
    .filter((chat) =>
      (chat.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  useEffect(() => {
    if (folderToEdit && folderNameRef.current) {
      folderNameRef.current.value = folderToEdit.name;
    }
  }, [folderToEdit]);

  const handleSubmit = async () => {
    const folderName = folderNameRef.current?.value.trim();
    if (!folderName) {
      toast.error(t("sidebar_folders.new_folder.folder_name_empty_error"));
      return;
    }

    const payload = {
      name: folderName,
      types: folderTypes,
      color: selectedColor,
      chatIds: selectedChats,
    };

    if (isEditMode && folderToEdit) {
      updateFolder({ ...folderToEdit, ...payload });
    } else {
      await createFolder(payload);
    }

    setSidebar(SidebarMode.FOLDERS);
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <SidebarLayout
      title={
        isEditMode
          ? t("sidebar_folders.new_folder.edit_title")
          : t("sidebar_folders.new_folder.create_title")
      }
      backLocation={
        isEditMode
          ? { mode: SidebarMode.FOLDER, data: { folderId: folderToEdit.id } }
          : SidebarMode.FOLDERS
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 p-2 overflow-y-auto pb-48 flex-1">
          {/* Color Selection */}
          <div className="grid grid-cols-9 gap-2 mt-2">
            {COLORS.map((color) => (
              <button
                key={color ?? "none"}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedColor === color
                    ? "ring-4 -ring-offset-4 ring-offset-[var(--sidebar-color)] ring-[--border-color]"
                    : ""
                }`}
                style={{ backgroundColor: color ?? "transparent" }}
                title={color ?? "Default Text Color"}
              >
                {color === null && (
                  <span className="material-symbols-outlined opacity-70">
                    close
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Folder Type Multi-Select */}
          <div>
            <h2 className="mb-2 font-bold">
              {folderTypes.length === 3
                ? t("chat.all")
                : folderTypes.length > 0
                ? t("chat.all_with_type")
                : t("chat.label")}
            </h2>
            <div className="flex gap-1">
              {[ChatType.DIRECT, ChatType.GROUP, ChatType.CHANNEL].map(
                (type) => {
                  const isSelected = folderTypes.includes(
                    type as (typeof folderTypes)[number]
                  );
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        setFolderTypes((prev) =>
                          isSelected
                            ? prev.filter((t) => t !== type)
                            : [...prev, type as (typeof folderTypes)[number]]
                        )
                      }
                      className={`flex-1 py-1 rounded border-2 border-[var(--border-color)] text-sm capitalize transition-colors duration-200 ${
                        isSelected ? "bg-[--primary-green] font-semibold" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined opacity-50 ml-1">
                        {type === ChatType.DIRECT
                          ? "person"
                          : type === ChatType.GROUP
                          ? "groups"
                          : "monitor"}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Chat Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">
                {selectedChats.length > 0 &&
                  t(
                    "sidebar_folders.new_folder.chat_selection.selected_count",
                    {
                      count: selectedChats.length,
                    }
                  )}
              </h2>
              {selectedChats.length > 0 && (
                <button
                  onClick={() => setSelectedChats([])}
                  className="text-xs opacity-70 hover:opacity-100 text-red-400"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>

            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "sidebar_folders.new_folder.chat_selection.search_placeholder"
                )}
                className="w-full p-2 text-sm rounded border border-[var(--border-color)] bg-transparent"
              />
            </div>

            <div className="overflow-y-auto">
              {filteredChats.length > 0 && (
                <ul className="divide-y divide-[var(--border-color)]">
                  {filteredChats.map((chat) => (
                    <ChatListItemSelection
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChats.includes(chat.id)}
                      toggleChatSelection={toggleChatSelection}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 -space-y-4">
          <div
            style={{
              color: selectedColor ? "black" : "var(--text-color)",
              backgroundColor: selectedColor || "",
            }}
            className="inline-block z-10 bg-[--background-color] rounded-t-lg px-4 pt-1 pb-0 border-t-4 border-l-4 border-black/30 -mb-4 select-none"
          >
            <span className="material-symbols-outlined font-bold text-4xl">
              {isEditMode ? "bookmark_manager" : "create_new_folder"}
            </span>
          </div>
          <div
            style={{
              color: selectedColor ? "black" : "var(--text-color)",
              backgroundColor: selectedColor || "",
            }}
            className="z-20 p-3 bg-[--background-color] border-t-4 border-l-4 border-black/30 shadow-4xl rounded-tr-lg"
          >
            <div>
              <div className="mb-3">
                <input
                  type="text"
                  ref={folderNameRef}
                  defaultValue={folderToEdit?.name || ""}
                  onKeyDown={handleKeyDown}
                  placeholder={t(
                    "sidebar_folders.new_folder.folder_name_placeholder"
                  )}
                  className="flex-1 outline-none text-2xl w-full font-semibold"
                  autoFocus
                  maxLength={24}
                  style={{ textTransform: "none" }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="border-t-2 border-l-2 border-black/30 w-full py-2 rounded flex items-center justify-center gap-2 shadow-xl bg-[--primary-green] hover:bg-[--primary-green-dark)]"
            >
              {isEditMode
                ? t("common.actions.save_changes")
                : t("sidebar_folders.new_folder.buttons.create")}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarNewFolder;
