import { AnimatePresence, motion } from "framer-motion";
import AttachFile from "@/components/ui/attachments/AttachFile";
import { chatBarAnimations } from "@/common/animations/chatBarAnimations";
import { getCloseModal } from "@/stores/modalStore";
import clsx from "clsx";
import MicButton from "@/components/ui/buttons/MicButton";

interface ChatBarLeftIconProps {
  replyToMessageId: string | null;
  hasAttachment: boolean;
  isEnableMic?: boolean;
  onFileSelect: (files: FileList) => void;
}

const ChatBarLeftIcon: React.FC<ChatBarLeftIconProps> = ({
  replyToMessageId,
  hasAttachment,
  isEnableMic,
  onFileSelect,
}) => {
  const closeModal = getCloseModal();
  const marginClass = "-ml-1 mr-2 -mb-[1px]";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* If mic is enabled, always show mic button */}
      {isEnableMic ? (
        <motion.div
          key="mic-btn"
          {...chatBarAnimations.micButton}
          className={marginClass}
        >
          <MicButton isRecording={true}/>
        </motion.div>
      ) : (
        <>
          {/* If mic is disabled and there's a reply, show reply indicator */}
          {replyToMessageId ? (
            <motion.button
              key="reply-indicator"
              {...chatBarAnimations.leftIcon}
              onClick={closeModal}
              className={clsx(
                marginClass,
                "h-(--chat-input-container-height) w-(--chat-input-container-height)",
                "group flex items-center justify-center",
              )}
            >
              {/* Reply icon */}
              <span className="material-symbols-outlined text-3xl! rotate-180 group-hover:hidden!">
                reply
              </span>

              {/* Close icon */}
              <span className="material-symbols-outlined text-3xl! hidden! group-hover:block! text-red-400">
                close
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="attach-file"
              {...chatBarAnimations.leftIcon}
              className={marginClass}
            >
              <AttachFile
                onFileSelect={onFileSelect}
                hasAttachment={hasAttachment}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatBarLeftIcon;