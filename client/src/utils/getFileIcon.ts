export const getFileIcon = (
  fileName?: string | null,
  mimeType?: string | null
): string | null => {
  if (!fileName && !mimeType) return null;

  const name = (fileName || "").toLowerCase();
  const mime = (mimeType || "").toLowerCase();

  const extensionMap: Record<string, string> = {
    ".pdf": "picture_as_pdf",
    ".doc": "description",
    ".docx": "description",
    ".xls": "grid_on",
    ".xlsx": "grid_on",
    ".zip": "folder_zip",
    ".rar": "folder_zip",
  };

  const mimeKeywords: { keyword: string; icon: string }[] = [
    { keyword: "pdf", icon: "picture_as_pdf" },
    { keyword: "word", icon: "description" },
    { keyword: "excel", icon: "grid_on" },
    { keyword: "zip", icon: "folder_zip" },
    { keyword: "compressed", icon: "folder_zip" },
  ];

  const extMatch = Object.entries(extensionMap).find(([ext]) =>
    name.endsWith(ext)
  );
  if (extMatch) return extMatch[1];

  const mimeMatch = mimeKeywords.find(({ keyword }) => mime.includes(keyword));
  if (mimeMatch) return mimeMatch.icon;

  return "insert_drive_file";
};
