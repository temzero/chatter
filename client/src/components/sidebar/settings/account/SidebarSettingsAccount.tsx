import { getCurrentUser } from "@/stores/authStore";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";

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
      title: currentUser?.email ? t("account_settings.change_email.title") : t("account_settings.change_email.add_email"),
      subtitle: currentUser?.email ? currentUser.email : "",
      onClick: () => setSidebar(SidebarMode.SETTINGS_EMAIL),
    },
    // {
    //   title:  currentUser?.phoneNumber ? t("account_settings.change_phone.title") : t("account_settings.change_phone.add_phone"),
    //   subtitle: currentUser?.phoneNumber ? currentUser.phoneNumber : "",
    //   onClick: () => setSidebar(SidebarMode.SETTINGS_PHONE),
    // },
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
