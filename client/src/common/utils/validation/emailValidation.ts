// utils/validateEmail.ts
export const validateEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  // Optional: check max length (RFC says 254 chars max)
  if (email.length > 254) return false;

  return true;
};
