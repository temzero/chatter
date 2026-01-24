import React, { useRef } from "react";
import { SizeEnum } from "@/shared/types/enums/size.enum";
import GlassButton from "../buttons/GlassButton";

interface AttachFileProps {
  onFileSelect: (files: FileList) => void;
  hasAttachment: boolean;
}

const AttachFile: React.FC<AttachFileProps> = ({
  onFileSelect,
  hasAttachment = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*, video/*";
      fileInputRef.current.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
      event.target.value = "";
    }
  };

  const handleNormalClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "*";
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <GlassButton
        size={SizeEnum.S}
        onClick={handleNormalClick}
        onContextMenu={handleRightClick}
        active={hasAttachment}
        icon="attach_file"
      />

      <input
        type="file"
        accept="*"
        multiple
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default AttachFile;
