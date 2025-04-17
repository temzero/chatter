import { useState } from 'react';
import { useSidebar } from "@/contexts/SidebarContext";

const SidebarProfile: React.FC = () => {
    const { setSidebar } = useSidebar();
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 500);
    };

    return (
        <aside className="relative w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
            {/* Header */}
            <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
                <div className="flex items-center gap-2">
                    <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80"
                     onClick={() => setSidebar('more')}>arrow_back</i>
                    <h1 className="text-xl font-semibold">My Profile</h1>
                </div>
                <i className="material-symbols-outlined cursor-pointer opacity-70 hover:opacity-80 mr-1">edit</i>

            </header>
        
            {/* User Info */}
            <div className="overflow-y-auto h-screen">
                <div className="flex flex-col items-center p-4 gap-2 w-full">
                    <a className="h-36 w-36 flex items-center justify-center rounded-full custom-border">
                        <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                    </a>
            
                    <h1 className="text-xl font-semibold">User Full Name</h1>
            
                    <div className="w-full flex flex-col rounded font-light py-2 my-2 custom-border-t custom-border-b">
                        <div 
                            className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard("0123456789", 'phone')}
                        >
                            <i className="material-symbols-outlined">call</i>
                            <h1 className='text-xl'>{copied === 'phone' ? 'Copied!' : '0123456789'}</h1>
                        </div>
                    
                        <div 
                            className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard("user@email.com", 'email')}
                        >
                            <i className="material-symbols-outlined">mail</i>
                            <h1 className='text-xl'>{copied === 'email' ? 'Copied!' : 'user@email.com'}</h1>
                        </div>
                    
                        <div 
                            className="flex justify-between gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard("28/04/2000", 'birthday')}
                        >
                            <i className="material-symbols-outlined">cake</i>
                            <h1 className='text-xl'>{copied === 'birthday' ? 'Copied!' : '28/04/2000'}</h1>
                        </div>
                    </div>
                </div>
            
                <div className="absolute bottom-0 flex items-center justify-center custom-border-t hover:bg-[var(--hover-color)] gap-2 p-2 cursor-pointer w-full text-red-400">
                    <h1 className='text-xl'>Logout</h1>
                    <a className="material-symbols-outlined cursor-pointer">logout</a>
                </div>
            </div>
        </aside>
    );
};

export default SidebarProfile;