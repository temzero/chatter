import React, { useState, useEffect } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { getCurrentUser, useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/http/userService";
import { handleError } from "@/common/utils/handleError";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { validatePhoneNumber } from "@/common/utils/validation/phoneNumberValidation";

const SidebarSettingsPhoneNumber: React.FC = () => {
  const { t } = useTranslation();

  const currentUser = getCurrentUser();

  const setCurrentUser = useAuthStore.getState().setCurrentUser;

  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore.getState().setLoading;

  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || ""
  );

  const [isValid, setIsValid] = useState(false);
  const isUnchanged = phoneNumber === currentUser?.phoneNumber;
  const isDisabled = loading || !isValid || isUnchanged;

  const invalidMessage = t("account_settings.change_phone.messages.invalid");

  // Validate phone number whenever it changes
  useEffect(() => {
    setIsValid(validatePhoneNumber(phoneNumber));
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error(invalidMessage);
      return;
    }

    if (!isValid) {
      toast.error(invalidMessage);
      return;
    }

    try {
      setLoading(true);

      // Check if phone number is the same as current
      if (phoneNumber === currentUser?.phoneNumber) {
        toast.info(t("account_settings.change_phone.messages.already_current"));
        return;
      }

      // Send cleaned phone number (digits only) to the server
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
      const updatedUser = await userService.sendOTPValidation(
        cleanedPhoneNumber
      );
      setCurrentUser(updatedUser);
      toast.success(
        t("account_settings.change_phone.messages.sent", {
          phone: cleanedPhoneNumber,
        })
      );
    } catch (error) {
      handleError(
        error,
        t("account_settings.change_phone.messages.failed_send")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      title={t("account_settings.change_phone.title")}
      backLocation={SidebarMode.SETTINGS_ACCOUNT}
    >
      <form onSubmit={handleSubmit} className="p-2 flex flex-col gap-2">
        <div className="w-full p-4 rounded-lg bg-[var(--hover-color)]">
          <ul className="space-y-1 dark:text-gray-300">
            {(
              t("account_settings.change_phone.requirements", {
                returnObjects: true,
              }) as string[]
            ).map((requirement: string, index: number) => (
              <li key={index}>• {requirement}</li>
            ))}
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
          placeholder={t("account_settings.change_phone.placeholder")}
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
          {loading
            ? t("common.actions.send_verification")
            : t("common.actions.send_verification")}
        </button>
      </form>
    </SidebarLayout>
  );
};

export default SidebarSettingsPhoneNumber;
