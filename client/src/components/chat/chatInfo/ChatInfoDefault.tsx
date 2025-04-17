import React, {useState} from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import { AnimatePresence, motion } from 'framer-motion';
import image1 from '@/assets/image/image1.jpg';
import image2 from '@/assets/image/image2.jpg';
import image3 from '@/assets/image/image3.jpg';

const mediaData = {
    photos: [image1, image2, image3,],
    videos: [],
    voice: [],
    files: [],
};

const ChatInfoView: React.FC = () => {
    const {activeChat} = useChat();
    const { setChatInfoMode, isChatInfoVisible } = useChatInfo();
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 500);
    };

    return (
        <aside className="relative w-full h-full overflow-hidden flex flex-col">
            <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
                <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
                    <i className="material-symbols-outlined">notifications</i>
                </a>
                <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
                    <i className="material-symbols-outlined">search</i>
                </a>
                <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
                    <i className="material-symbols-outlined rotate-90">block</i>
                </a>
                <a 
                    className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100"
                    onClick={() => setChatInfoMode('edit')}
                >
                    <i className="material-symbols-outlined">edit</i>
                </a>
            </header>
            
            <div className='overflow-x-hidden overflow-y-auto h-screen'>

                <div className="flex flex-col justify-center items-center p-4 gap-2 w-full pb-[70px] ">
                    <div className="relative">
                        <div className="h-32 w-32 flex items-center justify-center rounded-full overflow-hidden custom-border cursor-pointer">
                            {activeChat?.avatar ? (
                                <img 
                                src={activeChat.avatar} 
                                alt={activeChat.name}
                                className="h-full w-full object-cover"
                                />
                            ) : (
                                <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                            )}
                        </div>

                        <a className="absolute bottom-1 right-1 flex items-center rounded-full cursor-pointer opacity-40 hover:opacity-80">
                            <i className="material-symbols-outlined">favorite</i>
                        </a>
                    </div>
            
                    <h1 className="text-xl font-semibold">{activeChat?.name || "Full Name"}</h1>
            
                    <div className="w-full flex flex-col items-center p-1 rounded font-light">
                        {/* Phone */}
                        <div 
                            className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard(activeChat?.phone || "0123456789", 'phone')}
                        >
                            <i className="material-symbols-outlined">call</i>
                            {copied === 'phone' ? 'Copied!' : (activeChat?.phone || "0123456789")}
                        </div>
                        
                        {/* Email */}
                        <div 
                            className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard(activeChat?.email || "user@email.com", 'email')}
                        >
                            <i className="material-symbols-outlined">mail</i>
                            {copied === 'email' ? 'Copied!' : (activeChat?.email || "user@email.com")}
                        </div>
                        
                        {/* Birthday */}
                        <div 
                            className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]"
                            onClick={() => copyToClipboard(activeChat?.birthday || "dd/mm/yyyy", 'birthday')}
                        >
                            <i className="material-symbols-outlined">cake</i>
                            {copied === 'birthday' ? 'Copied!' : (activeChat?.birthday || "dd/mm/yyyy")}
                        </div>
                    </div>
                    
                    <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
                        {activeChat?.bio || ""}
                    </p>
                    
                    <AnimatePresence>
                    {isChatInfoVisible &&
                        <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="flex flex-col gap-2 w-full mt-4 min-w-[240px]"
                        >
                        <div className="w-full space-y-2 px-3 py-2 custom-border rounded">
                            <div>
                                <h1 className="text-xs font-light">Groups</h1>
                                <div className="flex gap-1">
                                    <a href="#" className="hover:underline">Work,</a>
                                    <a href="#" className="hover:underline">Gamings</a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col custom-border rounded w-full">
                            <div className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]" onClick={() => setChatInfoMode('saved')}>
                                <div className="flex gap-2">
                                    <a className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                                        <i className="material-symbols-outlined">bookmark</i>
                                    </a>
                                    <h1>Saved Messages</h1>
                                </div>
                                <p className='opacity-60'>12</p>
                            </div>

                            <div className="custom-border-b"></div>

                            <div className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]" onClick={() => setChatInfoMode('media')}>
                                <div className="flex gap-2">
                                    <a className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                                        <i className="material-symbols-outlined">attach_file</i>
                                    </a>
                                    <h1>Media & Files</h1>
                                </div>
                                <p className='opacity-60'>23</p>
                            </div>
                        </div>
                    </motion.div>
                    }
                    </AnimatePresence>
                </div>

                <div className='flex flex-col justify-center items-center cursor-pointer border-2 border-b-0 border-[var(--border-color)] rounded p-1 shadow-4xl absolute -bottom-[100px] hover:-bottom-[70px] transition-all duration-300 ease-in-out backdrop-blur-[12px]'
                    onClick={() => setChatInfoMode('media')}>
                    <i className="material-symbols-outlined opacity-70">keyboard_control_key</i>
                    <h1 className='-mt-1 mb-2'>Media & Files</h1>
                    <div className="grid grid-cols-3">
                    {mediaData.photos.map((image, index) => (
                        <div key={index} className="overflow-hidden aspect-square">
                            <img
                                className="w-full h-full custom-border object-cover"
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                            />
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ChatInfoView;
