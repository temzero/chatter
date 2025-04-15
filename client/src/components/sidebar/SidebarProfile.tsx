import { useSidebar } from "@/contexts/SidebarContext";

const SidebarProfile: React.FC = () => {
    const { setSidebar } = useSidebar();

  return (
    <aside className="w-[var(--sidebar-width)] border-r-2 h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)] z-50">
        {/* Header */}
        <header className="flex w-full justify-between p-2 items-center min-h-[var(--header-height)] custom-border-b">
            <div className="flex items-center gap-2">
                <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80"
                 onClick={() => setSidebar('more')}>arrow_back</i>
                <h1 className="text-xl">My Profile</h1>
            </div>
            <div className="flex items-center gap-2">
                <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80">edit</i>
                <a href="{% url 'account_logout' %}" className="material-symbols-outlined cursor-pointer text-red-400">logout</a>
            </div>
        </header>
    
        {/* User Info */}
        <div className="overflow-y-auto h-screen">
            <div className="flex flex-col items-center p-4 gap-2 w-full">
                <a className="h-36 w-36 flex items-center justify-center rounded-full custom-border">
                    <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                </a>
        
                <h1 className="text-xl font-semibold">User Full Name</h1>
        
                <div className="w-full flex flex-col rounded font-light py-2 my-2 custom-border-t custom-border-b">
                    <a className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined">call</i>
                        <h1 className='text-xl'>0123456789</h1>
                    </a>
                
                    <a className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined text">mail</i>
                        <h1 className='text-xl'>user@email.com</h1>
                    </a>
                
                    <a className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined">cake</i>
                        <h1 className='text-xl'>28/04/2000</h1>
                    </a>
                </div>
            </div>
        
            <div className='flex justify-center items-center cursor-pointer opacity-50 hover:opacity-80'>
                <i className="material-symbols-outlined">more_horiz</i>
            </div>
        </div>
    </aside>
  )
}

export default SidebarProfile;

