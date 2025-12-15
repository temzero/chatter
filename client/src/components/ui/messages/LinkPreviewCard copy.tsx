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
        "block overflow-hidden rounded-lg border-3 border-black/20 shadow-xl",
        "bg-black/20 hover:bg-blue-400 transition-all",
        className
      )}
      {...messageAnimations.linkPreview}
      // Add whileHover directly on the parent
      whileHover={
        {
          // You can keep parent animations here if needed
        }
      }
    >
      {image && (
        // <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <motion.div
          className="h-full w-full rounded-lg"
          // Set initial scale
          initial={{ scale: 1 }}
          // Animate when parent is hovered
          animate={{
            scale: 1,
            transition: { type: "spring", stiffness: 250, damping: 15 },
          }}
          whileHover={{
            scale: 1.5,
            transition: { type: "spring", stiffness: 300, damping: 15 },
          }}
          // Add this to inherit parent's hover state
          onHoverStart={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt={title ?? site_name ?? "Link preview"}
            className="h-full w-full object-cover rounded-lg"
            loading="lazy"
          />

          {mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg">
              <div className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                ▶ Video
              </div>
            </div>
          )}
        </motion.div>
        // </div>
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
    </motion.a>
  );
};
