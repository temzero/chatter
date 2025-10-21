// componen@/components/ui/FolderCard.tsx
import React from "react";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { getSetSidebar } from "@/stores/sidebarStore";
import { FolderResponse } from "@/shared/types/responses/folder.response";

type FolderCardProps = {
  folder: FolderResponse;
  dragAttributes?: React.HTMLAttributes<HTMLDivElement>;
  dragListeners?: React.HTMLAttributes<HTMLDivElement>;
};

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  dragAttributes,
  dragListeners,
}) => {
  const setSidebar = getSetSidebar();

  return (
    <div
      className="flex overflow-hidden select-none border-2 border-[--border-color] hover:shadow-xl transition-all rounded cursor-pointer"
      onClick={() => setSidebar(SidebarMode.FOLDER, { folderId: folder.id })}
      style={{
        backgroundColor: folder.color || "var(--background-color)",
        color: folder.color ? "black" : "",
      }}
    >
      <div
        {...dragAttributes}
        {...dragListeners}
        className="w-8 flex items-center justify-center border-r-2 border-[--sidebar-color] self-stretch hover:cursor-grab active:cursor-grabbing hover:bg-black/20 transition-all"
      >
        <h1 className="font-bold text-xl">{folder.position}</h1>
      </div>
      <div className="flex-1 truncate p-2">
        <div className="flex items-center justify-between">
          <span className="material-symbols-outlined font-semibold">
            folder
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">{folder.name}</h1>
          {folder.chatIds.length > 0 && <span>({folder.chatIds.length})</span>}
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
