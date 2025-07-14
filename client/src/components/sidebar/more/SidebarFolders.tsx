import React from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useFolderStore } from "@/stores/folderStore";
import Toggle from "@/components/ui/Toggle";

const SidebarFolders: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const folders = useFolderStore((state) => state.folders) || [];
  const isLoading = useFolderStore((state) => state.isLoading);

  if (isLoading) {
    return <div>Loading folders...</div>;
  }

  return (
    <SidebarLayout title="Chat Folders">
      <div className="p-2 space-y-1 overflow-x-hidden">
        {folders.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No folders yet</div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="p-2 select-none border-2 border-[--border-color] hover:scale-110 transition-all rounded cursor-pointer"
              style={{
                backgroundColor: folder.color || "",
                color: folder.color ? "black" : "",
              }}
              onClick={() =>
                setSidebar(SidebarMode.FOLDER, { folderId: folder.id })
              }
            >
              <div className="flex items-center justify-between">
                <h1>{folder.position}</h1>
                <span className="material-symbols-outlined font-semibold">
                  folder
                </span>
                {/* <div className="flex gap-2">
                  <span className="material-symbols-outlined font-semibold">visibility</span>
                  <Toggle />
                </div> */}
              </div>
              <div className="flex items-center justify-between">
                <h1 className="font-semibold">{folder.name}</h1>
                {folder.chatIds.length > 0 && (
                  <span>({folder.chatIds.length})</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-2">
        <button
          onClick={() => setSidebar(SidebarMode.NEW_FOLDER)}
          className="primary gap-2 h-8 w-full flex items-center justify-center border rounded"
        >
          <span className="material-symbols-outlined text-3xl">
            create_new_folder
          </span>
          <h2 className="flex items-center">Add Folder</h2>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </SidebarLayout>
  );
};

export default SidebarFolders;
