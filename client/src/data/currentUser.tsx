import avatar from '@/assets/image/avatar1.jpg'
 import { MyProfileProps } from './types';
 
 export const currentUserProfileData: MyProfileProps = {
   id: 'Me',
   username: 'temzero',
   firstName: 'Nhan',
   lastName: 'Nguyen',
   phoneNumber: '+1234567890',
   birthday: '28/04/2000',
   avatar: avatar,
   isOnline: true,
   email: 'nhan@example.com',
   bio: 'Software developer and tech enthusiast',
   settings: {
     theme: 'dark',
     notificationSound: true,
     privacy: {
       lastSeen: 'contacts',
       profilePhoto: 'contacts'
     }
   },
   blockedUsers: [],
   contacts: ['user2, user3']
 };