import clsx from "clsx";
import EmojiPicker from "@/components/ui/EmojiPicker";
import { useTranslation } from "react-i18next";

interface ChatBarInputProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  showSendButton: boolean;
  replyToMessageId: string | null;
  isMessageSent: boolean;
  isMobile: boolean;
  chatId?: string;
  onInput: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onEmojiSelect: (emoji: string) => void;
}

const ChatBarInput: React.FC<ChatBarInputProps> = ({
  inputRef,
  containerRef,
  showSendButton,
  replyToMessageId,
  isMessageSent,
  isMobile,
  chatId,
  onInput,
  onKeyDown,
  onEmojiSelect,
}) => {
  const { t } = useTranslation();

  return (
    <div
      ref={containerRef}
      id="input-container"
      className={clsx(
        "chat-input",
        (showSendButton || replyToMessageId) && "is-reply"
      )}
    >
      <textarea
        ref={inputRef}
        onInput={onInput}
        onKeyDown={onKeyDown}
        className={clsx(
          "w-full outline-none bg-transparent resize-none overflow-hidden",
          {
            "opacity-10 transition-opacity duration-100 ease-in-out":
              isMessageSent,
          }
        )}
        placeholder={t("chat_bar.placeholder")}
        rows={1}
        disabled={!chatId}
      />

      {chatId && (
        <div className="flex gap-1 items-center">
          {!isMobile && <EmojiPicker onSelect={onEmojiSelect} />}
        </div>
      )}
    </div>
  );
};

export default ChatBarInput;
