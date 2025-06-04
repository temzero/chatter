import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SidebarLayout from "@/pages/SidebarLayout";
import { useThemeStore } from "@/stores/themeStore";

const SidebarSettings: React.FC = () => {
  const { setSidebar } = useSidebarStore();
  const theme = useThemeStore((state) => state.theme);

  const settingsItems = [
    {
      icon: "person",
      title: "Account",
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT),
    },
    {
      icon: "lock",
      title: "Privacy & Security",
      onClick: () => setSidebar(SidebarMode.SETTINGS_PRIVACY),
    },
    {
      icon: "contrast",
      title: `Theme`,
      onClick: () => setSidebar(SidebarMode.SETTINGS_THEME),
      value: theme,
    },
    {
      icon: "visibility",
      title: "Display",
      onClick: () => setSidebar(SidebarMode.SETTINGS_DISPLAY),
    },
    {
      icon: "keyboard",
      title: "Keyboard",
      onClick: () => setSidebar(SidebarMode.SETTINGS_KEYBOARD),
    },
    {
      icon: "message",
      title: "Messages",
      onClick: () => setSidebar(SidebarMode.SETTINGS_MESSAGES),
    },
    {
      icon: "folder",
      title: "Chat Folders",
      onClick: () => setSidebar(SidebarMode.SETTINGS_FOLDERS),
    },
    {
      icon: "notifications",
      title: "Notifications",
      onClick: () => setSidebar(SidebarMode.SETTINGS_NOTIFICATIONS),
    },
    {
      icon: "database",
      title: "Data & Storage",
      onClick: () => setSidebar(SidebarMode.SETTINGS_DATA_STORAGE),
    },
    {
      icon: "translate",
      title: "Language",
      onClick: () => setSidebar(SidebarMode.SETTINGS_LANGUAGE),
      value: "English",
    },
  ];

  return (
    <SidebarLayout title="Settings" backLocation={SidebarMode.MORE}>
      {settingsItems.map((item, index) => (
        <div
          key={index}
          className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
          onClick={item.onClick}
        >
          <i className="material-symbols-outlined">{item.icon}</i>
          <h1>{item.title}</h1>
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
