// SidebarFeedback.tsx
import * as React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useTranslation } from "react-i18next";

const SidebarFeedback: React.FC = () => {
  const { t } = useTranslation();

  return <SidebarLayout title={t("common.messages.feedback")} padding>
    <form>
      <label>{t("common.messages.your_feedback")}</label>
      <textarea placeholder={t("common.messages.write_your_feedback_here") || ""} />
      <button type="submit">{t("common.actions.send_feedback")}</button>
    </form>
    <h1>You can sent feedback directly via this email: <span>chatter.official@gmail.com</span></h1>
  </SidebarLayout>;
};

export default SidebarFeedback;
