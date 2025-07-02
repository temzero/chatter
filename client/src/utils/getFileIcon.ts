export const getFileIcon = (fileName = "", mimeType = "") => {
  const name = fileName.toLowerCase();
  const mime = mimeType.toLowerCase();

  // Prefer filename if available
  if (name.endsWith(".pdf") || mime === "application/pdf")
    return "picture_as_pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx") || mime.includes("word"))
    return "description";
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || mime.includes("excel"))
    return "grid_on";
  if (
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    mime.includes("zip") ||
    mime.includes("compressed")
  )
    return "folder_zip";

  return "insert_drive_file";
};
