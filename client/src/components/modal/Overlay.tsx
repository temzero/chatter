import { useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";

interface OverlayProps {
  onClick?: () => void;
}

const Overlay = ({ onClick }: OverlayProps) => {
  const closeModal = useModalStore(state => state.closeModal);

  const handleClick = () => {
    onClick?.();
    closeModal();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 flex bg-black/30 backdrop-blur-sm"
        onClick={handleClick}
      />
    </AnimatePresence>
  );
};

export default Overlay;
