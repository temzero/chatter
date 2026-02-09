import { useTranslation } from "react-i18next";

export const DEFAULT_APP_NAME = "Chatter";

export const useAppName = () => {
  const { t } = useTranslation();
//   return DEFAULT_APP_NAME;
  return t("app_name", { defaultValue: DEFAULT_APP_NAME });
};
