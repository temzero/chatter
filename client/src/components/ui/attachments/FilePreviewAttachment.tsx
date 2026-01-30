import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { formatFileSize } from "@/common/utils/format/formatFileSize";
import { handleDownload } from "@/common/utils/handleDownload";
import { getFileIcon } from "@/common/utils/getFileIcon";
import { mediaViewerAnimations } from "@/common/animations/mediaViewerAnimations";

interface PreviewAttachmentProps {
  attachment: AttachmentResponse;
  rotation?: number;
}

export const FilePreviewAttachment = ({
  attachment,
  rotation = 0,
}: PreviewAttachmentProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="mx-auto my-auto p-4 rounded-lg flex flex-col gap-5 items-center border-4 border-(--border-color)"
      animate={mediaViewerAnimations.rotation(rotation)}
    >
      <div className="flex flex-col justify-center items-center">
        <i className="material-symbols-outlined text-8xl! px-4">
          {getFileIcon(attachment.filename)}
        </i>
        <div className="text-lg font-medium text-center select-text">
          {attachment.filename || "???"}
        </div>
        {attachment.size && (
          <div className="text-sm text-gray-400 select-text">
            {formatFileSize(attachment.size)}
          </div>
        )}
      </div>
      <button
        onClick={() => handleDownload(attachment)}
        className="px-3 pb-1.5 pt-1 flex gap-0.5 items-center justify-center bg-(--primary-green) text-white font-semibold border-t-2 border-(--border-color)"
      >
        <span className="material-symbols-outlined">download</span>
        <p className="leading-none">{t("common.actions.download")}</p>
      </button>
    </motion.div>
  );
};
