import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { LinkPreviewResponse } from "@/shared/types/responses/message.response";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { audioService, SoundType } from "@/services/audioService";

interface Props {
  preview: LinkPreviewResponse;
  className?: string;
}

export const LinkPreviewCard: React.FC<Props> = ({ preview, className }) => {
  const { url, title, description, image, site_name, favicon, mediaType } =
    preview;

  const hasBothImageAndFavicon = Boolean(image && favicon);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "relative overflow-hidden rounded-lg shadow-xl flex items-end",
        "bg-black/30 hover:bg-blue-500 border-black/20 border-3 hover:border-4 transition-all",
        "group",
        { "aspect-video": hasBothImageAndFavicon },
        className
      )}
      {...messageAnimations.linkPreview}
      style={{ position: "relative" }}
    >
      {/* Image container with z-index 0 */}
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
            scale: 1.35,
            transition: { type: "spring", stiffness: 300, damping: 15 },
          }}
          onHoverStart={(e) => {
            e.stopPropagation();
            audioService.playSound(SoundType.LINK_HOVER, 0.1);
          }}
        >
          <img
            src={image ?? favicon}
            className="h-full w-full object-cover rounded"
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
      )}

      {/* Content overlay with z-index 1 */}
      <div
        className={clsx(
          "w-full p-2 pointer-events-none text-white",
          // base gradient
          "bg-linear-to-b from-transparent via-black/70 to-black/80",
          // hover gradient
          "group-hover:from-transparent group-hover:via-blue-700/70 group-hover:to-blue-700/80",
          // smooth transition
          "transition-all duration-300 ease-out"
        )}
        style={{ zIndex: 1 }}
      >
        {/* Site info */}
        {site_name && title ? (
          <div>
            <div className="flex items-center gap-1">
              {(favicon || image) && (
                <img
                  src={favicon ?? image}
                  alt={site_name ?? "favicon"}
                  className="h-5 w-5 rounded"
                  loading="lazy"
                />
              )}
              {site_name && (
                <span className="line-clamp-1 text-xs">{site_name}</span>
              )}
            </div>
            {title && (
              <div className="text-sm font-semibold line-clamp-2">{title}</div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1">
              <div className="flex items-center gap-1">
                {favicon && (
                  <img
                    src={favicon}
                    alt={site_name ?? "favicon"}
                    className="h-5 w-5"
                    loading="lazy"
                  />
                )}
              </div>
              {title && (
                <div className="text-sm font-semibold line-clamp-1 text-white">
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

        {/* URL fallback */}
        {!title && (
          <div className="w-full flex gap-1.5 items-end">
            <h1 className="italic opacity-80 text-xs">{url}</h1>
            <span className="material-symbols-outlined opacity-60 ml-auto">
              link
            </span>
          </div>
        )}
      </div>
    </motion.a>
  );
};
