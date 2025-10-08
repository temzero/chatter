import clsx from "clsx";
import { motion } from "framer-motion";
import { useCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/types/enums/systemEventType";
import { MessageResponse } from "@/types/responses/message.response";
import { MessageActions } from "@/components/ui/MessageActions";
import { ReactionPicker } from "@/components/ui/MessageReactionPicker";
import { MessageReactionDisplay } from "@/components/ui/MessageReactionsDisplay";
import { messageAnimations } from "@/animations/messageAnimations";
import { SystemMessageContent } from "@/components/ui/SystemMessageContent";
import { SystemMessageJSONContent } from "@/components/ui/SystemMessageContent";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";

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

  const animationProps = message.shouldAnimate
    ? messageAnimations.SystemMessage
    : messageAnimations.none;

  return (
    <motion.div
      id={`message-${messageId}`}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      className={clsx(
        "cursor-pointer opacity-50 pb-2 mx-auto flex items-center justify-center",
        {
          "z-[99]": isFocus,
        }
      )}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(messageId);
      }}
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
