import React, { useMemo } from "react";
import HorizontalSelector, { SelectorItem } from "../layout/HorizontalSelector";
import { FolderResponse } from "@/shared/types/responses/folder.response";
import { getColorFromPreset } from "@/common/constants/folderColor";

type Props = {
  selectedFolder: FolderResponse;
  onSelectFolder: (folder: FolderResponse) => void;
  folders: FolderResponse[]; // includes "all"
};

const ChatFolderSelector: React.FC<Props> = ({
  selectedFolder,
  onSelectFolder,
  folders,
}) => {
  // Map folders → selector items (stable reference)
  const items: SelectorItem[] = useMemo(
    () =>
      folders.map((folder) => ({
        id: folder.id,
        name: folder.name.charAt(0).toUpperCase() + folder.name.slice(1),
        icon: folder.icon,
        color: getColorFromPreset(folder.color),
      })),
    [folders]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedFolder.id),
    [items, selectedFolder.id]
  );

  if (!items.length || !selectedItem) {
    return <div className="custom-border" />;
  }

  return (
    <HorizontalSelector
      items={items}
      selected={selectedItem}
      onSelect={(item) => {
        const folder = folders.find((f) => f.id === item.id);
        if (folder) onSelectFolder(folder);
      }}
    />
  );
};

export default ChatFolderSelector;
