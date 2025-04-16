import React from 'react';
import classNames from 'classnames';

type MessageProps = {
  isOwn?: boolean;
  avatarUrl?: string;
  name: string;
  time: string;
  text: string;
};

const Message: React.FC<MessageProps> = ({ isOwn = false, avatarUrl, name, time, text }) => {
  return (
    <div className={classNames('flex max-w-[60%] group', {
        'flex-row-reverse text-right ml-auto': isOwn,
        'flex-row text-left mr-auto': !isOwn,})}
    >
      {/* <div className="mt-auto h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
        {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <i className="material-symbols-outlined text-2xl opacity-20">mood</i>
        )}
      </div> */}

      <div className="flex flex-col gap-1">
        {/* <div className="text-sm font-semibold opacity-60 mb-1">
          {name}
        </div> */}

      <div
        className={classNames('relative',
          {
            'message-bubble self-message': isOwn,
            'message-bubble': !isOwn,
          }
        )}
      >
        {text}
        <i
          className={classNames(
            'material-symbols-outlined absolute opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer',
            {
              '-bottom-6 left-0': isOwn,
              '-bottom-6 right-0': !isOwn,
            }
          )}
        >
          favorite
        </i>
      </div>

        <div className="text-xs opacity-0 group-hover:opacity-40">{time}</div>

      </div>
    </div>
  );
};

export default Message;
