import { getCurrentUser } from "@/stores/authStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useTranslation } from "react-i18next";

const SidebarSettingsAccount: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const setSidebar = getSetSidebar();

  const accountSettingsItems = [
    {
      title: t("account_settings.change_username.title"),
      subtitle: currentUser?.username ? `@${currentUser.username}` : "",
      onClick: () => setSidebar(SidebarMode.SETTINGS_USERNAME),
    },
    {
      title: t("account_settings.change_email.title"),
      subtitle: currentUser?.email ? currentUser.email : "",
      onClick: () => setSidebar(SidebarMode.SETTINGS_EMAIL),
    },
    {
      title: t("account_settings.change_phone.title"),
      subtitle: currentUser?.phoneNumber ? currentUser.phoneNumber : "",
      onClick: () => setSidebar(SidebarMode.SETTINGS_PHONE),
    },
    {
      title: t("account_settings.change_password.title"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_PASSWORD),
    },
  ];

  return (
    <SidebarLayout
      title={t("settings.account")}
      backLocation={SidebarMode.SETTINGS}
    >
      {accountSettingsItems.map((item, index) => (
        <div key={index} className="settings-item" onClick={item.onClick}>
          <div>
            <h1>{item.title}</h1>
            {item.subtitle && <h1 className="opacity-60">{item.subtitle}</h1>}
          </div>
        </div>
      ))}
    </SidebarLayout>
  );
};

export default SidebarSettingsAccount;
