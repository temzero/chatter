// src/contexts/MediaContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Media = {
  type: 'photo' | 'video';
  url: string;
};

interface MediaContextType {
  openMedia: (media: Media) => void;
  closeMedia: () => void;
  media: Media | null;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [media, setMedia] = useState<Media | null>(null);

  const openMedia = (media: Media) => setMedia(media);
  const closeMedia = () => setMedia(null);

  return (
    <MediaContext.Provider value={{ media, openMedia, closeMedia }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within MediaProvider');
  return context;
};
