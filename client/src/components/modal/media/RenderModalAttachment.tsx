import { useState, useEffect, useRef } from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import CustomAudioDiskPlayer, {
  AudioPlayerRef,
} from "@/components/ui/media/CustomAudioDiskPlayer";
import { motion } from "framer-motion";
import { mediaViewerAnimations } from "@/common/animations/mediaViewerAnimations";
import { ModalImageViewer } from "./ModalImageViewer";
import { useMediaAttachmentKeys } from "@/common/hooks/keyEvent/useMediaAttachmentKeys";
import { LinkPreviewAttachment } from "@/components/ui/attachments/LinkPreviewAttachment";
import mediaManager from "@/services/media/mediaManager";
import { FilePreviewAttachment } from "@/components/ui/attachments/FilePreviewAttachment";
import { PdfPreviewAttachment } from "@/components/ui/attachments/PdfPreviewAttachment";
import NotSupportedAttachment from "@/components/ui/attachments/NotSupportAttachment";
import CustomAudioVoicePlayer from "@/components/ui/media/CustomAudioVoicePlayer";

export const RenderModalAttachment = ({
  attachment,
  rotation = 0,
  isCurrent = false,
  onMediaEnd,
}: {
  attachment: AttachmentResponse;
  rotation?: number;
  isCurrent?: boolean;
  onMediaEnd?: () => void;
}) => {
  const [isHorizontalAspectRatio, setIsHorizontalAspectRatio] = useState<
    boolean | null
  >(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<AudioPlayerRef | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useMediaAttachmentKeys({
    isCurrent,
    attachmentType: attachment.type,
    videoRef,
    audioPlayerRef,
    scrollContainerRef,
  });

  // Video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrent) {
      mediaManager.play(video);
    } else {
      mediaManager.stop(video);
    }
  }, [isCurrent]);

  // Audio playback
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    if (isCurrent) {
      mediaManager.play(audio);
    } else {
      mediaManager.stop(audio);
    }
  }, [isCurrent]);

  if (!attachment) return null;

  switch (attachment.type) {
    case AttachmentType.IMAGE:
      return (
        <ModalImageViewer
          attachment={attachment}
          rotation={rotation}
          ref={scrollContainerRef}
        />
      );

    case AttachmentType.VIDEO:
      return (
        <motion.video
          ref={videoRef}
          src={attachment.url}
          poster={attachment.thumbnailUrl || undefined}
          controls
          onEnded={() => {
            if (onMediaEnd) onMediaEnd();
          }}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setIsHorizontalAspectRatio(video.videoWidth > video.videoHeight);
          }}
          className={`object-contain rounded ${
            isHorizontalAspectRatio === null
              ? ""
              : isHorizontalAspectRatio
                ? "w-[80vw] max-h-[80vh]"
                : "h-[93vh] max-w-[80vw]"
          }`}
          draggable="false"
          animate={mediaViewerAnimations.rotation(rotation)}
        />
      );

    case AttachmentType.VOICE:
    case AttachmentType.AUDIO:
      return (
        <CustomAudioVoicePlayer
          mediaUrl={attachment.url}
          fileName={attachment.filename ?? ""}
          ref={audioPlayerRef}
          goNext={onMediaEnd}
        />
      );

    // case AttachmentType.AUDIO:
    //   return (
    //     <CustomAudioDiskPlayer
    //       mediaUrl={attachment.url}
    //       fileName={attachment.filename ?? ""}
    //       cdImageUrl={attachment.thumbnailUrl ?? ""}
    //       ref={audioPlayerRef}
    //       goNext={onMediaEnd}
    //     />
    //   );

    case AttachmentType.PDF:
      return (
        <PdfPreviewAttachment attachment={attachment} rotation={rotation} />
      );

    case AttachmentType.LINK:
      return (
        <LinkPreviewAttachment attachment={attachment} className="w-[50%]" />
      );

    case AttachmentType.FILE:
      return (
        <FilePreviewAttachment attachment={attachment} rotation={rotation} />
      );
    default:
      return <NotSupportedAttachment attachment={attachment} />;
  }
};
