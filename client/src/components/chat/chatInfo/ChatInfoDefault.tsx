import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import { AnimatePresence, motion } from 'framer-motion';
import ContactInfoItem from '@/components/ui/contactInfoItem';
import { ChatAvatar } from '@/components/ui/ChatAvatar';
import RenderMedia from '@/components/ui/RenderMedia';


const ChatInfoDefault: React.FC = () => {
    const {activeChat, activeMedia} = useChat();
    const { setChatInfoMode, isChatInfoVisible } = useChatInfo();

    if (!activeChat) return null;

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
                <div className="flex flex-col justify-center items-center p-4 gap-2 w-full pb-[70px]">
                    <div className="relative">
                        <ChatAvatar chat={activeChat} type='info' />

                        <a className="absolute bottom-0 right-0 flex items-center rounded-full cursor-pointer opacity-40 hover:opacity-80">
                            <i className="material-symbols-outlined">favorite</i>
                        </a>
                    </div>
            
                    <h1 className="text-xl font-semibold">{activeChat.name}</h1>

                    {(activeChat.bio || activeChat.description) && (
                        <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
                            {activeChat.bio || activeChat.description}
                        </p>
                    )}

                    <AnimatePresence>
                        {isChatInfoVisible && (
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className="flex flex-col gap-2 w-full mt-4 min-w-[240px]"
                            >
                                {activeChat?.type === 'private' && (
                                    <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
                                         <ContactInfoItem
                                                icon="alternate_email"
                                                value={activeChat?.username}
                                                copyType="username"
                                                defaultText="No username"
                                            />
                                            
                                            <ContactInfoItem
                                                icon="call"
                                                value={activeChat?.phone}
                                                copyType="phone"
                                            />
                                            
                                            <ContactInfoItem
                                                icon="mail"
                                                value={activeChat?.email}
                                                copyType="email"
                                            />
                                            
                                            <ContactInfoItem
                                                icon="cake"
                                                value={activeChat?.birthday}
                                                copyType="birthday"
                                            />
                                    </div>
                                )}

                                <div className="flex flex-col custom-border rounded w-full">
                                    <div className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]" onClick={() => setChatInfoMode('saved')}>
                                        <div className="flex gap-2">
                                            <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                                                <i className="material-symbols-outlined">bookmark</i>
                                            </span>
                                            <h1>Saved Messages</h1>
                                        </div>
                                        <p className='opacity-60'>12</p>
                                    </div>

                                    <div className="custom-border-b"></div>

                                    <div className="flex p-2 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]" onClick={() => setChatInfoMode('media')}>
                                        <div className="flex gap-2">
                                            <span className="flex flex-col justify-center items-center cursor-pointer opacity-60 hover:opacity-100">
                                                <i className="material-symbols-outlined">attach_file</i>
                                            </span>
                                            <h1>Media & Files</h1>
                                        </div>
                                        <p className='opacity-60'>23</p>
                                    </div>
                                </div>

                                {activeChat.members && (
                                    <div className="flex flex-col rounded overflow-hidden custom-border">
                                        {activeChat.members.map((member, index) => (
                                            <div key={`${member}-${index}`} className="flex items-center gap-2 hover:bg-[var(--hover-color)] p-2 cursor-pointer">
                                                <i className="material-symbols-outlined flex items-center justify-center w-8 h-8 text-3xl opacity-40 rounded-full custom-border">mood</i>
                                                <h1>{member}</h1>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className='flex flex-col justify-center items-center cursor-pointer border-2 border-b-0 border-[var(--hover-color)] rounded p-1 shadow-4xl absolute -bottom-[100px] hover:-bottom-[70px] transition-all duration-300 ease-in-out backdrop-blur-[12px]'
                    onClick={() => setChatInfoMode('media')}>
                    <i className="material-symbols-outlined opacity-70">keyboard_control_key</i>
                    <h1 className='-mt-1 mb-2'>Media & Files</h1>
                    <div className="grid grid-cols-3">

                    {activeMedia.slice(0, 3).map((media, index) => (
                        <div key={`${media.messageId}-${index}`} className="overflow-hidden aspect-square">
                            <RenderMedia
                                media={media}
                                className="hover:none custom-border"
                            />
                        </div>
                    ))}
                    
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ChatInfoDefault;