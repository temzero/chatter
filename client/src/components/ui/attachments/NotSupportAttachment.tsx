import React from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { useTranslation } from "react-i18next";

interface NotSupportedAttachmentProps {
  attachment: AttachmentResponse;
}

const NotSupportedAttachment: React.FC<NotSupportedAttachmentProps> = ({
  attachment,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 items-center p-2 rounded text-6xl! custom-border-b">
      <div className="flex items-center justify-center w-8 h-8 overflow-hidden custom-border rounded-full bg-red-500 text-white">
        <span className="material-symbols-outlined text-3xl!">
          attach_file_off
        </span>
      </div>
      <div>
        <h1 className="truncate text-lg leading-none">{attachment.filename || "???"}</h1>
        <p className="text-xs text-red-500">
          {t("common.messages.file_not_supported")}
        </p>
      </div>
    </div>
  );
};

export default NotSupportedAttachment;
