  import { useSidebarStore } from "@/stores/sidebarStore";
  import { SidebarMode } from "@/types/enums/sidebarMode";
  import SidebarLayout from "@/pages/SidebarLayout";
  import { useThemeStore } from "@/stores/themeStore";
  import { useTranslation } from "react-i18next";
  import { languages } from "@/i18n/languages";

  const SidebarSettings: React.FC = () => {
    const { setSidebar } = useSidebarStore();
    const themeOption = useThemeStore((state) => state.themeOption);
    const { t, i18n } = useTranslation();
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
      },
      {
        icon: "contrast",
        title: t("settings.theme"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_THEME),
        value: t(`settings.theme_options.${themeOption}`),
      },
      {
        icon: "visibility",
        title: t("settings.display"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_DISPLAY),
      },
      {
        icon: "keyboard",
        title: t("settings.keyboard"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_KEYBOARD),
      },
      {
        icon: "message",
        title: t("settings.messages"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_MESSAGES),
      },
      {
        icon: "folder",
        title: t("settings.folders"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_FOLDERS),
      },
      {
        icon: "notifications",
        title: t("settings.notifications"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_NOTIFICATIONS),
      },
      {
        icon: "database",
        title: t("settings.data_storage"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_DATA_STORAGE),
      },
      {
        icon: "translate",
        title: t("settings.language"),
        onClick: () => setSidebar(SidebarMode.SETTINGS_LANGUAGE),
        value: currentLanguage,
      },
    ];

    return (
      <SidebarLayout
        title={t("sidebar.settings")}
        backLocation={SidebarMode.MORE}
      >
        {settingsItems.map((item, index) => (
          <div key={index} className="settings-item" onClick={item.onClick}>
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
