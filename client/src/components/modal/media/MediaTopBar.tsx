import { useCallback } from "react";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import slideSound from "@/assets/sound/click.mp3";
import { MediaProps } from "@/data/media";
import { handleDownload } from "@/utils/handleDownload";

interface MediaTopBarProps {
  media: MediaProps;
  onRotate: () => void;
  onClose: () => void;
}

export const MediaTopBar = ({ media, onRotate, onClose }: MediaTopBarProps) => {
  const playSound = useSoundEffect(slideSound);

  const handleDownloadClick = useCallback(() => {
    playSound("next");
    handleDownload(media);
  }, [media, playSound]);

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 pb-8 z-20">
      <div className="text-white font-medium">{media.senderId || "Sender"}</div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRotate}
          className="text-white/60 hover:text-white rounded-full"
        >
          <i className="material-symbols-outlined">refresh</i>
        </button>
        <button className="text-white/60 hover:text-white rounded-full">
          <i className="material-symbols-outlined">send</i>
        </button>
        <button
          onClick={handleDownloadClick}
          className="text-white/60 hover:text-white rounded-full"
        >
          <i className="material-symbols-outlined">download</i>
        </button>
        <button className="text-white/60 hover:text-white rounded-full">
          <i className="material-symbols-outlined">delete</i>
        </button>
        <button
          className="text-white/60 hover:text-white rounded-full"
          onClick={onClose}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </div>
    </div>
  );
};
