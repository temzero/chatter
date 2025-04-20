// Import your images
import image1 from '@/assets/image/image1.jpg';
import image2 from '@/assets/image/image2.jpg';
import image3 from '@/assets/image/image3.jpg';
import image4 from '@/assets/image/image4.jpg';
import image5 from '@/assets/image/image5.jpg';
import image6 from '@/assets/image/image6.jpg';
import image7 from '@/assets/image/image7.jpg';
import image8 from '@/assets/image/image8.jpg';
import image9 from '@/assets/image/image9.jpg';

export interface MediaProps {
    messageId: number;  // Now using the message id directly
    type: 'photo' | 'video' | 'audio' | 'file';
    url: string;
}

export const mediaData: MediaProps[] = [
    // Alice (chatId: 1)
    {
        messageId: 100,  // Matches message id 100
        type: 'photo',
        url: image1,
    },
    {
        messageId: 101,  // Matches message id 101
        type: 'photo',
        url: image2,
    },
    {
        messageId: 1001,  // Matches message id 101
        type: 'photo',
        url: image2,
    },
    
    // Bob (chatId: 2)
    {
        messageId: 102,  // Matches message id 102
        type: 'file',
        url: '/files/document.pdf',
    },
    
    // Charlie (chatId: 3)
    {
        messageId: 103,  // Matches message id 103
        type: 'photo',
        url: image3,
    },
    
    // Diana (chatId: 4)
    {
        messageId: 104,  // Matches message id 104
        type: 'video',
        url: '/videos/demo.mp4',
    },
    
    // Eve (chatId: 5)
    {
        messageId: 16,  // Matches message id 16
        type: 'photo',
        url: image4,
    },
    
    // Frank (chatId: 6)
    {
        messageId: 19,  // Matches message id 19
        type: 'photo',
        url: image5,
    },
    
    // React Enthusiasts group (chatId: 21)
    {
        messageId: 105,  // Matches message id 105
        type: 'photo',
        url: image6,
    },
    {
        messageId: 106,  // Matches message id 106
        type: 'file',
        url: '/files/hook-example.js',
    },
    
    // Work Team group (chatId: 22)
    {
        messageId: 107,  // Matches message id 107
        type: 'file',
        url: '/files/report-q3.pdf',
    },
    
    // Weekend Warriors group (chatId: 23)
    {
        messageId: 108,  // Matches message id 108
        type: 'photo',
        url: image7,
    },
    {
        messageId: 109,  // Matches message id 109
        type: 'photo',
        url: image8,
    },
    
    // Study Group CS101 (chatId: 24)
    {
        messageId: 34,  // Matches message id 34
        type: 'file',
        url: '/files/notes.pdf',
    },
    
    // Project Alpha group (chatId: 25)
    {
        messageId: 39,  // Matches message id 39
        type: 'photo',
        url: image9,
    },
    
    // Dev Channel (chatId: 26)
    {
        messageId: 45,  // Matches message id 45
        type: 'file',
        url: '/files/changelog.md',
    }
];

// Helper function to get media by messageId
export function getMediaByMessageId(messageId: number): MediaProps | undefined {
    return mediaData.find(media => media.messageId === messageId);
}

// In your media.ts file
import { MessagesData } from './message';

export function getMediaByChatId(chatId: number): MediaProps[] {
  // Get all messages for this chat
  const chatMessages = MessagesData.filter(msg => msg.chatId === chatId);
  
  // Extract media from messages that have it
  const mediaItems = chatMessages
    .filter(msg => msg.media)
    .map(msg => ({
      ...msg.media!,
      messageId: msg.id, // Include message ID for reference
      timestamp: msg.time // Include message timestamp
    }));
  
  return mediaItems;
}