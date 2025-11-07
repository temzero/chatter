// utils/validateUsername.ts
export const validateUsername = (username: string): boolean => {
  if (!username) return false;

  // Max length
  if (username.length > 30) return false;

  // Allowed characters: letters, numbers, dot, underscore
  const validChars = /^[a-zA-Z0-9._]+$/;
  if (!validChars.test(username)) return false;

  // No spaces
  if (/\s/.test(username)) return false;

  // Cannot end with dot
  if (username.endsWith(".")) return false;

  // No consecutive dots
  if (/\.{2,}/.test(username)) return false;

  return true;
};
