import { useEffect } from "react";

interface UsePasteImageProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onFileSelect: (files: FileList) => void;
}

export const usePasteImage = ({ inputRef, onFileSelect }: UsePasteImageProps) => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            // Wrap single file in a FileList-like object
            const fileList = {
              0: file,
              length: 1,
              item: (index: number) => (index === 0 ? file : null),
            } as unknown as FileList;

            onFileSelect(fileList);
          }
        }
      }
    };

    const textarea = inputRef.current;
    textarea?.addEventListener("paste", handlePaste);

    return () => {
      textarea?.removeEventListener("paste", handlePaste);
    };
  }, [inputRef, onFileSelect]);
};
