import * as React from "react";
import { parseBlob } from "music-metadata-browser";

interface FileInfo {
  index: number;
  file: File;
  url: string;
}

interface UseMediaThumbnailsProps {
  files: File[];
  urls: string[];
}

export const useMediaThumbnails = ({
  files,
  urls,
}: UseMediaThumbnailsProps) => {
  const [thumbnails, setThumbnails] = React.useState<Record<number, string>>(
    {},
  );
  const processedRef = React.useRef<Set<string>>(new Set());

  // Create file signatures to track which files have been processed
  const getFileSignature = React.useCallback((file: File, index: number) => {
    return `${index}-${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  // Process only new media files
  React.useEffect(() => {
    const processNewMediaFiles = async () => {
      const mediaFilesToProcess: FileInfo[] = [];

      // Identify new media files that haven't been processed
      files.forEach((file, index) => {
        // Check for audio/video files and common media extensions
        const isMedia =
          file.type.startsWith("audio/") ||
          file.type.startsWith("video/") ||
          file.name.match(
            /\.(mp3|mp4|m4a|m4v|flac|ogg|wav|aiff|mov|avi|mkv|webm)$/i,
          );

        if (isMedia) {
          const signature = getFileSignature(file, index);
          if (!processedRef.current.has(signature)) {
            mediaFilesToProcess.push({ index, file, url: urls[index] });
            processedRef.current.add(signature);
          }
        }
      });

      if (mediaFilesToProcess.length === 0) return;

      // Process media files in parallel
      const processingPromises = mediaFilesToProcess.map(
        async ({ index, file }) => {
          try {
            const metadata = await parseBlob(file);
            const picture = metadata.common.picture?.[0];

            if (picture) {
              const pictureData = new Uint8Array(picture.data);
              const blob = new Blob([pictureData], { type: picture.format });
              return { index, url: URL.createObjectURL(blob) };
            }
          } catch (error) {
            console.error(
              `Error extracting thumbnail for ${file.name}:`,
              error,
            );
          }
          return null;
        },
      );

      const results = await Promise.all(processingPromises);

      // Update state with new thumbnails
      setThumbnails((prev) => {
        const newThumbnails = { ...prev };
        results.forEach((result) => {
          if (result) {
            newThumbnails[result.index] = result.url;
          }
        });
        return newThumbnails;
      });
    };

    processNewMediaFiles();
  }, [files, urls, getFileSignature]);

  // Clean up when component unmounts or when files are removed
  React.useEffect(() => {
    const processedSet = processedRef.current;
    return () => {
      // Revoke all object URLs on unmount
      Object.values(thumbnails).forEach((url) => {
        URL.revokeObjectURL(url);
      });
      processedSet.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remove a specific thumbnail
  const removeThumbnail = React.useCallback(
    (index: number) => {
      setThumbnails((prev) => {
        const url = prev[index];
        if (url) {
          URL.revokeObjectURL(url);

          // Remove from processed set
          const file = files[index];
          if (file) {
            const signature = getFileSignature(file, index);
            processedRef.current.delete(signature);
          }

          const newThumbnails = { ...prev };
          delete newThumbnails[index];
          return newThumbnails;
        }
        return prev;
      });
    },
    [files, getFileSignature],
  );

  // Clean up when files array shrinks (files were removed)
  React.useEffect(() => {
    // Find indices that are no longer in the files array
    const currentIndices = new Set(
      Array.from({ length: files.length }, (_, i) => i),
    );

    setThumbnails((prev) => {
      const newThumbnails = { ...prev };
      let changed = false;

      Object.keys(prev).forEach((key) => {
        const index = Number(key);
        if (!currentIndices.has(index)) {
          // This index no longer exists in files array
          URL.revokeObjectURL(prev[index]);
          delete newThumbnails[index];

          // Remove from processed set
          const oldFile = files.find((_, i) => i === index);
          if (oldFile) {
            const signature = getFileSignature(oldFile, index);
            processedRef.current.delete(signature);
          }

          changed = true;
        }
      });

      return changed ? newThumbnails : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length, getFileSignature]);

  return {
    thumbnails,
    removeThumbnail,
  };
};
