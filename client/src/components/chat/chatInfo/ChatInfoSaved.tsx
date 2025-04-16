import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import avatar1 from '@/assets/image/avatar1.jpg';
import avatar2 from '@/assets/image/avatar2.jpg';
import classNames from 'classnames';

const messages = [
  {
    id: 1,
    text: 'Hello!',
    sender: 'me',
    avatarUrl: avatar1,
    name: 'Me',
    time: '10:00 AM',
  },
  {
    id: 2,
    text: 'Hi there!',
    sender: 'them',
    avatarUrl: avatar2,
    name: 'John Doe',
    time: '10:01 AM',
  },
  {
    id: 3,
    text: 'Hows everything going?',
    sender: 'me',
    avatarUrl: avatar1,
    name: 'Me',
    time: '10:02 AM',
  },
  {
    id: 4,
    text: 'Pretty good, just working on a project. You? Pretty good, just working on a project. You?',
    sender: 'them',
    avatarUrl: avatar2,
    name: 'John Doe',
    time: '10:03 AM',
  },
  {
    id: 5,
    text: 'Same here. Been super busy lately. Totally get that. Lets catch up soon? Totally get that. Lets catch up soon? Totally get that',
    sender: 'me',
    avatarUrl: avatar1,
    name: 'Me',
    time: '10:04 AM',
  },
  {
    id: 6,
    text: 'Totally get that. Lets catch up soon?',
    sender: 'them',
    avatarUrl: avatar2,
    name: 'John Doe',
    time: '10:05 AM',
  },
  {
    id: 7,
    text: 'For sure! Maybe later this week?',
    sender: 'me',
    avatarUrl: avatar1,
    name: 'Me',
    time: '10:06 AM',
  },
  {
    id: 8,
    text: 'Sounds like a plan!',
    sender: 'them',
    avatarUrl: avatar2,
    name: 'John Doe',
    time: '10:07 AM',
  },
  {
    id: 9,
    text: 'Ill check my calendar and get back to you.',
    sender: 'me',
    avatarUrl: avatar1,
    name: 'Me',
    time: '10:08 AM',
  },
  {
    id: 10,
    text: 'Great, talk to you soon!',
    sender: 'them',
    avatarUrl: avatar2,
    name: 'John Doe',
    time: '10:09 AM',
  },
];

const ChatInfoSaved: React.FC = () => {
  const { setChatInfoMode } = useChat();

  return (
    <aside className="w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full items-center min-h-[var(--header-height)] custom-border-b">
        <a 
          className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100"
          onClick={() => setChatInfoMode('view')}
        >
          <i className="material-symbols-outlined">arrow_back</i>
        </a>
        <h1 className='text-xl font-semibold'>Saved Messages</h1>

        <a 
          className="flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100 ml-auto"
          onClick={() => setChatInfoMode('view')}
        >
          <i className="material-symbols-outlined">edit</i>
        </a>
      </header>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((msg) => {
          const isOwn = msg.sender === 'me';
          return (
            <div 
              key={msg.id}
              className={classNames('flex group', {
                'flex-row-reverse text-right ml-auto': isOwn,
                'flex-row text-left mr-auto': !isOwn,
              })}
            >
              <div className="flex flex-col gap-1 max-w-[90%]">
                <div
                  className={classNames('relative p-3 rounded-lg', {
                    'message-bubble self-message': isOwn,
                    'message-bubble': !isOwn,
                  })}
                >
                  {msg.text}
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
                <div className="text-xs opacity-0 group-hover:opacity-40">{msg.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatInfoSaved;