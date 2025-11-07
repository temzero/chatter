// utils/validatePhoneNumber.ts
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;

  // Remove non-digit characters
  const cleanedPhone = phone.replace(/\D/g, "");

  // Check length (10–15 digits)
  if (cleanedPhone.length < 10 || cleanedPhone.length > 15) return false;

  return true;
};
