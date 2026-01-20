import React, { useRef, useState } from "react";
import { getCloseModal } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import ConfirmDialog from "./layout/ConfirmDialog";
import StarRating from "../ui/StarRating";
import { FeedbackCategory, FeedbackCategoryIcons } from "@/shared/types/enums/feedback.enum";
import { feedbackService } from "@/services/http/feedbackService";
import { audioManager, SoundType } from "@/services/media/audioManager";

const email = "chatter.gateway@gmail.com";

const FeedbackModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackCategory>(
    FeedbackCategory.OTHER
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
        category: feedbackType,
        message: feedbackMessage,
      });

      closeModal();
      audioManager.playSound(SoundType.PAGE);
      toast.success(t("toast.feedback.submitted"));
    } catch (error) {
      toast.error(t("toast.feedback.failed"));
      handleError(error, "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    // Capitalize first letter if it exists
    const capitalizedText =
      input.length > 0 ? input.charAt(0).toUpperCase() + input.slice(1) : input;

    setFeedbackMessage(capitalizedText);
    setCharCount(capitalizedText.length);
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
            {FeedbackCategoryIcons[type]}
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

      {!confirmable && (
        <div className="flex gap-2 items-center italic bg-(--hover-color) py-1 px-2 rounded mt-2">
          <span className="material-symbols-outlined text-5xl! select-none">
            mail
          </span>
          <div>
            <p className="text-sm select-none">
              {t("modal.feedback.via_email")}
            </p>
            <a
              href={`mailto:${email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-(--primary-color)"
            >
              {email}
            </a>
          </div>
        </div>
      )}
    </ConfirmDialog>
  );
};

export default FeedbackModal;
