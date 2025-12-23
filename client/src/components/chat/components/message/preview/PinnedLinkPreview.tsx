import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { LinkMetadata } from "@/shared/types/responses/message-attachment-metadata.response";
import { audioManager, SoundType } from "@/services/audioManager";
import { useIsMobile } from "@/stores/deviceStore";

interface MessageHorizontalLinkPreviewProps {
  attachment?: AttachmentResponse | null;
  isCrop?: boolean;
}

export const PinnedLinkPreview: React.FC<MessageHorizontalLinkPreviewProps> = ({
  attachment,
  isCrop,
}) => {
  const isMobile = useIsMobile();

  if (!attachment || !attachment.url) return null;

  // Extract data from attachment
  const url = attachment.url;
  const title = attachment.filename ?? undefined;
  const metadata = (attachment.metadata as LinkMetadata) ?? null;

  // Get image from thumbnail, metadata image, or favicon
  const imageUrl =
    attachment.thumbnailUrl ?? metadata?.favicon;

  // Use metadata title if available, otherwise use filename
  const displayTitle = metadata?.title ?? title;
  const siteName = metadata?.site_name;
  const favicon = metadata?.favicon;

  const linkClass = clsx(
    "group",
    "flex items-center",
    "bg-blue-800 hover:bg-blue-600 shadow-xl",
    "text-white",
    "border-2 border-(--input-border-color)",
    "rounded-lg",
    {
      "max-w-[45vw]": isCrop,
    }
  );

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className={linkClass}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        audioManager.playSound(SoundType.LINK_HOVER, 0.2);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {(imageUrl || favicon) && (
        <motion.div
          className="h-9 shrink-0 overflow-hidden rounded mr-1"
          style={{ zIndex: 999 }}
          whileHover={{ scale: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <img
            src={imageUrl ?? favicon}
            className="h-full w-full object-cover"
            alt={siteName ?? "Link preview"}
            loading="lazy"
          />
        </motion.div>
      )}

      <div className="flex-1 min-w-0 overflow-hidden px-1">
        {displayTitle ? (
          <div>
            {siteName && (
              <div className="flex items-center gap-1 -mb-0.5">
                {favicon && !imageUrl && (
                  <img
                    src={favicon}
                    alt={siteName}
                    className="h-3 w-3 object-contain"
                    loading="lazy"
                  />
                )}
                {/* <span className="text-xs text-white/80 truncate">
                  {siteName}
                </span> */}
              </div>
            )}
            <h1 className="font-semibold truncate line-clamp-1">
              {/* {siteName && <span className="font-light text-sm mr-1">{siteName}</span>} */}
              {displayTitle}
            </h1>
            {isMobile && (
              <h2 className="text-xs text-white/70 italic underline -mt-1 line-clamp-1">
                {url}
              </h2>
            )}
          </div>
        ) : (
          <h1 className="text-xs italic truncate line-clamp-1">{url}</h1>
        )}

        {metadata?.description && !isMobile && (
          <div className="text-xs text-white/70 line-clamp-1">
            {siteName}
          </div>
        )}
      </div>
    </motion.a>
  );
};
