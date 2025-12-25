import { motion } from "framer-motion";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

interface AttachFileProps {
  onFileSelect: (files: FileList) => void;
  hasAttachment: boolean;
}

const AttachFile: React.FC<AttachFileProps> = ({
  onFileSelect,
  hasAttachment = false,
}) => {
  const { t } = useTranslation();
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
    <div
      title={t("chat_bar.attach_file")}
      className={clsx(
        "h-(--chat-input-container-height) w-(--chat-input-container-height)",
        "flex items-center justify-center",
        "hover:opacity-80 transition-all",
        "rounded-full",
        {
          "text-(--primary-green-glow)": hasAttachment,
          "opacity-60": !hasAttachment,
        }
      )}
    >
      <motion.span
        whileTap={{ scale: 1.2 }}
        className={clsx(
          "material-symbols-outlined text-3xl!",
          "cursor-pointer rounded select-none focus:outline-none"
        )}
        aria-label="Attach file"
        onClick={handleNormalClick}
        onContextMenu={handleRightClick}
      >
        attach_file
      </motion.span>

      <input
        type="file"
        accept="*"
        multiple
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default AttachFile;
