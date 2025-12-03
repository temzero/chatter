// components/MediaViewerBottomInfo.tsx
import { useIsMobile } from "@/stores/deviceStore";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { formatFileSize } from "@/common/utils/format/formatFileSize";

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
  const isMobile = useIsMobile();
  if (mediaLength <= 1) return null;

  return (
    <>
      {isMobile || (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 pointer-events-none">
          {attachment.filename && (
            <div className="text-white/60 truncate max-w-[50%]">
              {attachment.filename}
            </div>
          )}
          {attachment.size && (
            <div className="text-white/60">
              {formatFileSize(attachment.size)}
            </div>
          )}
        </div>
      )}
      {/* Dot Indicator */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 flex gap-2 z-20 pointer-events-none ${
          isMobile ? "top-4" : " bottom-3"
        }`}
      >
        {Array.from({ length: mediaLength }).map((_, index) => (
          <span
            key={index}
            className={`w-1 h-1 rounded-full! transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-150" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </>
  );
};
