import React, { useRef } from 'react';

interface AttachFileProps {
  onFileSelect: (files: FileList) => void;
}

const AttachFile: React.FC<AttachFileProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default right-click menu
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*, video/*'; // Restrict to image and video
      fileInputRef.current.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
      event.target.value = ''; // allow re-selecting the same file
    }
  };

  const handleNormalClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '*'; // Allow all files
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <span
        className="material-symbols-outlined opacity-50 hover:opacity-90 cursor-pointer rounded select-none"
        aria-label="Attach file"
        onClick={handleNormalClick} // Left click to allow all files
        onContextMenu={handleRightClick} // Right click to allow only image and video
      >
        attach_file
      </span>

      <input
        type="file"
        accept="*" // Default to accept all files
        multiple
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default AttachFile;
