// components/sidebar/SidebarFolder.tsx
import React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useFolderStore } from "@/stores/folderStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";

type SidebarData = { folderId?: string } | undefined;

const SidebarFolder: React.FC = () => {
  const { t } = useTranslation();
  const chats = useChatStore((state) => state.chats);
  const currentSidebar = useSidebarStore((state) => state.currentSidebar);
  const sidebarData = useSidebarStore(
    (state) => state.sidebarData
  ) as SidebarData;
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const folders = useFolderStore((state) => state.folders);
  const folder = folders.find((f) => f.id === sidebarData?.folderId);
  const openModal = useModalStore((state) => state.openModal);

  if (!folder) {
    return (
      <div className="p-4 opacity-70 flex flex-col gap-4 items-center justify-center w-[var(--sidebar-width)]">
        <span className="material-symbols-outlined">folder_open</span>
        <h1>{t("sidebar_folders.detail.folder_not_found")}</h1>
      </div>
    );
  }

  const folderChatIds = folder?.chatIds || [];
  const folderChats = folderChatIds
    .map((id) => chats.find((chat) => chat.id === id))
    .filter(Boolean);

  if (currentSidebar !== SidebarMode.FOLDER || !folder) return null;

  const handleEdit = () => {
    setSidebar(SidebarMode.NEW_FOLDER, { folderToEdit: folder });
  };

  return (
    <SidebarLayout
      title={t("sidebar_folders.detail.title")}
      backLocation={SidebarMode.FOLDERS}
    >
      <div
        style={{
          borderColor: folder.color || "",
        }}
        className={`relative h-full  w-[var(--sidebar-width)] rounded-lg ${
          folder.color && "border-4"
        }`}
      >
        <div
          className="px-3 py-2"
          style={{
            backgroundColor: folder.color || "",
            color: folder.color ? "black" : "",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="material-symbols-outlined font-semibold text-4xl">
              folder
            </span>
            <button onClick={handleEdit}>
              <span className="material-symbols-outlined hover:opacity-80 hover:scale-125 transition-all">
                edit
              </span>
            </button>
          </div>
          <h2 className="text-xl font-semibold">{folder.name}</h2>
        </div>

        <div className="p-2">
          {/* <h1>Types</h1> */}
          {folder.types && folder.types.length > 0 && (
            <div className="flex gap-2 mb-2">
              {folder.types?.map((type) => (
                <div
                  key={type}
                  className="custom-border p-1 rounded w-full flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">
                    {type === ChatType.DIRECT
                      ? "person"
                      : type === ChatType.GROUP
                      ? "groups"
                      : "campaign"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            {/* <h1>Chats:</h1> */}
            {folderChats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {t("sidebar_folders.detail.no_chats")}
              </p>
            )}
            {folderChats.map((chat) => (
              <div key={chat?.id} className="flex items-center gap-2 py-1">
                <ChatAvatar chat={chat} type="header" />
                <h3 className="text-lg font-semibold">{chat?.name}</h3>
              </div>
            ))}
          </div>

          <button
            className="absolute bottom-0 left-0 py-1 flex-1 mt-4 w-full rounded text-red-500 hover:bg-red-500/10"
            // onClick={() => deleteFolder(folder.id)}
            onClick={() =>
              openModal(ModalType.DELETE_FOLDER, { folderId: folder.id })
            }
          >
            <span className="material-symbols-outlined">delete</span>
            {t("sidebar_folders.detail.delete_folder")}
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarFolder;
