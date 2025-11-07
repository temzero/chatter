// src/common/utils/validatePassword.ts
export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate password based on common rules:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Must match confirmation (optional)
 */
export function validatePassword(
  password: string,
  confirmPassword?: string
): PasswordValidationResult {
  if (!password) {
    return { isValid: false, message: "Password is required." };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number.",
    };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      isValid: false,
      message: "Passwords do not match.",
    };
  }

  return { isValid: true };
}
