/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import clsx from "clsx";
import mql from "@microlink/mql";
import { motion, AnimatePresence } from "framer-motion";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { audioManager, SoundType } from "@/services/media/audioManager";

interface LinkPreviewChatBarProps {
  url: string;
  onClose: () => void;
}

export const LinkPreviewCard: React.FC<LinkPreviewChatBarProps> = ({
  url,
  onClose,
}) => {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!url) return;

    mql(url)
      .then((res) => setData((res as any).data))
      .catch(() => setData(null));

    audioManager.playSound(SoundType.POP1, 0.1);
  }, [url]);

  const previewTitle: string = data?.meta?.title || data?.title || "";
  const site_name: string = data?.publisher || data?.author || "";

  return (
    <AnimatePresence>
      <motion.div
        className={clsx(
          "relative flex gap-2 w-full overflow-hidden cursor-pointer",
          "rounded-t-lg shadow-md bg-(--card-bg-color)",
          "custom-border",
          "group"
        )}
        {...messageAnimations.linkPreviewChatBar}
      >
        <a
          href={url}
          target="_blank"
          className="hover:bg-blue-500/50 p-1 flex gap-2"
        >
          {/* Image */}
          {data?.image?.url && (
            <div
              className={clsx(
                "h-18 aspect-video rounded border-2 border-(--border-color) overflow-hidden"
              )}
            >
              <img
                src={data.image.url}
                className={clsx(
                  "w-full h-full object-cover",
                  "transition-transform duration-300",
                  "group-hover:scale-200"
                )}
              />
            </div>
          )}

          {/* Text */}
          <div className="w-full flex flex-col justify-between">
            <div className="font-semibold line-clamp-2">{previewTitle}</div>

            {previewTitle !== site_name && (
              <div className="text-xs opacity-60">{site_name}</div>
            )}

            <div className="flex items-center text-blue-500">
              <span className="material-symbols-outlined">link</span>
              <div className="font-semibold group-hover:underline italic text-xs truncate">
                {url}
              </div>
            </div>
          </div>
        </a>

        {/* Close button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={clsx(
            "absolute top-0 right-0 p-1 rounded-full text-(--text-color)",
            "flex items-center justify-center",
            "cursor-pointer",
            "transition-all",
            "hover:text-red-400 hover:scale-125"
          )}
          style={{ zIndex: 9 }}
        >
          <span className="material-symbols-outlined opacity-80">close</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
