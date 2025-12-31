import * as React from "react";
import Button from "@/components/ui/buttons/Button";
import { getCloseModal } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  children?: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;

  confirmText: string;

  onGreenAction?: () => void; // primary (green / blue)
  onYellowAction?: () => void; // warning (yellow)
  onRedAction?: () => void; // danger (red)

  onCancel?: () => void;

  disableCancel?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  children,
  title,
  description,
  icon,
  confirmText,
  onGreenAction,
  onRedAction,
  onYellowAction,
  onCancel,
  disableCancel = false,
}) => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();

  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  return (
    <div className="w-full h-full">
      {/* ===== BODY ===== */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-3">
          {icon}
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>

        {children && children}

        {description && (
          <p className="mt-3 text-sm opacity-70">{description}</p>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="flex gap-2 p-2">
        {onGreenAction && (
          <Button variant="primary" fullWidth size="sm" onClick={onGreenAction}>
            {confirmText}
          </Button>
        )}

        {onYellowAction && (
          <Button
            variant="warning" // 🟡 yellow
            fullWidth
            size="sm"
            onClick={onYellowAction}
          >
            {confirmText}
          </Button>
        )}

        {onRedAction && (
          <Button
            variant="danger" // 🔴 red
            fullWidth
            size="sm"
            onClick={onRedAction} // ✅ fixed
          >
            {confirmText}
          </Button>
        )}

        {!disableCancel && (
          <Button
            variant="secondary"
            fullWidth
            size="sm"
            onClick={handleCancel}
          >
            {t("common.actions.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfirmDialog;
