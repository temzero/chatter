import { useSidebar } from "@/contexts/SidebarContext";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const SidebarSettings: React.FC = () => {
    const { setSidebar } = useSidebar();

  return (
    <aside id="settings-sidebar" className="w-[var(--sidebar-width)] border-r-2 h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)] z-50">
        {/* Header */}
        <header className="flex w-full p-2 gap-2 items-center h-[var(--header-height)] custom-border-b">
            <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80"
             onClick={() => setSidebar('more')}>arrow_back</i>
            <h1 className="text-xl font-semibold">Settings</h1>
        </header>

        {/* Settings */}
        <div className="w-full flex justify-between p-4 custom-border-b">
            <h1>Theme</h1>
            <ThemeSwitcher />
        </div>

        <div className="w-full p-4 custom-border-b">
            <div className="flex justify-between ">
                <h1>Font Size</h1>
                <h1>16</h1>
            </div>
            <div className="w-full border-b-2 py-2"></div>
        </div>

        <div className="w-full p-4 custom-border-b">
            <h1>Time Format</h1>
            <div className="flex justify-between ">
            </div>
        </div>

        <div className="w-full p-4 custom-border-b">
            <h1>Keyboard</h1>
            <div className="flex justify-between ">
            </div>
        </div>
    </aside>
  )
}

export default SidebarSettings;

