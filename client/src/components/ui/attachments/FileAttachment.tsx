import React from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { formatFileSize } from "@/common/utils/format/formatFileSize";
import { handleDownload } from "@/common/utils/handleDownload";
import { getFileIcon } from "@/common/utils/getFileIcon";

interface FileAttachmentProps {
  attachment: AttachmentResponse;
  type?: string;
  onOpenModal: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachment,
  type,
  onOpenModal,
}) => {
  return (
    <div
      className={`w-full p-2 flex items-center gap-2 custom-border-b overflow-hidden ${
        type === "info" ? "text-purple-400" : "text-black bg-purple-400"
      }`}
      onClick={onOpenModal}
    >
      <div className="h-9 w-9 flex items-center justify-center rounded overflow-hidden select-none group">
        <i className="material-symbols-outlined text-4xl! leading-none block! group-hover:hidden!">
          {getFileIcon(attachment.filename)}
        </i>

        <div
          className="w-full h-full bg-blue-500 text-white cursor-pointer hidden! group-hover:block!"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(attachment);
          }}
        >
          <i className="material-symbols-outlined text-4xl! leading-none">
            download
          </i>
        </div>
      </div>

      <div className="cursor-pointer transition-all flex-1 overflow-hidden">
        <h1 className="truncate font-semibold">
          {attachment.filename || "???"}
        </h1>
        <p className="truncate italic text-xs leading-none">
          {attachment.size ? formatFileSize(attachment.size) : "???"}
        </p>
      </div>
    </div>
  );
};

export default FileAttachment;