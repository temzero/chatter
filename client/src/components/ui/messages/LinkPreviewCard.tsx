// components/ui/PreviewLinkCard.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  console.log("PreviewLinkCard data", data);

  React.useEffect(() => {
    if (!url || !isVisible) return;

    mql(url)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [url, isVisible]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10, height: 0, marginBottom: 0 },
    visible: { opacity: 1, y: 0, height: "auto", marginBottom: 12 },
    exit: { opacity: 0, y: -5, height: 0, marginBottom: 0 },
  };

  const getPreviewTitle = (data: any) => {
    return data?.ogTitle || data?.meta?.title || data?.title || "Untitled";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex gap-2 w-full custom-border rounded-lg overflow-hidden bg-(--card-bg-color) shadow-md cursor-pointer"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Image */}
        {data?.image?.url && (
          <img
            src={data.image.url}
            alt={data.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}

        {/* Text */}
        <div className="w-full h-20 p-1 flex flex-col justify-between">
          <div className="text-xs opacity-60">
            {data?.publisher || data?.author || "Website"}
          </div>

          <div className="font-semibold mt-0.5 line-clamp-2">
            {getPreviewTitle(data)}
          </div>
          <div className="font-light italic text-xs opacity-60">{url}</div>
        </div>

        {/* Close */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-0 right-0 flex items-center justify-center p-1 bg-(--card-bg-color) cursor-pointer rounded hover:text-red-400 hover:scale-125 transition-all"
        >
          <span className="material-symbols-outlined opacity-80">close</span>
        </div>
      </motion.a>
    </AnimatePresence>
  );
};

export default PreviewLinkCard;
