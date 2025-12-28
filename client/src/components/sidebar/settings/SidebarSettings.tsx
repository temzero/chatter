import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useThemeOption } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n/languages";

const SidebarSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const themeOption = useThemeOption();
  const setSidebar = getSetSidebar();
  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language)?.label ||
    i18n.language;

  const settingsItems = [
    {
      icon: "person",
      title: t("settings.account"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT),
    },
    {
      icon: "lock",
      title: t("settings.privacy_security"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_PRIVACY),
      isDisabled: true,
    },
    {
      icon: "visibility",
      title: t("settings.display"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_DISPLAY),
      isDisabled: true,
    },
    {
      icon: "keyboard",
      title: t("settings.keyboard"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_KEYBOARD),
      isDisabled: true,
    },
    {
      icon: "message",
      title: t("settings.messages"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_MESSAGES),
      isDisabled: true,
    },
    {
      icon: "folder",
      title: t("settings.folders"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_FOLDERS),
      isDisabled: true,
    },
    {
      icon: "notifications",
      title: t("settings.notifications"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_NOTIFICATIONS),
      isDisabled: true,
    },
    {
      icon: "database",
      title: t("settings.data_storage"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_DATA_STORAGE),
      isDisabled: true,
    },
    {
      icon: "contrast",
      title: t("settings.theme"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_THEME),
      value: t(`settings.theme_options.${themeOption}`),
    },
    {
      icon: "wallpaper",
      title: t("settings.wallpaper"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_WALLPAPER),
    },
    {
      icon: "translate",
      title: t("settings.language"),
      onClick: () => setSidebar(SidebarMode.SETTINGS_LANGUAGE),
      value: currentLanguage,
    },
  ];

  // return (
  //   <SidebarLayout
  //     title={t("sidebar.settings")}
  //     backLocation={SidebarMode.MORE}
  //   >
  //     {settingsItems.map((item, index) => (
  //       <div key={index} className="settings-item" onClick={item.onClick}>
  //         <div className="flex gap-4 items-center">
  //           <i className="material-symbols-outlined">{item.icon}</i>
  //           <h1>{item.title}</h1>
  //         </div>
  //         {item.value && (
  //           <span className="opacity-60 ml-auto">
  //             {item.value.charAt(0).toUpperCase() +
  //               item.value.slice(1).toLowerCase()}
  //           </span>
  //         )}
  //       </div>
  //     ))}
  //   </SidebarLayout>
  // );

  return (
    <SidebarLayout
      title={t("sidebar.settings")}
      backLocation={SidebarMode.MORE}
    >
      {settingsItems.map((item, index) => (
        <div
          key={index}
          className={`settings-item ${item.isDisabled ? "disabled" : ""}`}
          onClick={!item.isDisabled ? item.onClick : undefined}
        >
          <div className="flex gap-4 items-center">
            <i className="material-symbols-outlined">{item.icon}</i>
            <h1>{item.title}</h1>
          </div>
          {item.value && (
            <span className="opacity-60 ml-auto">
              {item.value.charAt(0).toUpperCase() +
                item.value.slice(1).toLowerCase()}
            </span>
          )}
        </div>
      ))}
    </SidebarLayout>
  );
};

export default SidebarSettings;
