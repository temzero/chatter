export interface Chat {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    type: 'friends' | 'work' | 'study'; // Made this a union type for better type safety
    phone?: string; // Made optional since groups don't need these
    email?: string; // Made optional since groups don't need these
    bio?: string; // Made optional since groups don't need these
    birthday?: string; // Made optional since groups don't need these
    isGroup?: boolean;
    members?: string[];
  }

export const dummyChats: Chat[] = [
    {
      id: 1,
      name: 'Alice',
      avatar: '',
      lastMessage: 'Hey there!',
      time: '10:45 AM',
      type: 'friends',
      phone: '+1234567890',
      email: 'alice@example.com',
      bio: 'Frontend developer who loves React',
      birthday: '15/05/1992'
    },
    {
      id: 2,
      name: 'Bob',
      avatar: '',
      lastMessage: 'See you later',
      time: '9:20 AM',
      type: 'work',
      phone: '+1987654321',
      email: 'bob@example.com',
      bio: 'Project manager at TechCorp',
      birthday: '22/11/1985'
    },
    {
      id: 3,
      name: 'Charlie',
      avatar: '',
      lastMessage: 'Let’s meet up tomorrow.',
      time: '8:15 AM',
      type: 'study',
      phone: '+1122334455',
      email: 'charlie@example.com',
      bio: 'Computer science student',
      birthday: '03/09/2000'
    },
    {
      id: 4,
      name: 'Diana',
      avatar: '',
      lastMessage: 'Got it, thanks!',
      time: '7:05 AM',
      type: 'friends',
      phone: '+1567890123',
      email: 'diana@example.com',
      bio: 'UX Designer',
      birthday: '18/07/1993'
    },
    {
      id: 5,
      name: 'Eve',
      avatar: '',
      lastMessage: 'Did you finish the project?',
      time: 'Yesterday',
      type: 'work',
      phone: '+1345678901',
      email: 'eve@example.com',
      bio: 'Senior Developer',
      birthday: '29/02/1988'
    },
    {
      id: 6,
      name: 'Frank',
      avatar: '',
      lastMessage: 'Let’s grab coffee later.',
      time: 'Yesterday',
      type: 'friends',
      phone: '+1478523690',
      email: 'frank@example.com',
      bio: 'Data Analyst who enjoys Python',
      birthday: '12/04/1991'
    },
    {
      id: 7,
      name: 'Grace',
      avatar: '',
      lastMessage: 'All tasks are completed.',
      time: 'Monday',
      type: 'work',
      phone: '+1987456321',
      email: 'grace@example.com',
      bio: 'DevOps engineer at CloudNet',
      birthday: '25/12/1987'
    },
    {
      id: 8,
      name: 'Henry',
      avatar: '',
      lastMessage: 'Wanna study together?',
      time: 'Sunday',
      type: 'study',
      phone: '+1765432198',
      email: 'henry@example.com',
      bio: 'AI/ML Enthusiast',
      birthday: '09/06/1999'
    },
    {
      id: 9,
      name: 'Isla',
      avatar: '',
      lastMessage: 'Happy birthday!',
      time: 'Sunday',
      type: 'friends',
      phone: '+1654321987',
      email: 'isla@example.com',
      bio: 'Digital Artist',
      birthday: '30/08/1994'
    },
    {
      id: 10,
      name: 'Jack',
      avatar: '',
      lastMessage: 'I’ll check the docs.',
      time: 'Saturday',
      type: 'work',
      phone: '+1231231234',
      email: 'jack@example.com',
      bio: 'Backend Developer',
      birthday: '14/03/1989'
    },
    {
      id: 11,
      name: 'Kara',
      avatar: '',
      lastMessage: 'Notes shared!',
      time: 'Saturday',
      type: 'study',
      phone: '+1333555777',
      email: 'kara@example.com',
      bio: 'Biology major at university',
      birthday: '07/11/2001'
    },
    {
      id: 12,
      name: 'Leo',
      avatar: '',
      lastMessage: 'Let’s catch up soon.',
      time: 'Friday',
      type: 'friends',
      phone: '+1223344556',
      email: 'leo@example.com',
      bio: 'Freelance Videographer',
      birthday: '21/01/1995'
    },
    {
      id: 13,
      name: 'Mia',
      avatar: '',
      lastMessage: 'Sent the brief.',
      time: 'Thursday',
      type: 'work',
      phone: '+1777888999',
      email: 'mia@example.com',
      bio: 'Product Manager',
      birthday: '05/10/1990'
    },
    {
      id: 14,
      name: 'Nate',
      avatar: '',
      lastMessage: 'Can we revise that?',
      time: 'Wednesday',
      type: 'work',
      phone: '+1666777888',
      email: 'nate@example.com',
      bio: 'Quality Assurance Engineer',
      birthday: '17/07/1986'
    },
    {
      id: 15,
      name: 'Olivia',
      avatar: '',
      lastMessage: 'Working on it.',
      time: 'Tuesday',
      type: 'study',
      phone: '+1444555666',
      email: 'olivia@example.com',
      bio: 'Math PhD candidate',
      birthday: '28/02/1998'
    },
    {
      id: 16,
      name: 'Paul',
      avatar: '',
      lastMessage: 'I’ll call you back.',
      time: 'Today',
      type: 'friends',
      phone: '+1555666777',
      email: 'paul@example.com',
      bio: 'Travel Blogger',
      birthday: '13/09/1992'
    },
    {
      id: 17,
      name: 'Queenie',
      avatar: '',
      lastMessage: 'Meeting is at 4 PM.',
      time: 'Today',
      type: 'work',
      phone: '+1444333222',
      email: 'queenie@example.com',
      bio: 'Finance Lead',
      birthday: '24/04/1984'
    },
    {
      id: 18,
      name: 'Ryan',
      avatar: '',
      lastMessage: 'Need help with the code.',
      time: 'Today',
      type: 'study',
      phone: '+1777222111',
      email: 'ryan@example.com',
      bio: 'Coding bootcamp student',
      birthday: '06/12/2002'
    },
    {
      id: 19,
      name: 'Sophie',
      avatar: '',
      lastMessage: 'Haha that was funny!',
      time: 'Today',
      type: 'friends',
      phone: '+1333444555',
      email: 'sophie@example.com',
      bio: 'Comedy writer',
      birthday: '19/05/1996'
    },
    {
      id: 20,
      name: 'Tom',
      avatar: '',
      lastMessage: 'Done with review.',
      time: 'Today',
      type: 'work',
      phone: '+1222111444',
      email: 'tom@example.com',
      bio: 'Tech lead at SoftBase',
      birthday: '31/10/1983'
    },
  
    {
      id: 21,
      name: 'React Enthusiasts',
      avatar: '',
      lastMessage: 'Alice: Check out this new hook!',
      time: '11:30 AM',
      type: 'study',
      isGroup: true,
      members: ['Alice', 'Eve', 'Jack', 'Ryan']
    },
    {
      id: 22,
      name: 'Work Team',
      avatar: '',
      lastMessage: 'Tom: Meeting at 3pm in Conference Room B',
      time: '10:15 AM',
      type: 'work',
      isGroup: true,
      members: ['Bob', 'Eve', 'Grace', 'Mia', 'Tom']
    },
    {
      id: 23,
      name: 'Weekend Warriors',
      avatar: '',
      lastMessage: 'Frank: Whos up for hiking this Saturday?',
      time: 'Yesterday',
      type: 'friends',
      isGroup: true,
      members: ['Alice', 'Diana', 'Frank', 'Isla', 'Sophie']
    },
    {
      id: 24,
      name: 'Study Group CS101',
      avatar: '',
      lastMessage: 'Henry: I shared the notes in the drive',
      time: 'Monday',
      type: 'study',
      isGroup: true,
      members: ['Charlie', 'Henry', 'Kara', 'Olivia', 'Ryan']
    },
    {
      id: 25,
      name: 'Project Alpha',
      avatar: '',
      lastMessage: 'Grace: Deployment completed successfully',
      time: 'Sunday',
      type: 'work',
      isGroup: true,
      members: ['Bob', 'Grace', 'Jack', 'Nate', 'Queenie']
    }
  ];