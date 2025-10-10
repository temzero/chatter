import { modalAnimations } from "@/animations/modalAnimations";
import { useModalStore } from "@/stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";

interface OverlayProps {
  onClick?: () => void;
}

const Overlay = ({ onClick }: OverlayProps) => {
  const closeModal = useModalStore((state) => state.closeModal);

  const handleClick = () => {
    onClick?.();
    closeModal();
  };

  return (
    <AnimatePresence>
      <motion.div
        {...modalAnimations.modal}
        className="fixed inset-0 flex bg-black/30 backdrop-blur-sm"
        onClick={handleClick}
      />
    </AnimatePresence>
  );
};

export default Overlay;
