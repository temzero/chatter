import React, { useState, useRef } from 'react';

interface CustomAudioPlayerProps {
  mediaUrl: string;
  fileName?: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ mediaUrl, fileName }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="w-full rounded p-2 flex items-center gap-1">
      <button onClick={togglePlayPause} className="rounded-full hover:opacity-80">
        {isPlaying ? (
          <i className="material-symbols-outlined text-5xl">pause_circle</i>
        ) : (
          <i className="material-symbols-outlined text-5xl">play_circle</i>
        )}
      </button>

      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-center">{fileName}</h1>

        <audio
          ref={audioRef}
          className="flex-1 bg-transparent"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
        >
          <source src={mediaUrl} type={getAudioType(fileName || '')} />
          Your browser does not support the audio element.
        </audio>

        {/* Custom Styled Progress Bar */}
        <input
          type="range"
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4caf50 ${progress}%, #ccc ${progress}%)`
          }}
        />
      </div>
    </div>
  );
};

const getAudioType = (fileName: string) => {
  if (fileName.endsWith('.mp3')) return 'audio/mpeg';
  if (fileName.endsWith('.m4a')) return 'audio/x-m4a';
  if (fileName.endsWith('.wav')) return 'audio/wav';
  if (fileName.endsWith('.ogg')) return 'audio/ogg';
  return 'audio/mpeg'; // Fallback to mp3 type if unknown
};

export default CustomAudioPlayer;
