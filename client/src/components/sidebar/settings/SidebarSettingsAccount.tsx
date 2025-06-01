import { useCurrentUser } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SidebarLayout from "@/pages/SidebarLayout";

const SidebarSettingsAccount: React.FC = () => {
  const currentUser = useCurrentUser();
  const { setSidebar } = useSidebarStore();

  const accountSettingsItems = [
    {
      title: "Change Username",
      subtitle: `@${currentUser?.username || "username"}`,
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT), // Replace with a dedicated mode if needed (e.g., SETTINGS_ACCOUNT_USERNAME)
    },
    {
      title: "Change Email",
      subtitle: currentUser?.email || "email@example.com",
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT), // Replace with SETTINGS_ACCOUNT_EMAIL if needed
    },
    {
      title: "Change Phone Number",
      subtitle: currentUser?.phoneNumber || "+1234567890",
      onClick: () => setSidebar(SidebarMode.SETTINGS_ACCOUNT), // Replace with SETTINGS_ACCOUNT_PHONE if needed
    },
    {
      title: "Privacy & Security",
      onClick: () => setSidebar(SidebarMode.SETTINGS_PRIVACY), // Assuming this exists in your enum
    },
    {
      title: "Change Password",
      onClick: () => setSidebar(SidebarMode.SETTINGS_PASSWORD), // Replace with a dedicated mode if needed
    },
  ];

  return (
    <SidebarLayout
      title="Account Settings"
      backLocation={SidebarMode.SETTINGS}
    >
      {accountSettingsItems.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
          onClick={item.onClick}
        >
          <h1>{item.title}</h1>
          {item.subtitle && <h1 className="opacity-60">{item.subtitle}</h1>}
        </div>
      ))}
    </SidebarLayout>
  );
};

export default SidebarSettingsAccount;
