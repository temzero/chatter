import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { LinkPreviewResponse } from "@/shared/types/responses/message.response";
import { messageAnimations } from "@/common/animations/messageAnimations";

interface Props {
  preview: LinkPreviewResponse;
  className?: string;
}

export const LinkPreviewCard: React.FC<Props> = ({ preview, className }) => {
  const { url, title, description, image, site_name, favicon, mediaType } =
    preview;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "block overflow-hidden rounded-lg p-1 shadow-xl",
        "bg-black/20 transition-all",
        className
      )}
      {...messageAnimations.linkPreview}
    >
      <motion.div
        whileHover={{
          scale: 1.1,
          transition: { type: "spring", stiffness: 300, damping: 14 },
        }}
        animate={{
          transition: { type: "spring", stiffness: 300, damping: 14 },
        }}
      >
        {image && (
          <div className="relative w-full aspect-video bg-black/5 shadow rounded overflow-hidden">
            <img
              src={image}
              alt={title ?? site_name ?? "Link preview"}
              className="h-full w-full object-cover"
              loading="lazy"
            />

            {mediaType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  ▶ Video
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-2 space-y-1">
          {/* Site info */}
          {(site_name || favicon) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {favicon && (
                <img
                  src={favicon}
                  alt={site_name ?? "favicon"}
                  className="h-4 w-4 rounded-sm"
                  loading="lazy"
                />
              )}
              {site_name && <span>{site_name}</span>}
            </div>
          )}

          {/* Title */}
          {title && (
            <div className="text-sm font-medium line-clamp-1">{title}</div>
          )}

          {/* Description */}
          {description && (
            <div className="text-xs opacity-70 italic line-clamp-2">
              {description}
            </div>
          )}

          {/* URL fallback */}
          {!title && !description && (
            <div className="text-xs text-muted-foreground break-all">{url}</div>
          )}
        </div>
      </motion.div>
    </motion.a>
  );
};
