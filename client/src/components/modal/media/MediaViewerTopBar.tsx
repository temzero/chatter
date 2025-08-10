import { useCallback } from "react";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import slideSound from "@/assets/sound/click.mp3";
import { AttachmentResponse } from "@/types/responses/message.response";
import { handleDownload } from "@/utils/handleDownload";
import { useSenderByMessageId } from "@/stores/messageStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ModalType, useModalStore } from "@/stores/modalStore";

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

  const [playSound] = useSoundEffect(slideSound);
  const sender = useSenderByMessageId(attachment.messageId);

  const handleDownloadClick = useCallback(() => {
    playSound();
    handleDownload(attachment);
  }, [attachment, playSound]);

  const handleForwardAttachment = () => {
    openModal(ModalType.FORWARD_MESSAGE, { attachment });
  };
  const handleDeleteMessage = () => {
    // openModal(ModalType.DELETE_MESSAGE, { message });
    openModal(ModalType.DELETE_MESSAGE, {
      messageId: attachment.messageId,
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 pb-8 z-20">
      <div className="flex items-center gap-2">
        <Avatar
          avatarUrl={sender?.avatarUrl}
          name={sender?.displayName}
          size="8"
        />
        <div className="text-white font-medium">
          {sender?.displayName || "Sender"}
        </div>
      </div>
      <div className="flex items-center gap-4">
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
    </div>
  );
};
