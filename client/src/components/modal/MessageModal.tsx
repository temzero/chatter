import React from "react";
import classNames from "classnames";
import { MessageResponse } from "@/types/responses/message.response";
import { useModalStore } from "@/stores/modalStore";
import Message from "../chat/Message";
import { MessageActions } from "../ui/MessageActions";
import { useIsMe } from "@/stores/authStore";
import { ReactionPicker } from "../ui/MessageReactionPicker";

interface MessageModalProps {
  message: MessageResponse;
}

const MessageModal: React.FC<MessageModalProps> = ({ message }) => {
  const closeModal = useModalStore.getState().closeModal;
  const isMe = useIsMe(message.sender.id);

  return (
    <div
      onClick={closeModal}
      className={classNames("flex flex-col gap-1 w-screen", {
        "items-end": isMe,
        "items-start": !isMe,
      })}
    >
      {/* <MessagePreview message={message} /> */}
      <ReactionPicker messageId={message.id} chatId={message.chatId} />
      <Message message={message} isPreview={false} />
      <MessageActions message={message} />
    </div>
  );
};

export default MessageModal;
