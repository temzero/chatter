import { useSidebar } from "@/contexts/SidebarContext";
import { useGlobalContext } from '@/contexts/GlobalContext';
import ContactInfoItem from '../ui/contactInfoItem';

const SidebarProfile: React.FC = () => {
    const { currentUser } = useGlobalContext();
    const { setSidebar } = useSidebar();

    return (
        <aside className="relative w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
            {/* Header */}
            <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
                <div className="flex items-center">
                    <i className="material-symbols-outlined nav-btn" onClick={() => setSidebar('more')}>
                        arrow_back
                    </i>
                    <h1 className="text-xl font-semibold">My Profile</h1>
                </div>
                <i className="material-symbols-outlined nav-btn" onClick={() => setSidebar('profileEdit')}>edit</i>
            </header>

            {/* User Info */}
            <div className="overflow-y-auto h-screen">
                <div className="flex flex-col items-center p-4 gap-2 w-full">
                    <a className="h-36 w-36 flex items-center justify-center rounded-full custom-border">
                        {currentUser?.avatar ? (
                            <img className="w-full h-full rounded-full object-cover" src={currentUser.avatar} alt="User Avatar" />
                        ) : (
                            <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                        )}
                    </a>

                    <h1 className="text-xl font-semibold">
                        {currentUser?.firstName} {currentUser?.lastName}
                    </h1>

                    <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
                        {currentUser?.bio || ""}
                    </p>

                    <div className="w-full flex flex-col rounded font-light py-2 my-2 custom-border-t custom-border-b">
                        <div>
                            <ContactInfoItem
                                icon="alternate_email"
                                value={currentUser?.username}
                                copyType="username"
                                defaultText="No username"
                            />
                            
                            <ContactInfoItem
                                icon="call"
                                value={currentUser?.phone}
                                copyType="phone"
                            />
                            
                            <ContactInfoItem
                                icon="mail"
                                value={currentUser?.email}
                                copyType="email"
                            />
                            
                            <ContactInfoItem
                                icon="cake"
                                value={currentUser?.birthday}
                                copyType="birthday"
                            />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 flex items-center justify-center custom-border-t hover:bg-[var(--hover-color)] gap-2 p-2 cursor-pointer w-full text-red-400">
                    <h1 className="text-xl">Logout</h1>
                    <a className="material-symbols-outlined cursor-pointer">logout</a>
                </div>
            </div>
        </aside>
    );
};

export default SidebarProfile;
