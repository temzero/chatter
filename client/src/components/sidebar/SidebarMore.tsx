import { useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import ThemeSwitcher from "../ui/ThemeSwitcher";

const SidebarMore: React.FC = () => {
  const { setSidebar, isCompact, toggleCompact } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault();
        toggleCompact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCompact]);  

  const sidebarButtons = [
    {
      icon: 'bookmark',
      text: 'Saved Messages',
      onClick: null
    },
    {
      icon: 'add',
      text: 'New Chat',
      onClick: () => setSidebar('newChat')
    },
    {
      icon: 'search',
      text: 'Search',
      onClick: () => setSidebar('search')
    },
    { type: 'divider' }, // This will render the border divider
    {
      icon: 'call',
      text: 'Call',
      onClick: null
    },
    {
      icon: 'contacts',
      text: 'Contacts',
      onClick: null
    },
    { type: 'divider' }, // Another divider
    {
      icon: 'folder',
      text: 'Folder',
      onClick: null
    },
    {
      icon: 'lock',
      text: 'Private',
      onClick: null
    },
    {
      icon: 'block',
      text: 'Blocked',
      onClick: null
    },
  ];

  return (
    <aside className={`relative h-full flex flex-col justify-between transition-all duration-300 ease-in-out
        ${isCompact ? 'w-[var(--sidebar-width-small)]' : 'w-[var(--sidebar-width)]'}`}
    >
        {/* Header */}
        <header className="flex w-full justify-between p-2 items-center min-h-[var(--header-height)] custom-border-b">
            <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => setSidebar('default')}>arrow_back</i>

            <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80 ml-auto"
             onClick={() => setSidebar('default')}>close</i>

        </header>

        {/* User Info */}
        <div className="flex items-center p-4 gap-4 w-full custom-border-b cursor-pointer hover:bg-[var(--hover-color)]" onClick={() => setSidebar('profile')}>
            <a className="h-16 w-16 min-w-16 flex items-center justify-center rounded-full custom-border overflow-hidden">
                <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
            </a>
            {isCompact ||
            <div className="flex flex-col font-light min-w-60">
                <h1 className="font-semibold rounded hover:opacity-80">User Full Name</h1>
                <a className="rounded hover:opacity-80">0123456789</a>
            </div>
            }
        </div>
        
        <div className="overflow-x-hidden overflow-y-auto">
          {sidebarButtons.map((button, index) => (
              button.type === 'divider' ? (
                  <div key={`divider-${index}`} className="border-b-[6px] custom-border-b"></div>
              ) : (
                  <div 
                  key={button.text} 
                      className={`sidebar-button ${isCompact ? 'justify-center' : ''}`}
                  onClick={button.onClick || undefined}
                  >
                  <div className="flex items-center justify-center h-10 w-10">
                      <i className="material-symbols-outlined text-3xl">{button.icon}</i>
                  </div>
                  {isCompact || <p className="whitespace-nowrap text-ellipsis">{button.text}</p>}
                  </div>
              )
          ))}
        </div>


        <div className={`w-full flex custom-border-t backdrop-blur-[20px] shadow mt-auto ${isCompact ? 'justify-center' : 'justify-between'}`} >
          <div className={`flex items-center cursor-pointer hover:bg-[var(--hover-color)] rounded w-full p-1 px-4 ${isCompact ? 'justify-center' : 'gap-3'}`} onClick={() => setSidebar('settings')}>
            <div className="flex items-center justify-center h-10 w-10">
              <i className="material-symbols-outlined text-3xl">settings</i>
            </div>
            {!isCompact && <p className="whitespace-nowrap text-ellipsis">Settings</p>}
          </div>

          {!isCompact && 
          <div className=" flex items-center justify-center px-2">
            <ThemeSwitcher/>
          </div>
          }
        </div>
    </aside>
  )
}

export default SidebarMore;

