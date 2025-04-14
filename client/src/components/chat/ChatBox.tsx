import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import avatar1 from '@/assets/image/avatar1.jpg';
import avatar2 from '@/assets/image/avatar2.jpg';

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState([
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
      text: 'How’s everything going?',
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
      text: 'Same here. Been super busy lately. Totally get that. Let’s catch up soon? Totally get that. Let’s catch up soon? Totally get that. Let’s catch up soon?',
      sender: 'me',
      avatarUrl: avatar1,
      name: 'Me',
      time: '10:04 AM',
    },
    {
      id: 6,
      text: 'Totally get that. Let’s catch up soon?',
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
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-40 space-y-2">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          isOwn={msg.sender === 'me'}
          avatarUrl={msg.avatarUrl}
          name={msg.name}
          time={msg.time}
          text={msg.text}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
