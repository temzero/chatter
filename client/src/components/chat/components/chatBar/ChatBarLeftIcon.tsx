import { AnimatePresence, motion } from "framer-motion";
import AttachFile from "@/components/ui/attachments/AttachFile";
import { chatBarAnimations } from "@/common/animations/chatBarAnimations";
import { getCloseModal } from "@/stores/modalStore";

interface ChatBarLeftIconProps {
  replyToMessageId: string | null;
  height: number;
  hasAttachment: boolean;
  onFileSelect: (files: FileList) => void;
}

const ChatBarLeftIcon: React.FC<ChatBarLeftIconProps> = ({
  replyToMessageId,
  height,
  hasAttachment,
  onFileSelect,
}) => {
  const closeModal = getCloseModal();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {replyToMessageId ? (
        <motion.button
          key="reply-indicator"
          style={{ height: height, width: height }}
          {...chatBarAnimations.leftIcon}
          onClick={closeModal}
          className="group flex items-center justify-center -ml-1"
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
        <motion.div key="attach-file" className="-ml-1" {...chatBarAnimations.leftIcon}>
          <AttachFile
            onFileSelect={onFileSelect}
            height={height}
            hasAttachment={hasAttachment}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBarLeftIcon;
