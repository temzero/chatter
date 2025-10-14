import { motion } from "framer-motion";
import { useCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageReactionDisplay } from "@/components/ui/MessageReactionsDisplay";
import { messageAnimations } from "@/animations/messageAnimations";
import { SystemMessageContent } from "@/components/ui/SystemMessageContent";
import { SystemMessageJSONContent } from "@/components/ui/SystemMessageContent";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";
import { MessageContextMenu } from "./MessageContextMenu";

type Props = {
  message: MessageResponse;
  systemEvent?: SystemEventType | null;
  senderId: string;
  senderDisplayName: string;
  content?: SystemMessageJSONContent | null;
};

const SystemMessage = ({
  message,
  systemEvent,
  senderId,
  senderDisplayName,
  content,
}: Props) => {
  const currentUserId = useCurrentUserId();
  const messageId = message.id;

  const isRelyToThisMessage = useIsReplyToThisMessage(messageId);
  const isFocus = useIsMessageFocus(messageId);
  const openMessageModal = useModalStore((state) => state.openMessageModal);

  if (!message || !currentUserId) return;

  const getClass = () => {
    const classes = [];
    switch (systemEvent) {
      case SystemEventType.MEMBER_LEFT:
      case SystemEventType.MEMBER_KICKED:
      case SystemEventType.MEMBER_BANNED:
      case SystemEventType.CHAT_DELETED:
        classes.push("text-red-400");
        break;
    }
    return classes.join(" ");
  };

  return (
    <motion.div
      id={`message-${messageId}`}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(messageId);
      }}
      className="cursor-pointer opacity-50 pb-2 mx-auto flex items-center justify-center"
      style={{
        zIndex: isFocus ? 100 : "auto",
      }}
      layout="position"
      {...messageAnimations.SystemMessage}
    >
      {systemEvent === SystemEventType.CHAT_UPDATE_AVATAR &&
        content?.newValue && (
          <img
            src={content.newValue}
            alt="Chat Avatar"
            className="aspect-square w-[200px] h-[200px] rounded-[32px] border-4 border-[--border-color]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}

      <div className="relative">
        <SystemMessageContent
          systemEvent={systemEvent}
          call={message.call}
          currentUserId={currentUserId}
          senderId={senderId}
          senderDisplayName={senderDisplayName}
          JSONcontent={content}
          ClassName={`italic truncate text-center ${getClass()}`}
        />

        <MessageReactionDisplay
          isMe={false}
          isSystemMessage={true}
          currentUserId={currentUserId}
          messageId={messageId}
          chatId={message.chatId}
        />

        {isFocus && !isRelyToThisMessage && (
          <MessageContextMenu message={message} />
        )}
      </div>
    </motion.div>
  );
};

export default SystemMessage;
