// components/MediaBottomInfo.tsx
import { MediaProps } from "./MediaModal";
import { formatFileSize } from "@/utils/formatFileSize";

interface MediaBottomInfoProps {
  media: MediaProps;
  currentIndex: number;
  mediaLength: number;
}

export const MediaBottomInfo = ({
  media,
  currentIndex,
  mediaLength,
}: MediaBottomInfoProps) => {
  if (mediaLength <= 1) return null;

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 pt-6 ">
        {media.fileName && (
          <div className="text-white/60 truncate max-w-[50%]">
            {media.fileName}
          </div>
        )}
        {media.size && (
          <div className="text-white/60">{formatFileSize(media.size)}</div>
        )}
      </div>
      {/* Dot Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 ">
        {Array.from({ length: mediaLength }).map((_, index) => (
          <span
            key={index}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-150" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </>
  );
};
