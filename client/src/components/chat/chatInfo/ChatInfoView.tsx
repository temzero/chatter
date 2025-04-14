import image1 from '@/assets/image/image1.jpg';
import image2 from '@/assets/image/image2.jpg';
import image3 from '@/assets/image/image3.jpg';
import image4 from '@/assets/image/image4.jpg';
import image5 from '@/assets/image/image5.jpg';
import image6 from '@/assets/image/image6.jpg';
import image7 from '@/assets/image/image7.jpg';
import image8 from '@/assets/image/image8.jpg';
import image9 from '@/assets/image/image9.jpg';

import { useChat } from '@/contexts/ChatContext';

const ChatInfoView: React.FC = () => {
    const { setChatInfoMode } = useChat();

  return (
    <aside className="flex flex-col w-full h-full">
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
            <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100">
                <i className="material-symbols-outlined"
                onClick={() => setChatInfoMode('edit')}>edit</i>
            </a>
        </header>

        <div className="overflow-y-auto h-screen">
            <div className="flex flex-col justify-center items-center p-4 gap-2 w-full">
                <div className="relative">
                    <a className="h-36 w-36 flex items-center justify-center rounded-full custom-border">
                        <i className="material-symbols-outlined text-8xl opacity-20">mood</i>
                    </a>
                    <a className="absolute bottom-1 right-1 flex items-center rounded-full cursor-pointer opacity-40 hover:opacity-80">
                        <i className="material-symbols-outlined">favorite</i>
                    </a>
                </div>
        
                <h1 className="text-xl font-semibold">User Full Name</h1>
        
                <div className="w-full flex flex-col items-center p-4 rounded font-light">
                    <a className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined">call</i>
                        0123456789
                    </a>
                
                    <a className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined text">mail</i>
                        user@email.com
                    </a>
                
                    <a className="flex gap-2 rounded cursor-pointer p-1 px-2 hover:bg-[var(--border-color)]">
                        <i className="material-symbols-outlined">cake</i>
                        28/04/2000
                    </a>
                </div>
                
        
                <div className="w-full space-y-2 p-2 custom-border rounded">
                    <div>
                        <h1 className="text-xs font-light">Groups</h1>
                        <div className="flex gap-1">
                            <a href="" className="hover:underline">Work,</a>
                            <a href="" className="hover:underline">Gamings</a>
                        </div>
                    </div>
                </div>
        
            </div>
        
            <div className="flex justify-around custom-border-b custom-border-t">
                <a className="flex items-center p-2 cursor-pointer opacity-50 hover:opacity-80">
                    All
                </a>
                <a className="flex items-center p-2 cursor-pointer opacity-50 hover:opacity-80">
                    Photos
                </a>
                <a className="flex items-center p-2 cursor-pointer opacity-50 hover:opacity-80">
                    Videos
                </a>
                <a className="flex items-center p-2 cursor-pointer opacity-50 hover:opacity-80">
                    Voice
                </a>
                <a className="flex items-center p-2 cursor-pointer opacity-50 hover:opacity-80">
                    Files
                </a>
            </div>
        
            <div>
            <div className="flex">
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image1} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image2} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image3} />
            </div>
            <div className="flex">
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image4} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image5} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image6} />
            </div>
            <div className="flex">
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image7} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image8} />
            <img className="w-full h-28 object-cover cursor-pointer hover:border-4" src={image9} />
            </div>
            </div>

            <div className='flex justify-center items-center cursor-pointer opacity-50 hover:opacity-80'>
            <i className="material-symbols-outlined">more_horiz</i>
            </div>
        </div>

    </aside>
  )
}

export default ChatInfoView;

