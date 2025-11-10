import { motion } from "framer-motion";
import clsx from "clsx";
import { getCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import { messageAnimations } from "@/common/animations/messageAnimations";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  setOpenFocusMessageModal,
} from "@/stores/modalStore";
import { MessageContextMenu } from "./MessageContextMenu";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "../../../ui/messages/content/SystemMessageContent";

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
  const currentUserId = getCurrentUserId();
  const messageId = message.id;

  const isFocus = useIsMessageFocus(messageId);
  const isRelyToThisMessage = useIsReplyToThisMessage(messageId);

  if (!message || !currentUserId) return;

  return (
    <motion.div
      id={`message-${messageId}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setOpenFocusMessageModal(message.id);
      }}
      className={clsx(
        "cursor-pointer rounded-full mb-2 px-1 mx-auto flex items-center justify-center",
        message.isImportant &&
          "border-2 border-red-500/50 bg-[--background-color]"
      )}
      style={{
        zIndex: isFocus || isRelyToThisMessage ? 100 : "auto",
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
          currentUserId={currentUserId}
          senderId={senderId}
          senderDisplayName={senderDisplayName}
          JSONcontent={content}
        />

        <MessageReactionDisplay
          isMe={false}
          isSystemMessage={true}
          currentUserId={currentUserId}
          messageId={messageId}
          chatId={message.chatId}
        />

        {isFocus && !isRelyToThisMessage && (
          <MessageContextMenu message={message} isSystemMessage={true} />
        )}
      </div>
    </motion.div>
  );
};

export default SystemMessage;
