import { useCallback } from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { handleDownload } from "@/common/utils/handleDownload";
import { useSenderByMessageId } from "@/stores/messageStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useIsMobile } from "@/stores/deviceStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { getCurrentUserId } from "@/stores/authStore";
import { useTranslation } from "react-i18next";
import { useActiveChatId } from "@/stores/chatStore";
import { useMessageSender } from "@/stores/chatMemberStore";

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
  const { t } = useTranslation();

  const isMobile = useIsMobile();
  const openModal = getOpenModal();

  const activeChatId = useActiveChatId();
  const currentUserId = getCurrentUserId();

  const sender = useSenderByMessageId(attachment.messageId ?? "");
  const senderMember = useMessageSender(sender?.id ?? "", activeChatId ?? "");
  const senderDisplayName = senderMember?.nickname || sender?.displayName;
  const isMe = currentUserId === sender?.id;

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
        {isMe ? (
          <div className="text-white font-medium">{t("common.you")}</div>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar
              avatarUrl={sender?.avatarUrl}
              name={sender?.displayName}
              size={8}
            />
            {!isMobile && (
              <div className="text-white font-medium">{senderDisplayName}</div>
            )}
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
