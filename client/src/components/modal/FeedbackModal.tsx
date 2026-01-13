import React, { useRef, useState } from "react";
import { getCloseModal } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import ConfirmDialog from "./layout/ConfirmDialog";
import StarRating from "../ui/StarRating";
import { FeedbackCategory } from "@/shared/types/enums/feedback.enum";
import { feedbackService } from "@/services/http/feedbackService";

// Define the icon mapping object
export const FeedbackTypeIcons: Record<FeedbackCategory, string> = {
  [FeedbackCategory.BUG]: "bug_report",
  [FeedbackCategory.INTERFACE]: "web",
  [FeedbackCategory.FEATURE]: "add_circle",
  [FeedbackCategory.IMPROVEMENT]: "upgrade",
  [FeedbackCategory.PERFORMANCE]: "speed",
  [FeedbackCategory.SECURITY]: "lock",
  [FeedbackCategory.OTHER]: "more_horiz",
} as const;

const FeedbackModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackCategory>(
    FeedbackCategory.BUG
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxChar = 999;

  const handleSubmitFeedback = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simple data - device info automatically added by service
      await feedbackService.createFeedback({
        rating: rating > 0 ? rating : undefined,
        message: feedbackMessage,
        category: feedbackType,
      });

      closeModal();
      toast.success(t("toast.feedback.submitted"));
    } catch (error) {
      handleError(error, "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  // Get all feedback types as an array for iteration
  const feedbackTypes = Object.values(FeedbackCategory);

  const feedbackTypeSection = (
    <div className="flex flex-wrap gap-2 my-4">
      {feedbackTypes.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => setFeedbackType(type)}
          disabled={isSubmitting}
          className={`px-2 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 custom-border ${
            feedbackType === type
              ? "bg-(--primary-green) text-white"
              : "hover:bg-(--hover-color)"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="material-symbols-outlined text-base">
            {FeedbackTypeIcons[type]}
          </span>
          {t(`modal.feedback.type.${type}`)}
        </button>
      ))}
    </div>
  );

  const messageForm = (
    <form
      className="w-full relative"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitFeedback();
      }}
    >
      <textarea
        id="feedback-message"
        ref={textareaRef}
        placeholder={t("modal.feedback.message_placeholder")}
        className="w-full min-h-40 p-2 custom-border rounded-lg focus:ring-2 focus:ring-(primary-color) focus:border-2 focus:border-(--primary-color) "
        maxLength={maxChar}
        onChange={handleTextChange}
        value={feedbackMessage}
        disabled={isSubmitting}
        autoFocus
      />
      <div className="absolute bottom-3 right-2 flex justify-between items-center">
        <span className="text-xs opacity-60 ml-auto">
          {charCount}/{maxChar}
        </span>
      </div>
    </form>
  );

  const confirmable =
    rating > 0 && feedbackMessage.trim().length > 0 && !isSubmitting;

  return (
    <ConfirmDialog
      title={t("modal.feedback.title")}
      icon={
        <span className="material-symbols-outlined text-3xl!">feedback</span>
      }
      confirmText={
        isSubmitting ? t("common.actions.sending") : t("common.actions.send")
      }
      onGreenAction={confirmable ? handleSubmitFeedback : undefined}
      onCancel={isSubmitting ? undefined : closeModal}
    >
      <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      {feedbackTypeSection}
      {messageForm}
    </ConfirmDialog>
  );
};

export default FeedbackModal;
