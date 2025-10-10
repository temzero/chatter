import { useCallback } from "react";
import { AttachmentResponse } from "@/types/responses/message.response";
import { handleDownload } from "@/utils/handleDownload";
import { useSenderByMessageId } from "@/stores/messageStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { audioService, SoundType } from "@/services/audio.service";

interface MediaViewerTopBarProps {
  attachment: AttachmentResponse;
  onRotate: () => void;
  onClose: () => void;
}

export const MediaViewerTopBar = ({
  attachment,
  onRotate,
  onClose,
}: MediaViewerTopBarProps) => {
  const openModal = useModalStore((state) => state.openModal);
  const sender = useSenderByMessageId(attachment.messageId);

  const handleDownloadClick = useCallback(() => {
    audioService.playSound(SoundType.NOTIFICATION); // ✅ play centralized sound
    handleDownload(attachment);
  }, [attachment]);

  const handleForwardAttachment = () => {
    openModal(ModalType.FORWARD_MESSAGE, { attachment });
  };

  const handleDeleteMessage = () => {
    openModal(ModalType.DELETE_MESSAGE, {
      messageId: attachment.messageId,
    });
  };

  return (
    <>
      <div
        className="absolute top-2 left-2 flex items-center gap-2"
        style={{ zIndex: 1 }}
      >
        <Avatar
          avatarUrl={sender?.avatarUrl}
          name={sender?.displayName}
          size="8"
        />
        <div className="text-white font-medium">
          {sender?.displayName || "Sender"}
        </div>
      </div>

      <div
        className="absolute top-2 right-2 flex items-center gap-4"
        style={{ zIndex: 1 }}
      >
        <button
          onClick={onRotate}
          className="opacity-60 hover:opacity-100 rounded-full"
        >
          <i className="material-symbols-outlined">refresh</i>
        </button>
        <button
          onClick={handleForwardAttachment}
          className="opacity-60 hover:opacity-100 rounded-full"
        >
          <i className="material-symbols-outlined">send</i>
        </button>
        <button
          onClick={handleDownloadClick}
          className="opacity-60 hover:opacity-100 rounded-full"
        >
          <i className="material-symbols-outlined">download</i>
        </button>
        <button
          onClick={handleDeleteMessage}
          className="opacity-60 hover:opacity-100 rounded-full"
        >
          <i className="material-symbols-outlined">delete</i>
        </button>
        <button
          className="p-0.5 opacity-60 hover:opacity-100 hover:bg-red-500/80 rounded-full"
          onClick={onClose}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </div>
    </>
  );
};
