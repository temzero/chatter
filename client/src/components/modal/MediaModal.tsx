// src/components/MediaModal.tsx
import React from 'react';
import { useMedia } from '@/contexts/MediaContext';

const MediaModal: React.FC = () => {
  const { media, closeMedia } = useMedia();

  if (!media) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80"
      onClick={closeMedia}
    >
      {media.type === 'photo' && (
        <img src={media.url} alt="Full View" className="max-w-full max-h-full rounded" />
      )}
      {media.type === 'video' && (
        <video src={media.url} controls className="max-w-full max-h-full rounded" />
      )}
    </div>
  );
};

export default MediaModal;
