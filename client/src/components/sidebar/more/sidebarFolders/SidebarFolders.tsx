import * as React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";

import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useFolders, useFolderStore } from "@/stores/folderStore";
import { FolderResponse } from "@/shared/types/responses/folder.response";
import { audioService, SoundType } from "@/services/audio.service";
import SidebarLayout from "@/layouts/SidebarLayout";
import FolderCard from "./FolderCard";

const SidebarFolders: React.FC = () => {
  const { t } = useTranslation();
  const folders = useFolders() || [];
  const setSidebar = getSetSidebar();
  const reorderFolders = useFolderStore.getState().reorderFolders;

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = folders.findIndex((f) => f.id === active.id);
    const newIndex = folders.findIndex((f) => f.id === over.id);

    const newOrderIds = arrayMove(
      folders.map((f) => f.id),
      oldIndex,
      newIndex
    );

    audioService.playRandomSound([
      SoundType.CARD1,
      SoundType.CARD2,
      SoundType.CARD3,
      SoundType.CARD4,
    ]);

    reorderFolders(newOrderIds);
  };

  return (
    <SidebarLayout title={t("sidebar_folders.title")}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={folders.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="p-2 space-y-1 overflow-hidden h-full">
            {folders.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                {t("sidebar_folders.messages.no_folders")}
              </div>
            ) : (
              folders.map((folder) => (
                <SortableFolderCard key={folder.id} folder={folder} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="absolute bottom-0 left-0 w-full p-2">
        <button
          onClick={() => setSidebar(SidebarMode.NEW_FOLDER)}
          className="primary gap-2 h-8 w-full flex items-center justify-center border rounded"
        >
          <span className="material-symbols-outlined text-3xl">
            create_new_folder
          </span>
          <h2 className="flex items-center">
            {t("sidebar_folders.buttons.add_folder")}
          </h2>
        </button>
      </div>
    </SidebarLayout>
  );
};

export default SidebarFolders;

// Sortable wrapper for FolderCard
const SortableFolderCard = ({ folder }: { folder: FolderResponse }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folder.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    position: isDragging ? ("relative" as const) : ("static" as const),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FolderCard
        folder={folder}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
};
