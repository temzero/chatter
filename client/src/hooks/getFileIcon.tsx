export const getFileIcon = (fileName = '') => {
  const name = fileName.toLowerCase();

  if (name.endsWith('.pdf')) return 'picture_as_pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'description';
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'grid_on';
  if (name.endsWith('.zip') || name.endsWith('.rar')) return 'folder_zip';
  return 'insert_drive_file';
};