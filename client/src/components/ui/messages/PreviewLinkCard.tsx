// components/ui/PreviewLinkCard.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import mql from "@microlink/mql";

interface PreviewLinkCardProps {
  url: string;
  isVisible: boolean;
  onClose: () => void;
}

const PreviewLinkCard: React.FC<PreviewLinkCardProps> = ({
  url,
  isVisible,
  onClose,
}) => {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!url || !isVisible) return;

    mql(url)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [url, isVisible]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10, height: 0, marginBottom: -20 },
    visible: { opacity: 1, y: 0, height: "auto", marginBottom: -2 },
    exit: { opacity: 0, y: -5, height: 0, marginBottom: -20 },
  };

  const previewTitle: string = data?.meta?.title || data?.title || "";
  const site_name: string = data?.publisher || data?.author || "";

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={clsx(
          "relative flex gap-2 w-full p-1 pb-2 overflow-hidden cursor-pointer",
          "rounded-t-lg shadow-md bg-(--card-bg-color)",
          "hover:custom-border-t",
          // "bg-linear-to-b from-transparent to-black/80",
          "hover:bg-blue-500/30 hover:custom-border-t",
          "group"
        )}
        style={{ zIndex: -1 }}
      >
        {/* Image */}
        {data?.image?.url && (
          <div className={clsx("h-14 aspect-video rounded border-2 border-(--border-color) overflow-hidden")}>
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

          <div className="font-light italic text-xs opacity-60 truncate">
            {url}
          </div>
        </div>

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
        >
          <span className="material-symbols-outlined opacity-80">close</span>
        </div>
      </motion.a>
    </AnimatePresence>
  );
};

export default PreviewLinkCard;
