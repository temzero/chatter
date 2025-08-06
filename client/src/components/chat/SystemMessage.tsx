import clsx from "clsx";
import { useCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/types/enums/systemEventType";
import { MessageResponse } from "@/types/responses/message.response";
import { MessageActions } from "../ui/MessageActions";
import { ReactionPicker } from "../ui/MessageReactionPicker";
import { MessageReactionDisplay } from "../ui/MessageReactionsDisplay";
import { motion } from "framer-motion";
import { messageAnimations } from "@/animations/messageAnimations";
import { SystemMessageContent } from "../ui/SystemMessageContent";
import { SystemMessageJSONContent } from "../ui/SystemMessageContent";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";

type Props = {
  message: MessageResponse;
  isSidebar?: boolean;
  systemEvent?: SystemEventType | null;
  senderId: string;
  senderDisplayName: string;
  content?: SystemMessageJSONContent | null;
};

const SystemMessage = ({
  message,
  isSidebar,
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

  if (!message) return null;

  const getClass = () => {
    const classes = [];
    if (isSidebar) {
      classes.push("text-xs", "max-w-[196px]");
    }
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

  const animationProps = message.shouldAnimate
    ? messageAnimations.SystemMessage
    : messageAnimations.none;

  return (
    <motion.div
      id={`message-${messageId}`}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      className={clsx("flex flex-col items-center p-1 cursor-pointer", {
        "z-[99]": isFocus,
      })}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(messageId);
      }}
    >
      {systemEvent === SystemEventType.CHAT_UPDATE_AVATAR &&
        content?.newValue &&
        !isSidebar && (
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
          currentUserId={currentUserId}
          senderId={senderId}
          senderDisplayName={senderDisplayName}
          JSONcontent={content}
          ClassName={`opacity-60 italic truncate text-center ${getClass()}`}
        />

        <MessageReactionDisplay
          isMe={false}
          isSystemMessage={true}
          currentUserId={currentUserId}
          messageId={messageId}
          chatId={message.chatId}
        />

        {isFocus && !isRelyToThisMessage && (
          <div>
            <ReactionPicker
              messageId={messageId}
              chatId={message.chatId}
              isMe={false}
            />
            <MessageActions
              message={message}
              isMe={false}
              isSystemMessage={true}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SystemMessage;
