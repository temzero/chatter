import { useSidebar } from "@/contexts/SidebarContext";
import ThemeSelector from "@/components/ui/ThemeSelector";

const SidebarSettings: React.FC = () => {
  const { setSidebar } = useSidebar();

  return (
    <aside
      id="settings-sidebar"
      className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Header */}
      <header className="flex w-full items-center h-[var(--header-height)] custom-border-b">
        <i
          className="material-symbols-outlined nav-btn"
          onClick={() => setSidebar("more")}
        >
          arrow_back
        </i>
        <h1 className="text-xl font-semibold">Settings</h1>
        <i
          className="material-symbols-outlined nav-btn ml-auto"
          onClick={() => setSidebar("default")}
        >
          close
        </i>
      </header>

      {/* Account */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">person</i>
        <h1>Account</h1>
      </div>

      {/* Theme (again?) */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">contrast</i>
        <h1>Theme</h1>
      </div>

      {/* Display */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">visibility</i>
        <h1>Display</h1>
      </div>

      {/* Keyboard */}
        <div
            className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
            onClick={() => setSidebar("settingsAccount")}
        >
            <i className="material-symbols-outlined">keyboard</i>
            <h1>Keyboard</h1>
        </div>

      {/* Message */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">message</i>
        <h1>Message</h1>
      </div>

      {/* Chat Folders */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">folder</i>
        <h1>Chat Folders</h1>
      </div>

      {/* Notifications */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">notifications</i>
        <h1>Notifications</h1>
      </div>

      {/* Data & Storage */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">database</i>
        <h1>Data & Storage</h1>
      </div>

      {/* Language */}
      <div
        className="flex gap-4 items-center p-4 custom-border-b h-14 cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">translate</i>
        <h1>Language</h1>
        <span className="opacity-60 ml-auto">English</span>
      </div>
    </aside>
  );
};

export default SidebarSettings;
