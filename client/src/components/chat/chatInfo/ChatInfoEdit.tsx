import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';

const ChatInfoEdit: React.FC = () => {
  const { activeRoom } = useChat();
  const { setChatInfoMode } = useChatInfo();

  // Initialize formData with all necessary fields from activeRoom
  const [formData, setFormData] = useState({
    name: activeRoom?.name || '',
    phone: activeRoom?.phone || '',
    email: activeRoom?.email || '',
    birthday: activeRoom?.birthday || '',
    avatar: activeRoom?.avatar || ''
  });

  // Update formData when activeRoom changes
  useEffect(() => {
    if (activeRoom) {
      setFormData({
        name: activeRoom.name || '',
        phone: activeRoom.phone || '',
        email: activeRoom.email || '',
        birthday: activeRoom.birthday || '',
        avatar: activeRoom.avatar || ''
      });
    }
  }, [activeRoom]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChatInfoMode('default');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, avatar: event.target.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
        <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
          <h1 className="text-xl font-semibold ml-2">Edit</h1>
          <div className="flex gap-2">
            <a className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white"
                onClick={() => setChatInfoMode('default')}>
                <i className="material-symbols-outlined text-3xl">check</i>
            </a>
            <a className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
                  onClick={() => setChatInfoMode('default')}>
                  <i className="material-symbols-outlined">close</i>
            </a>
          </div>
        </header>

      <form onSubmit={handleSubmit} className="overflow-y-auto h-screen">
        <div className="flex flex-col items-center p-4 gap-4 w-full">
          <div className="relative group">
            <div className="h-36 w-36 flex items-center justify-center rounded-full custom-border overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
              )}
            </div>
            <label className="w-10 h-10 absolute bottom-0 right-0 bg-gray-600 text-white rounded-full p-2 cursor-pointer hover:bg-gray-700 flex items-center justify-center">
              <i className="material-symbols-outlined">edit</i>
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-[var(--border-color)]"
              />
              <div className="border border-[var(--border-color)]"></div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Nickname</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
              <div className="border border-[var(--border-color)]"></div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Description</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
              <div className="border border-[var(--border-color)]"></div>
            </div>
          </div>
        </div>
      </form>
      
      <div className='flex justify-center items-center cursor-pointer p-2 text-red-500 custom-border-t absolute bottom-0 w-full'>
        <i className="material-symbols-outlined">delete</i>
        <span className="font-medium">Delete...</span>
      </div>
    </aside>
  );
};

export default ChatInfoEdit;