import { TFunction } from "i18next";

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
  t: TFunction,
  password: string,
  confirmPassword?: string
): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      message: t("auth.register.password_required", "Password is required."),
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: t(
        "auth.register.password_min_length",
        "Password must be at least 8 characters long."
      ),
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: t(
        "auth.register.password_uppercase",
        "Password must contain at least one uppercase letter."
      ),
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: t(
        "auth.register.password_lowercase",
        "Password must contain at least one lowercase letter."
      ),
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: t(
        "auth.register.password_number",
        "Password must contain at least one number."
      ),
    };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      isValid: false,
      message: t("auth.register.passwords_do_not_match", "Passwords do not match."),
    };
  }

  return { isValid: true };
}
