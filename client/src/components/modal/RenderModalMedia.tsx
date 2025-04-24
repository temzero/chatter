import React from 'react';
import { MediaProps } from './MediaModal'; // Or wherever your interface is defined

export const RenderModalMedia: React.FC<{ media: MediaProps }> = ({ media }) => {
  switch (media.type) {
    case 'image':
      return (
        <img
          src={media.url}
          alt={media.alt || media.fileName || 'Image'}
          className="max-w-full max-h-full object-contain rounded"
          draggable="false"
        />
      );
    case 'video':
      return (
        <video
          src={media.url}
          controls
          autoPlay
          className="max-w-full max-h-full object-contain rounded"
          draggable="false"
        />
      );
    case 'audio':
      return (
        <div className="bg-gray-800 p-8 rounded">
          <audio src={media.url} controls autoPlay className="w-full max-w-md" />
          <div className="text-white mt-2 text-center">
            {media.fileName || 'Audio file'}
          </div>
        </div>
      );
    case 'file':
      return (
        <div className="bg-gray-800 p-8 rounded text-white text-center max-w-md">
          <i className="material-symbols-outlined text-6xl mb-4">insert_drive_file</i>
          <div className="text-lg font-medium">{media.fileName || 'File'}</div>
          {media.size && (
            <div className="text-gray-400 mt-2">
              {(media.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
          <button className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Download
          </button>
        </div>
      );
    default:
      return null;
  }
};