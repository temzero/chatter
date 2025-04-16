import { useChat } from '@/contexts/ChatContext';
import { useState } from 'react';

const ChatInfoEdit: React.FC = () => {
  const { setChatInfoMode } = useChat();
  const [formData, setFormData] = useState({
    name: 'User Full Name',
    phone: '0123456789',
    email: 'user@email.com',
    birthday: '28/04/2000',
    avatar: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setChatInfoMode('view');
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
        <div className='flex gap-1 items-center'>
            <a className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80"
                onClick={() => setChatInfoMode('view')}>
                <i className="material-symbols-outlined">arrow_back</i>
            </a>
            <h1 className="text-xl font-semibold">Edit</h1>
        </div>
        <a className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80"
            onClick={() => setChatInfoMode('view')}>
            <i className="material-symbols-outlined text-green-300 text-3xl">check</i>
        </a>
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
            <label className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--sidebar-bg)] custom-border cursor-pointer hover:opacity-100">
              <i className="material-symbols-outlined text-lg">edit</i>
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
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full p-2 rounded border border-[var(--border-color)]"
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button 
            type="submit"
            className="w-full py-3 rounded-full bg-[var(--primary-green)] text-white font-medium"
          >
            Save Changes
          </button>
        </div>

        <div className='flex justify-center items-center cursor-pointer text-red-500 gap-2 p-2 custom-border-t absolute bottom-0 w-full'>
          <i className="material-symbols-outlined">delete</i>
          <span className="font-medium">Delete...</span>
        </div>

      </form>
    </aside>
  );
};

export default ChatInfoEdit;