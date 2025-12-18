import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { LinkPreviewResponse } from "@/shared/types/responses/message.response";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { audioService, SoundType } from "@/services/audioService";
import { useIsMobile } from "@/stores/deviceStore";

interface Props {
  preview: LinkPreviewResponse;
  className?: string;
}

export const LinkPreviewCard: React.FC<Props> = ({ preview, className }) => {
  const isMobile = useIsMobile();
  const { url, title, description, image, site_name, favicon, mediaType } =
    preview;

  const hasBothImageAndFavicon = Boolean(image && favicon);

  const iconClass = "h-8 w-8";

  return (
    <motion.a
      title={url}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "relative overflow-hidden rounded-lg shadow-xl flex flex-col gap-1 justify-between",
        "bg-black/30 hover:bg-blue-500 border-transparent border-4 hover:border-5 transition-all",
        "group",
        { "aspect-video": hasBothImageAndFavicon },
        className
      )}
      {...messageAnimations.linkPreview}
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
            scale: 1.5,
            transition: { type: "spring", stiffness: 300, damping: 15 },
          }}
          onHoverStart={(e) => {
            e.stopPropagation();
            audioService.playSound(SoundType.LINK_HOVER, 0.2);
          }}
        >
          <img
            src={image ?? favicon}
            className="h-full w-full object-cover rounded"
            // loading="lazy"
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

      <div
        className={clsx(
          "w-full pointer-events-none flex items-start p-1 pb-10 gap-1",
          // base gradient
          "bg-linear-to-t",
          // hover gradient
          {
            "from-transparent to-black text-blue-400 group-hover:text-white":
              isMobile,
            " text-white": !isMobile,
          },
          "group-hover:from-transparent group-hover:to-blue-800"
        )}
        style={{ zIndex: 1 }}
      >
        <span className="material-symbols-outlined custom-border rounded-full bg-(--sidebar-color) text-blue-500 group-hover:bg-blue-500 group-hover:text-white">
          link
        </span>
        <h1
          className={clsx(
            "italic underline text-xs  opacity-90 group-hover:block",
            { hidden: !isMobile }
          )}
        >
          {url}
        </h1>
      </div>

      {/* Content overlay with z-index 1 */}
      <div
        className={clsx(
          "w-full p-2 mt-auto pointer-events-none text-white",
          // base gradient
          "bg-linear-to-b from-transparent via-black/70 to-black",
          // hover gradient
          "group-hover:from-transparent group-hover:via-blue-800/70 group-hover:to-blue-800"
        )}
        style={{ zIndex: 1 }}
      >
        {/* Site info */}
        {site_name && title ? (
          <div>
            <div className="flex items-center gap-1 -mb-1">
              {(favicon || image) && (
                <img
                  src={favicon ?? image}
                  alt={site_name ?? "favicon"}
                  className={iconClass}
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
                    className={iconClass}
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
        {/* {!title && <h1 className="italic opacity-80 text-xs pt-1">{url}</h1>} */}
      </div>
    </motion.a>
  );
};
