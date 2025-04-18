import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import { AnimatePresence, motion } from 'framer-motion';
import image1 from '@/assets/image/image1.jpg';
import image2 from '@/assets/image/image2.jpg';
import image3 from '@/assets/image/image3.jpg';

interface MediaData {
  photos: string[];
  videos: string[];
  voice: string[];
  files: string[];
}

const mediaData: MediaData = {
  photos: [image1, image2, image3],
  videos: [],
  voice: [],
  files: [],
};

const ChatInfoDefault: React.FC = () => {
  const { activeRoom } = useChat();
  const { setChatInfoMode, isChatInfoVisible } = useChatInfo();
  const [copied, setCopied] = useState<string>('');
  const [showMediaPreview, setShowMediaPreview] = useState(false);

  const copyToClipboard = async (text: string, type: string = '') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 500); // More reasonable timeout
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleMediaPreview = () => {
    setShowMediaPreview(!showMediaPreview);
    if (!showMediaPreview) {
      setChatInfoMode('media');
    }
  };

  if (!activeRoom) {
    return (
      <aside className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <p className="text-gray-500">Select a chat to view info</p>
      </aside>
    );
  }

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        <button className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined">notifications</i>
        </button>
        <button className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined">search</i>
        </button>
        <button className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
          <i className="material-symbols-outlined rotate-90">block</i>
        </button>
        <button 
          className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100"
          onClick={() => setChatInfoMode('edit')}
        >
          <i className="material-symbols-outlined">edit</i>
        </button>
      </header>
      
      <div className='overflow-x-hidden overflow-y-auto h-screen pb-[120px]'>
        <div className="flex flex-col justify-center items-center p-4 gap-2 w-full">
          <div className="relative">
            {activeRoom.type === 'private' ? (
              <div className="h-32 w-32 custom-border rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                {activeRoom.avatar ? (
                  <img 
                    src={activeRoom.avatar} 
                    alt={activeRoom.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <i className="material-symbols-outlined text-8xl opacity-40">mood</i>
                )}
              </div>
            ) : (
              <div className='h-32 w-32 custom-border grid grid-cols-2 grid-rows-2 overflow-hidden rounded-3xl cursor-pointer'>
                {[1, 2, 3, 4].map((i) => (
                  <i 
                    key={i} 
                    className="material-symbols-outlined text-6xl opacity-20 flex items-center justify-center border rounded-full"
                  >
                    mood
                  </i>
                ))}
              </div>
            )}

            <button className="absolute bottom-0 right-0 flex items-center rounded-full cursor-pointer opacity-40 hover:opacity-80">
              <i className="material-symbols-outlined">favorite</i>
            </button>
          </div>
    
          <h1 className="text-xl font-semibold">{activeRoom.name || "Chat"}</h1>
          <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis mb-4">
            {activeRoom.description || "No description"}
          </p>

          <AnimatePresence>
            {isChatInfoVisible && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex flex-col gap-2 w-full min-w-[240px]"
              >
                {activeRoom.type === 'private' && (
                  <>
                    <div className="w-full flex flex-col items-center rounded font-light custom-border overflow-hidden">
                      {/* Username */}
                      <div 
                        className="flex cursor-pointer p-3 hover:bg-[var(--hover-color)] w-full justify-between items-center"
                        onClick={() => copyToClipboard(activeRoom.username || "username", 'username')}
                      >
                        <div className="flex items-center gap-2">
                          <i className="material-symbols-outlined">alternate_email</i>
                          <span>Username</span>
                        </div>
                        <span>{copied === 'username' ? 'Copied!' : (activeRoom.username || "-")}</span>
                      </div>

                      {/* Phone */}
                      <div 
                        className="flex cursor-pointer p-3 hover:bg-[var(--hover-color)] w-full justify-between items-center"
                        onClick={() => copyToClipboard(activeRoom.phoneNumber || "", 'phoneNumber')}
                      >
                        <div className="flex items-center gap-2">
                          <i className="material-symbols-outlined">call</i>
                          <span>Phone</span>
                        </div>
                        <span>{copied === 'phoneNumber' ? 'Copied!' : (activeRoom.phoneNumber || "-")}</span>
                      </div>
                      
                      {/* Email */}
                      <div 
                        className="flex cursor-pointer p-3 hover:bg-[var(--hover-color)] w-full justify-between items-center"
                        onClick={() => copyToClipboard(activeRoom.email || "", 'email')}
                      >
                        <div className="flex items-center gap-2">
                          <i className="material-symbols-outlined">mail</i>
                          <span>Email</span>
                        </div>
                        <span>{copied === 'email' ? 'Copied!' : (activeRoom.email || "-")}</span>
                      </div>
                    </div>

                    <div className="w-full space-y-2 px-3 py-2 custom-border rounded">
                      <div>
                        <h1 className="text-xs font-light">Groups in common</h1>
                        <div className="flex gap-1">
                          <span className="hover:underline">Work</span>
                          <span className="hover:underline">Gaming</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex flex-col custom-border rounded w-full">
                  <button 
                    className="flex p-3 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
                    onClick={() => setChatInfoMode('saved')}
                  >
                    <div className="flex gap-2 items-center">
                      <i className="material-symbols-outlined opacity-60 hover:opacity-100">bookmark</i>
                      <span>Saved Messages</span>
                    </div>
                    <span className='opacity-60'>12</span>
                  </button>
                </div>

                {activeRoom.type !== 'private' && (
                  <div className="flex flex-col rounded overflow-hidden custom-border">
                    <h3 className="p-3 font-medium custom-border-b">Members ({activeRoom.members.length})</h3>
                    {activeRoom.members.slice(0, 5).map((member) => (
                      <div 
                        key={member} 
                        className="flex items-center gap-3 hover:bg-[var(--hover-color)] p-3 cursor-pointer"
                      >
                        <i className="material-symbols-outlined flex items-center justify-center w-8 h-8 text-3xl opacity-40 rounded-full custom-border">mood</i>
                        <span>{member}</span>
                      </div>
                    ))}
                    {activeRoom.members.length > 5 && (
                      <button className="p-3 text-sm opacity-70 hover:bg-[var(--hover-color)]">
                        View all {activeRoom.members.length} members
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        className={`fixed bottom-0 left-0 right-0 bg-[var(--bg-color)] custom-border-t p-3 cursor-pointer ${
          showMediaPreview ? 'h-[200px]' : 'h-[70px]'
        } transition-all duration-300 ease-in-out backdrop-blur-[12px]`}
        onClick={toggleMediaPreview}
        initial={false}
        animate={{ height: showMediaPreview ? 200 : 70 }}
      >
        <div className="flex flex-col items-center">
          <i className="material-symbols-outlined opacity-70">
            {showMediaPreview ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          </i>
          <h1 className="mb-2">Media & Files</h1>
        </div>
        
        {showMediaPreview && (
          <div className="grid grid-cols-3 gap-1 mt-2">
            {mediaData.photos.map((image, index) => (
              <div key={index} className="overflow-hidden aspect-square">
                <img
                  className="w-full h-full custom-border object-cover"
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </aside>
  );
};

export default ChatInfoDefault;