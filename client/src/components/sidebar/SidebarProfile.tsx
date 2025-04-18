import { useState } from 'react';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { useSidebar } from "@/contexts/SidebarContext";

const SidebarProfile: React.FC = () => {
    const { myProfile, logout } = useGlobalContext();
    const { setSidebar } = useSidebar();
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        if (!text) return; // Don't copy if text is empty
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 500);
    };

    return (
        <aside className="relative w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
            {/* Header */}
            <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
                <div className="flex items-center">
                    <i className="material-symbols-outlined nav-btn"
                     onClick={() => setSidebar('more')}>arrow_back</i>
                    <h1 className="text-xl font-semibold">My Profile</h1>
                </div>
                <i className="material-symbols-outlined nav-btn" 
                   onClick={() => setSidebar('profileEdit')}>edit</i>
            </header>
        
            {/* User Info */}
            <div className="overflow-y-auto h-screen">
                <div className="flex flex-col items-center p-4 gap-2 w-full">
                    <div className="h-36 w-36 flex items-center justify-center rounded-full custom-border">
                        {myProfile?.avatar ? (
                            <img 
                                src={myProfile.avatar} 
                                alt="Profile" 
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                        )}
                    </div>
            
                    <h1 className="text-xl font-semibold">
                        {myProfile?.firstName} {myProfile?.lastName}
                    </h1>
                    {myProfile?.username && (
                        <h2 className="text-sm opacity-70 -mt-2">@{myProfile.username}</h2>
                    )}
                    {myProfile?.bio && (
                        <p className="text-center text-sm opacity-70 max-w-[80%]">{myProfile.bio}</p>
                    )}
            
                    <div className="w-full flex flex-col font-light my-2 custom-border-t custom-border-b">
                        <div 
                            className={`flex justify-between gap-2 rounded cursor-pointer p-2 ${myProfile?.phoneNumber ? 'hover:bg-[var(--hover-color)]' : 'opacity-50'}`}
                            onClick={() => myProfile?.phoneNumber && copyToClipboard(myProfile.phoneNumber, 'phoneNumber')}
                        >
                            <i className="material-symbols-outlined">call</i>
                            <h1 className='text-xl'>
                                {copied === 'phoneNumber' ? 'Copied!' : myProfile?.phoneNumber || 'No phoneNumber number'}
                            </h1>
                        </div>
                    
                        <div 
                            className={`flex justify-between gap-2 rounded cursor-pointer p-2 ${myProfile?.email ? 'hover:bg-[var(--hover-color)]' : 'opacity-50'}`}
                            onClick={() => myProfile?.email && copyToClipboard(myProfile.email, 'email')}
                        >
                            <i className="material-symbols-outlined">mail</i>
                            <h1 className='text-xl'>
                                {copied === 'email' ? 'Copied!' : myProfile?.email || 'No email'}
                            </h1>
                        </div>
                    
                        <div 
                            className={`flex justify-between gap-2 rounded cursor-pointer p-2 ${myProfile?.birthday ? 'hover:bg-[var(--hover-color)]' : 'opacity-50'}`}
                            onClick={() => myProfile?.birthday && copyToClipboard(myProfile.birthday, 'birthday')}
                        >
                            <i className="material-symbols-outlined">cake</i>
                            <h1 className='text-xl'>
                                {copied === 'birthday' ? 'Copied!' : myProfile?.birthday || 'No birthday'}
                            </h1>
                        </div>
                    </div>
                </div>
            
                <div className="absolute bottom-0 flex items-center justify-center custom-border-t hover:bg-[var(--hover-color)] gap-2 p-2 cursor-pointer w-full text-red-400"
                     onClick={logout}>
                    <h1 className='text-lg'>Logout</h1>
                    <i className="material-symbols-outlined cursor-pointer">logout</i>
                </div>
            </div>
        </aside>
    );
};

export default SidebarProfile;