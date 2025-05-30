import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import SlidingContainer from '@/components/ui/SlidingContainer';

const mediaTypes = ['photos', 'videos', 'voice', 'files'];

const ChatInfoMedia: React.FC = () => {
    const {activeRoomMedia} = useChat();
    const { setChatInfoMode } = useChatInfo();
    const [selectedType, setSelectedType] = useState<string>(mediaTypes[0]);
    const [direction, setDirection] = useState<number>(1);

    const getTypeClass = React.useCallback((type: string) => 
        `flex items-center justify-center cursor-pointer p-2 ${
            selectedType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
        }`,
        [selectedType]
    );

    const handleTypeChange = (type: string) => {
        if (type === selectedType) return;

        const currentIndex = mediaTypes.indexOf(selectedType);
        const newIndex = mediaTypes.indexOf(type);

        setDirection(newIndex > currentIndex ? 1 : -1);
        setSelectedType(type);
    };

    const renderMediaContent = () => {
        const currentMedia = activeRoomMedia[selectedType as keyof typeof activeRoomMedia];
        
        if (currentMedia.length === 0) {
            return (
                <div className="flex justify-center items-center h-32 opacity-50">
                    No {selectedType} available
                </div>
            );
        }

        return (
            <div className="grid grid-cols-3 pb-10">
                {currentMedia.map((image, index) => (
                    <div key={index} className="overflow-hidden aspect-square">
                        <img
                            className="w-full h-full custom-border object-cover cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 hover:brightness-110"
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <aside className="relative w-full h-full overflow-hidden flex flex-col">
            <header className="flex p-4 w-full items-center min-h-[var(--header-height)] custom-border-b">
                {/* <a className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100"
                onClick={()=> setChatInfoMode('default')}>
                    <i className="material-symbols-outlined">arrow_back</i>
                </a> */}
                <h1 className='text-xl font-semibold'>Media & Files</h1>

                <a className="flex items-center rounded-full cursor-pointer opacity-50 hover:opacity-100 ml-auto"
                onClick={()=> setChatInfoMode('default')}>
                    <i className="material-symbols-outlined">edit</i>
                </a>
            </header>
            <div className="flex justify-around items-center custom-border-b w-full backdrop-blur-[120px]">
                {mediaTypes.map((type) => (
                    <a 
                        key={type} 
                        className={getTypeClass(type)} 
                        onClick={() => handleTypeChange(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </a>
                ))}
            </div>
            
            <div className='overflow-x-hidden overflow-y-auto h-screen'>
                <SlidingContainer selectedType={selectedType} direction={direction}>
                    {renderMediaContent()}
                </SlidingContainer>
            </div>
            <a className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 flex items-center justify-center cursor-pointer opacity-50 hover:opacity-90 bg-[var(--sidebar-color)]"
                onClick={()=> setChatInfoMode('default')}>
                <i className="material-symbols-outlined rotate-90">arrow_forward_ios</i>
            </a>

        </aside>
    );
};

export default ChatInfoMedia;