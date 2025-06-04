import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import { handleError } from "@/utils/handleError";
import { toast } from "react-toastify";


const SidebarSettingsPhoneNumber: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const loading = useAuthStore((state) => state.loading);

  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || ""
  );
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState("");
  const isUnchanged = phoneNumber === currentUser?.phoneNumber;
  const isDisabled = loading || !isValid || isUnchanged;

  // Validate phone number whenever it changes
  useEffect(() => {
    if (!phoneNumber) {
      setIsValid(false);
      setValidationError("");
      return;
    }

    // Remove all non-digit characters
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

    // Check length (adjust based on your requirements)
    if (cleanedPhoneNumber.length < 10) {
      setIsValid(false);
      setValidationError("Phone number must be at least 10 digits");
      return;
    }

    if (cleanedPhoneNumber.length > 15) {
      setIsValid(false);
      setValidationError("Phone number must be no more than 15 digits");
      return;
    }

    // If all checks pass
    setIsValid(true);
    setValidationError("");
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Phone number cannot be empty");
      return;
    }

    if (!isValid) {
      toast.error(validationError || "Invalid phone number format");
      return;
    }

    try {
      setLoading(true);

      // Check if phone number is the same as current
      if (phoneNumber === currentUser?.phoneNumber) {
        toast("This is already your current phone number");
        return;
      }

      // Send cleaned phone number (digits only) to the server
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
      const updatedUser = await userService.sendOTPValidation(
        cleanedPhoneNumber
      );
      setCurrentUser(updatedUser);
      toast.success("Phone number updated successfully");
    } catch (error) {
      handleError(error, "Failed to update phone number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Change Phone Number"
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <h3 className="font-semibold mb-2">Phone Number Requirements:</h3>
          <ul className="space-y-1 dark:text-gray-300">
            <li>• Must be a valid phone number</li>
            <li>• 10-15 digits (country code optional)</li>
            <li>• Must be unique (not used by another account)</li>
            <li>• You may need to verify the new phone number</li>
          </ul>
        </div>

        <input
          type="number"
          value={phoneNumber}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, ""); // Ensure only digits
            setPhoneNumber(digitsOnly);
          }}
          disabled={loading}
          name="phoneNumber"
          placeholder="Set New Phone Number"
          className="input"
          autoComplete="tel"
          autoFocus
          inputMode="numeric"
          pattern="\d*"
        />

        <button
          type="submit"
          className={`${isDisabled ? "" : "primary"} p-1 w-full`}
          disabled={isDisabled}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {validationError && (
          <div className="text-sm text-red-600">{validationError}</div>
        )}
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsPhoneNumber;
