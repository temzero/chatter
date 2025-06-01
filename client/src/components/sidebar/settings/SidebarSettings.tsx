import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SidebarLayout from "@/pages/SidebarLayout";

const SidebarSettings: React.FC = () => {
  const { setSidebar } = useSidebarStore();

  const settingsItems = [
    {
      icon: "person",
      text: "Account",
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT),
    },
    {
      icon: "contrast",
      text: "Theme",
      onClick: () => setSidebar(SidebarMode.SETTINGS_THEME),
    },
    {
      icon: "visibility",
      text: "Display",
      onClick: () => setSidebar(SidebarMode.SETTINGS_DISPLAY),
    },
    {
      icon: "keyboard",
      text: "Keyboard",
      onClick: () => setSidebar(SidebarMode.SETTINGS_KEYBOARD),
    },
    {
      icon: "message",
      text: "Messages",
      onClick: () => setSidebar(SidebarMode.SETTINGS_MESSAGES),
    },
    {
      icon: "folder",
      text: "Chat Folders",
      onClick: () => setSidebar(SidebarMode.SETTINGS_FOLDERS),
    },
    {
      icon: "notifications",
      text: "Notifications",
      onClick: () => setSidebar(SidebarMode.SETTINGS_NOTIFICATIONS),
    },
    {
      icon: "database",
      text: "Data & Storage",
      onClick: () => setSidebar(SidebarMode.SETTINGS_DATA_STORAGE),
    },
    {
      icon: "translate",
      text: "Language",
      onClick: () => setSidebar(SidebarMode.SETTINGS_LANGUAGE),
      extra: <span className="opacity-60 ml-auto">English</span>,
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
          <h1>{item.text}</h1>
          {item.extra && item.extra}
        </div>
      ))}
    </SidebarLayout>
  );
};

export default SidebarSettings;
