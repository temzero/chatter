import React, { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { RenderModalMedia } from './RenderModalMedia';
import { formatFileSize } from '../ui/RenderMedia';

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

const MediaModal = () => {
  const { currentMediaId, closeModal } = useModal();
  const { activeMedia } = useChat();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  console.log('direction', direction)

  useEffect(() => {
    if (currentMediaId && activeMedia) {
      const index = activeMedia.findIndex(media => media.id === currentMediaId);
      setCurrentIndex(Math.max(0, index));
    }
  }, [currentMediaId, activeMedia]);

  const goNext = useCallback(() => {
    if (activeMedia && currentIndex < activeMedia.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [activeMedia, currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    },
    [goNext, goPrev, closeModal]
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

      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[99] flex items-center justify-center"

        onClick={closeModal}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="text-white font-medium">{currentMedia.sender || 'Username'}</div>
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white">
              <i className="material-symbols-outlined">replay</i>
            </button>
            <button className="text-white/60 hover:text-white">
              <i className="material-symbols-outlined">send</i>
            </button>
            <button className="text-white/60 hover:text-white">
              <i className="material-symbols-outlined">download</i>
            </button>
            <button className="text-white/60 hover:text-white">
              <i className="material-symbols-outlined">delete</i>
            </button>
            <button className="text-white/60 hover:text-white" onClick={closeModal}>
              <i className="material-symbols-outlined">close</i>
            </button>
          </div>
        </div>

        {currentIndex > 0 && (
          <button
            className="h-full w-16 flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <i className="material-symbols-outlined text-5xl">chevron_left</i>
          </button>
        )}

        {activeMedia.length > 1 && currentIndex < activeMedia.length - 1 && (
          <button
            className="h-full w-16 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-l hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <i className="material-symbols-outlined text-5xl">chevron_right</i>
          </button>
        )}

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentMedia.id}
            custom={direction}
            initial={{ x: direction === 1 ? 1000 : direction === -1 ? -1000 : 0}}
            animate={{ x: 0 }}
            exit={{ x: direction === 1 ? -1000 : 1000}}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <RenderModalMedia media={currentMedia} />
          </motion.div>
        </AnimatePresence>

        {activeMedia.length > 1 && (
          <>
          <div className="absolute bottom-0 left-0 p-2 px-3 text-xl">
              {currentIndex + 1} / {activeMedia.length}
          </div>
          {currentMedia.size && 
          <div className="absolute bottom-0 right-0 p-2 px-3">
              {formatFileSize(currentMedia.size) || '???'}
          </div>     
          }
          </>
        )}
      </div>
  );
};

export default MediaModal;