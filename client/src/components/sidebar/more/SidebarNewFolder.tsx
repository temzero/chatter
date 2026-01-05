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
import SearchBar from "@/components/ui/SearchBar";
import {
  COLORS_ARRAY,
  type ColorPreset,
  getContrastColor,
  getColorFromPreset,
} from "@/common/constants/folderColor";

interface folderToEdit {
  id: string;
  name: string;
  color: ColorPreset | null; // Fixed: Make it nullable
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

  const [selectedColor, setSelectedColor] = useState<ColorPreset>(
    folderToEdit?.color ?? null
  );

  const [selectedChats, setSelectedChats] = useState<string[]>(
    folderToEdit?.chatIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats
    .filter((chat) => {
      const isSelected = selectedChats.includes(chat.id);
      const isTypeMatch =
        folderTypes.length === 0 ||
        folderTypes.includes(chat.type as (typeof folderTypes)[number]);
      return isSelected || isTypeMatch;
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

  // Helper function to get text color for footer
  const getFooterTextColor = () => {
    const hex = getColorFromPreset(selectedColor);
    if (!hex) return "var(--text-color)";
    return getContrastColor(hex);
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
      padding
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 overflow-y-auto pb-48 flex-1">
          {/* Color Selection */}
          <div className="grid grid-cols-9 gap-2 p-1">
            {COLORS_ARRAY.map((color) => {
              const bgColor = getColorFromPreset(color);

              return (
                <button
                  key={color ?? "none"}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full! flex items-center justify-center ${
                    selectedColor === color
                      ? "border-3 border-(--text-color) scale-125 transition-all"
                      : ""
                  }`}
                  style={{
                    backgroundColor: bgColor ?? "transparent",
                  }}
                  title={color ?? "Default"}
                >
                  {color === null && (
                    <span className="material-symbols-outlined opacity-70">
                      close
                    </span>
                  )}
                </button>
              );
            })}
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
                      className={`flex-1 py-1 rounded border-2 border-(--border-color) text-sm capitalize transition-colors duration-200 ${
                        isSelected ? "bg-(--primary-green) font-semibold" : ""
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
          <div className="flex flex-col gap-2">
            <SearchBar
              placeholder={t(
                "sidebar_folders.new_folder.chat_selection.search_placeholder"
              )}
              onSearch={(value) => setSearchQuery(value)}
              autoFocus={false}
            />

            {selectedChats.length > 0 && (
              <div className="flex justify-between items-center p-1 px-2 bg-(--border-color) rounded-full!">
                <h2 className="italic">
                  {t(
                    "sidebar_folders.new_folder.chat_selection.selected_count",
                    {
                      count: selectedChats.length,
                    }
                  )}
                </h2>
                <button
                  onClick={() => setSelectedChats([])}
                  className="text-xs opacity-70 hover:opacity-100 text-red-400"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            )}

            <div className="overflow-y-auto">
              {filteredChats.length > 0 && (
                <ul className="divide-y divide-(--border-color)">
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
        <div className="absolute bottom-0 left-0 right-0">
          <div
            style={{
              color: getFooterTextColor(),
              backgroundColor:
                getColorFromPreset(selectedColor) ?? "var(--background-color)",
            }}
            className="z-20 p-3 border-t-4 border-black/30 shadow-4xl rounded-t-xl"
          >
            <div className="flex gap-2 mb-3">
              <span className="material-symbols-outlined text-4xl! font-bold">
                {isEditMode ? "bookmark_manager" : "create_new_folder"}
              </span>
              <input
                type="text"
                ref={folderNameRef}
                defaultValue={folderToEdit?.name || ""}
                onKeyDown={handleKeyDown}
                placeholder={t(
                  "sidebar_folders.new_folder.folder_name_placeholder"
                )}
                className="flex-1 outline-none text-xl w-full font-semibold"
                autoFocus
                maxLength={24}
                style={{ textTransform: "none" }}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="border-t-3 border-l-3 border-black/30 w-full py-2 rounded flex items-center justify-center gap-2 shadow-xl bg-(--primary-green) hover:bg-(--primary-green)/80"
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
