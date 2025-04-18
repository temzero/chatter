import { useGlobalContext } from "@/contexts/GlobalContext";
import { useSidebar } from "@/contexts/SidebarContext";

const SidebarSettingsAccount: React.FC = () => {
    const {myProfile} = useGlobalContext();
    const { setSidebar } = useSidebar();

  return (
    <aside id="settings-sidebar" className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="flex w-full items-center h-[var(--header-height)] custom-border-b">
            <i className="material-symbols-outlined nav-btn"
             onClick={() => setSidebar('settings')}>arrow_back</i>
            <h1 className="text-xl font-semibold">Account Settings</h1>
            <i className="material-symbols-outlined nav-btn ml-auto"
             onClick={() => setSidebar('default')}>close</i>
        </header>

        <div className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar('accountSettings')}>
            <h1>Change Username</h1>
            <h1 className="opacity-60">@{myProfile?.username}</h1>
        </div>
        <div className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar('accountSettings')}>
            <h1>Change Email</h1>
            <h1 className="opacity-60">{myProfile?.email}</h1>
        </div>
        <div className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar('accountSettings')}>
            <h1>Change Phone Number</h1>
            <h1 className="opacity-60">{myProfile?.phone}</h1>
        </div>
        <div className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar('accountSettings')}>
            <h1>Privacy & Security</h1>
        </div>
        <div className="flex flex-col gap-1 justify-center p-4 custom-border-b h-20 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar('accountSettings')}>
            <h1>Change Password</h1>
        </div>

    </aside>
  )
}

export default SidebarSettingsAccount;

