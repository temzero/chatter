import React, { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { RenderModalMedia } from './RenderModalMedia';
import { formatFileSize } from '@/hooks/formatFileSize';
import { handleDownload } from '@/hooks/handleDownload';
import { useSoundEffect } from '@/hooks/useSoundEffect';

export interface MediaProps {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  messageId: string;
  fileName?: string;
  size?: number;
  duration?: number;
  sender?: string;
  alt?: string;
}

// Animation variants
const sliderVariants = {
  incoming: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    scale: .4,
    opacity: 0,
    position: 'absolute',
  }),
  active: {
    x: 0,
    scale: 1,
    opacity: 1,
    position: 'relative',
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    scale: .4,
    opacity: 0,
    position: 'absolute',
  }),
};

const sliderTransition = {
  duration: 0.3,
  ease: [0.56, 0.03, 0.12, 1.04],
};

const MediaModal = () => {
  const { currentMediaId, closeModal } = useModal();
  const { activeMedia } = useChat();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (currentMediaId && activeMedia) {
      const index = activeMedia.findIndex(media => media.id === currentMediaId);
      setCurrentIndex(Math.max(0, index));
      setRotation(0); // Reset rotation when modal opens
    }
  }, [currentMediaId, activeMedia]);
  
  // Then in your component:
  const playSound = useSoundEffect();

  const goNext = useCallback(() => {
    if (activeMedia && currentIndex < activeMedia.length - 1) {
      setDirection(1);
      playSound('next');
      setCurrentIndex(prev => prev + 1);
      setRotation(0); // Reset on next
    }
  }, [activeMedia, currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      playSound('prev');
      setCurrentIndex(prev => prev - 1);
      setRotation(0); // Reset on prev
    }
  }, [currentIndex]);

  const handleRotate = useCallback(() => {
    playSound('next');
    setRotation(prev => (prev + 90));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        goPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setRotation(0)
        closeModal();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        e.stopPropagation();
        handleRotate();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        e.stopPropagation();
        handleDownload(activeMedia[currentIndex])
      }
    },
    [goNext, goPrev, closeModal, handleRotate, currentIndex, activeMedia]
  );


  useEffect(() => {
    if (currentMediaId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentMediaId, handleKeyDown]);

  if (!currentMediaId || !activeMedia || activeMedia.length === 0) return null;

  const currentMedia = activeMedia[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md z-[99] flex flex-col items-center justify-center text-white">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white font-medium">{currentMedia.senderId || 'Sender'}</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRotate} 
            className="text-white/60 hover:text-white rounded-full"
          >
            <i className="material-symbols-outlined">refresh</i>
          </button>
          <button className="text-white/60 hover:text-white rounded-full">
            <i className="material-symbols-outlined">send</i>
          </button>
          <button onClick={() => handleDownload(currentMedia)} className="text-white/60 hover:text-white rounded-full">
            <i className="material-symbols-outlined">download</i>
          </button>
          <button className="text-white/60 hover:text-white rounded-full">
            <i className="material-symbols-outlined">delete</i>
          </button>
          <button className="text-white/60 hover:text-white rounded-full" onClick={() => {closeModal(); setRotation(0)}}>
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
        >
          <i className="material-symbols-outlined text-5xl">chevron_left</i>
        </button>
      )}
      {activeMedia.length > 1 && currentIndex < activeMedia.length - 1 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-l hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
        >
          <i className="material-symbols-outlined text-5xl">chevron_right</i>
        </button>
      )}

      {/* Media Viewer with Animation */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentMedia.id}
          custom={direction}
          variants={sliderVariants}
          initial="incoming"
          animate="active"
          exit="exit"
          transition={sliderTransition}
          className="w-full h-full flex items-center justify-center scrollbar-hide select-none overflow-auto"
        >
          <RenderModalMedia media={currentMedia} rotation={rotation} />
        </motion.div>
      </AnimatePresence>

      {/* Bottom Info */}
      {activeMedia.length > 1 && (
        <>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black/60 to-transparent">
            {currentMedia.fileName && (
              <div className="text-white/60 truncate max-w-[50%]">
                {currentMedia.fileName}
              </div>
            )}
            {currentMedia.size && (
              <div className="text-white/60">
                {formatFileSize(currentMedia.size)}
              </div>
            )}
            {/* {dimension && (
              <div className="text-white/60">
                currentMedia.dimension
              </div>
            )} */}
          </div>
          {/* Dot Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 ">
            {activeMedia.map((_, index) => (
              <span
                key={index}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white scale-150' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaModal;
