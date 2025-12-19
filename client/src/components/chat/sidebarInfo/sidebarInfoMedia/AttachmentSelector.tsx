// components/sidebar/AttachmentSelector.tsx
import React, { useMemo } from "react";
import HorizontalSelector from "@/components/ui/layout/HorizontalSelector";
import { SelectorItem } from "@/components/ui/layout/HorizontalSelector";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { useTranslation } from "react-i18next";
import { SidebarInfoAttachmentTypes } from "@/common/constants/sidebarInfoAttachmentTypes";

type AttachmentSelectorItem = SelectorItem & {
  id: AttachmentType;
};

type Props = {
  selectedType: AttachmentType;
  onSelectType: (type: AttachmentType) => void;
};

const AttachmentSelector: React.FC<Props> = ({
  selectedType,
  onSelectType,
}) => {
  const { t } = useTranslation();

  const items: AttachmentSelectorItem[] = useMemo(
    () =>
      SidebarInfoAttachmentTypes.map((type) => ({
        id: type,
        name: t(`sidebar_info.media_files.${type.toLowerCase()}`),
      })),
    [t]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedType),
    [items, selectedType]
  );

  if (!selectedItem) return null;

  return (
    <HorizontalSelector
      items={items}
      selected={selectedItem}
      onSelect={(item) => onSelectType(item.id)}
    />
  );
};

export default AttachmentSelector;
