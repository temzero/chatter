import { useCallback } from "react";
import { AttachmentResponse } from "@/shared/types/responses/message.response";
import { handleDownload } from "@/common/utils/handleDownload";
import { useSenderByMessageId } from "@/stores/messageStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { useDeviceStore } from "@/stores/deviceStore";

interface MediaViewerButtonsProps {
  attachment: AttachmentResponse;
  onRotate: () => void;
  onClose: () => void;
}

export const MediaViewerButtons = ({
  attachment,
  onRotate,
  onClose,
}: MediaViewerButtonsProps) => {
  const isMobile = useDeviceStore((state) => state.isMobile);

  const openModal = useModalStore((state) => state.openModal);
  const sender = useSenderByMessageId(attachment.messageId);

  const handleDownloadClick = useCallback(() => {
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

  const positionClass = isMobile
    ? "bottom-2 left-1/2 -translate-x-1/2 w-full  justify-evenly"
    : "top-2 right-2";

  const buttonClasses =
    "opacity-60 hover:opacity-100 rounded-full p-2 select-none focus:outline-none";

  return (
    <>
      <div
        className={`absolute top-2 left-2 flex items-center gap-2`}
        style={{ zIndex: 2 }}
      >
        <Avatar
          avatarUrl={sender?.avatarUrl}
          name={sender?.displayName}
          size="8"
        />
        {isMobile || (
          <div className="text-white font-medium">
            {sender?.displayName || "Sender"}
          </div>
        )}
      </div>

      <div
        className={`absolute flex items-center gap-2 ${positionClass}`}
        style={{ zIndex: 2 }}
      >
        <button onClick={onRotate} className={buttonClasses}>
          <i className="material-symbols-outlined">refresh</i>
        </button>
        <button onClick={handleForwardAttachment} className={buttonClasses}>
          <i className="material-symbols-outlined">send</i>
        </button>
        <button onClick={handleDownloadClick} className={buttonClasses}>
          <i className="material-symbols-outlined">download</i>
        </button>
        <button onClick={handleDeleteMessage} className={buttonClasses}>
          <i className="material-symbols-outlined">delete</i>
        </button>
        {isMobile || (
          <button
            className={`${buttonClasses} hover:text-red-400`}
            onClick={onClose}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        )}
      </div>

      {isMobile && (
        <button
          className={`${buttonClasses} hover:text-red-400 absolute top-2 right-2`}
          onClick={onClose}
          style={{ zIndex: 2 }}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      )}
    </>
  );
};
