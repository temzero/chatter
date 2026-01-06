import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { audioManager, SoundType } from "@/services/media/audioManager";
import { useIsMobile } from "@/stores/deviceStore";
import { LinkMetadata } from "@/shared/types/responses/message-attachment-metadata.response";

interface Props {
  attachment: AttachmentResponse;
  className?: string;
  isInitAnimation?: boolean;
}

export const LinkPreviewAttachment: React.FC<Props> = ({
  attachment,
  className,
  isInitAnimation,
}) => {
  const isMobile = useIsMobile();

  // 🔁 derive preview fields directly from attachment
  const url = attachment.url;
  const title = attachment.filename ?? undefined;
  const image = attachment.thumbnailUrl ?? undefined;

  const metadata = (attachment.metadata as LinkMetadata) ?? null;
  const description = metadata?.description;
  const site_name = metadata?.site_name;
  const favicon = metadata?.favicon;
  const mediaType = attachment.mimeType?.startsWith("video")
    ? "video"
    : undefined;

  const hasBothImageAndFavicon = Boolean(image && favicon);
  const iconClass = "h-6 w-6";

  const animationProps = isInitAnimation ? messageAnimations.linkPreview : {};

  return (
    <motion.a
      title={url}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      id={attachment.id}
      key={attachment.id}
      className={clsx(
        "w-full flex-1",
        "relative overflow-hidden rounded-lg shadow-xl flex flex-col gap-1 justify-between",
        "bg-black/30 hover:bg-blue-500 border-3 border-transparent transition-all",
        "group",
        { "aspect-video": hasBothImageAndFavicon },
        className
      )}
      {...animationProps}
    >
      {/* Image container */}
      {(image || favicon) && (
        <motion.div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{ zIndex: 0 }}
          initial={{ scale: 1 }}
          animate={{
            scale: 1,
            transition: { type: "spring", stiffness: 250, damping: 15 },
          }}
          whileHover={{
            scale: 1.5,
            transition: { type: "spring", stiffness: 300, damping: 15 },
          }}
          onHoverStart={(e) => {
            e.stopPropagation();
            audioManager.playSound(SoundType.LINK_HOVER, 0.2);
          }}
        >
          <img
            src={image ?? favicon}
            className="h-full w-full object-cover rounded"
          />

          {mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg">
              <div className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                ▶ Video
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* URL bar */}
      <div
        className={clsx(
          "w-full pointer-events-none flex items-start p-1 pb-10 gap-1",
          "bg-linear-to-t",
          {
            "from-transparent to-black text-blue-400 group-hover:text-white":
              isMobile,
            "text-white": !isMobile,
          },
          "group-hover:from-transparent group-hover:to-blue-800"
        )}
        style={{ zIndex: 1 }}
      >
        <span className="material-symbols-outlined custom-border rounded-full bg-(--panel-color) text-blue-500 group-hover:bg-blue-500 group-hover:text-white">
          link
        </span>
        <h1
          className={clsx(
            "italic underline text-xs opacity-90 group-hover:block",
            { hidden: !isMobile }
          )}
        >
          {url}
        </h1>
      </div>

      {/* Content overlay */}
      <div
        className={clsx(
          "w-full p-2 mt-auto pointer-events-none text-white",
          "bg-linear-to-b from-transparent via-black/70 to-black",
          "group-hover:from-transparent group-hover:via-blue-800/70 group-hover:to-blue-800"
        )}
        style={{ zIndex: 1 }}
      >
        {site_name && title ? (
          <div>
            <div className="flex items-center gap-1">
              {(favicon || image) && (
                <img
                  src={favicon ?? image}
                  alt={site_name}
                  className={iconClass}
                  loading="lazy"
                />
              )}
              <span className="line-clamp-1 text-xs">{site_name}</span>
            </div>
            <div className="text-sm font-semibold line-clamp-2">{title}</div>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1">
              {favicon && (
                <img
                  src={favicon}
                  alt={site_name ?? "favicon"}
                  className={iconClass}
                  loading="lazy"
                />
              )}
              {title && (
                <div className="text-sm font-semibold line-clamp-1">
                  {title}
                </div>
              )}
            </div>
            {description && (
              <div className="text-xs opacity-80 italic line-clamp-2 mt-1">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.a>
  );
};
