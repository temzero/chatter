import React, { useRef } from 'react';

interface AttachFileProps {
  onFileSelect: (files: FileList) => void;
}

const AttachFile: React.FC<AttachFileProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
      event.target.value = ''; // allow re-selecting the same file
    }
  };

  return (
    <>
      <span
        className="material-symbols-outlined opacity-50 hover:opacity-90 cursor-pointer rounded select-none"
        aria-label="Attach file"
        onClick={handleClick}
      >
        attach_file
      </span>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default AttachFile;
