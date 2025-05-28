import React, { useCallback, useEffect, useRef, useState } from "react";

interface AvatarEditProps {
  avatarUrl: string | null | undefined;
  type?: "user" | "group" | "channel";
  onAvatarChange: (newAvatar: string, file?: File) => void;
  targetSize?: number;
}

const DEFAULT_AVATAR_ICONS = {
  user: "person",
  group: "groups",
  channel: "tv",
} as const;

const AvatarEdit: React.FC<AvatarEditProps> = ({
  avatarUrl,
  onAvatarChange,
  type = "user",
  targetSize = 512,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  // const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
  //   null
  // );

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [croppedUrl, avatarUrl]);

  // Handle image crop and resize
  const cropAndResizeImage = (img: HTMLImageElement): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext("2d")!;

      // Calculate square crop (centered)
      const minSize = Math.min(img.width, img.height);
      const offsetX = (img.width - minSize) / 2;
      const offsetY = (img.height - minSize) / 2;

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        minSize,
        minSize, // Source crop
        0,
        0,
        targetSize,
        targetSize // Destination resize
      );

      // Convert to Blob (WebP for smaller size)
      canvas.toBlob(
        (blob) => resolve(blob!),
        "image/webp",
        0.9 // Quality
      );
    });
  };

  // Handle file selection
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate image type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          // Step 1: Crop and resize
          const croppedBlob = await cropAndResizeImage(img);
          const croppedUrl = URL.createObjectURL(croppedBlob);

          // Step 2: Update preview
          setCroppedUrl(croppedUrl);

          // Step 3: Pass to parent (convert Blob to File)
          const croppedFile = new File([croppedBlob], file.name, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          console.log("Compressed file size:", croppedFile.size / 1024, "KB");
          onAvatarChange(croppedUrl, croppedFile);
        } catch (err) {
          console.error("Image processing failed:", err);
          alert("Failed to process image.");
        } finally {
          URL.revokeObjectURL(img.src); // Clean up
        }
      };
    },
    [cropAndResizeImage, onAvatarChange]
  );

  // Dynamic classes
  const containerClasses = [
    "h-36 w-36 flex items-center justify-center overflow-hidden relative",
    type === "group"
      ? "rounded-[28px]"
      : type === "channel"
      ? "rounded-[28px]"
      : "rounded-full",
    "border-2 border-[var(--border-color)]",
  ].join(" ");

  return (
    <div className={containerClasses}>
      {croppedUrl || avatarUrl ? (
        <img
          src={croppedUrl || avatarUrl!}
          alt={`${type} avatar`}
          className="h-full w-full object-cover"
        />
      ) : (
        <i className="material-symbols-outlined text-8xl opacity-20">
          {DEFAULT_AVATAR_ICONS[type]}
        </i>
      )}

      <label className="absolute inset-0 flex items-center justify-center text-white bg-black/50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
        <i className="material-symbols-outlined text-2xl">edit</i>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default AvatarEdit;
