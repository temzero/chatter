// components/MediaViewerBottomInfo.tsx
import { AttachmentResponse } from "@/types/responses/message.response";
import { formatFileSize } from "@/utils/formatFileSize";

interface MediaViewerBottomInfoProps {
  attachment: AttachmentResponse;
  currentIndex: number;
  mediaLength: number;
}

export const MediaViewerBottomInfo = ({
  attachment,
  currentIndex,
  mediaLength,
}: MediaViewerBottomInfoProps) => {
  if (mediaLength <= 1) return null;

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 pt-6 ">
        {attachment.filename && (
          <div className="text-white/60 truncate max-w-[50%]">
            {attachment.filename}
          </div>
        )}
        {attachment.size && (
          <div className="text-white/60">{formatFileSize(attachment.size)}</div>
        )}
      </div>
      {/* Dot Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 ">
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
