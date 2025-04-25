// components/MediaDimensions.tsx
import React, { useEffect, useState } from 'react';

interface MediaDimensionsProps {
  url: string;
  type: 'image' | 'video';
}

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const calculateAspectRatio = (width: number, height: number): string => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

const MediaDimensions: React.FC<MediaDimensionsProps> = ({ url, type }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setAspectRatio(calculateAspectRatio(img.width, img.height));
      };
      img.src = url;
    }
  }, [url, type]);

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const width = video.videoWidth;
    const height = video.videoHeight;
    setDimensions({ width, height });
    setAspectRatio(calculateAspectRatio(width, height));
  };

  if (!dimensions) return null;

  return (
    <>
      {type === 'video' && (
        <video
          className="hidden"
          src={url}
          onLoadedMetadata={handleVideoMetadata}
        />
      )}
      <div className="absolute bottom-1 right-1 bg-black bg-opacity-20 text-white text-xs p-1 rounded">
        {dimensions.width}×{dimensions.height} {aspectRatio && `(${aspectRatio})`}
      </div>
    </>
  );
};

export default MediaDimensions;
