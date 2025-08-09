import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import SidebarLayout from "@/pages/SidebarLayout";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useFolderStore } from "@/stores/folderStore";
import FolderCard from "@/components/ui/FolderCard";
import type FolderResponse from "@/types/responses/folder.response";

const SidebarFolders: React.FC = () => {
  const setSidebar = useSidebarStore((state) => state.setSidebar);
  const folders = useFolderStore((state) => state.folders) || [];
  const reorderFolders = useFolderStore((state) => state.reorderFolders);

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = folders.findIndex((f) => f.id === active.id);
    const newIndex = folders.findIndex((f) => f.id === over.id);

    // Get just the IDs in new order
    const newOrderIds = arrayMove(
      folders.map((f) => f.id),
      oldIndex,
      newIndex
    );

    reorderFolders(newOrderIds);
  };


  return (
    <SidebarLayout title="Chat Folders">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={folders.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="p-2 space-y-1 overflow-hidden h-full">
            {folders.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                No folders yet
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
          <h2 className="flex items-center">Add Folder</h2>
          <span className="material-symbols-outlined">arrow_forward</span>
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
    zIndex: isDragging ? 999 : "auto", // 👈 Raise z-index when dragging
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
