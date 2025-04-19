import React from 'react';

type MessageProps = {
  time: string;
  text: string;
};

const Message: React.FC<MessageProps> = ({ time, text }) => {
  return (
    <>
    <div className='relative flex flex-col gap-1 items-center justify-center group custom-border-b'>
      <div className='relative py-8 w-[70%]'>
        {text}
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
