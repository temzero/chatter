import React from 'react';
import RenderMultipleMedia from '../ui/RenderMultipleMedia';
import type { MediaProps } from '@/data/media';

type MessageProps = {
  time: string;
  text?: string;
  media?: MediaProps[];
};

const Message: React.FC<MessageProps> = ({ time, text, media }) => {
  return (
    <>
    <div className='relative flex flex-col gap-1 items-center justify-center group custom-border-b'>
      <div className='relative py-8 w-[70%]'>
        {media && 
          <div className="rounded border mb-2">
            <RenderMultipleMedia media={media}/>
          </div>
        }
        {text && <p>{text}</p>}
      <i className='material-symbols-outlined absolute -bottom-1 left-0 opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
        favorite
      </i>
      </div>
      <div className="absolute top-2 right-0 text-xs opacity-0 group-hover:opacity-40 z-0">{time}</div>
    </div>

    {/* <div id='dateTimeStamp' className="flex items-center bg-[var(--border-color)] w-full z-0 h-3 px-1 text-xs text-white"><span className='opacity-60'>{time}</span></div> */}
    </>
  );
};

export default Message;
