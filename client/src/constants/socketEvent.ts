export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    
    // Message events
    MESSAGE_SENT: 'message:sent',
    MESSAGE_RECEIVED: 'message:received',
    MESSAGE_READ: 'message:read',
    
    // Presence events
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    
    // Typing indicators
    TYPING_START: 'typing:start',
    TYPING_END: 'typing:end',
    
    // Group events
    GROUP_JOIN: 'group:join',
    GROUP_LEAVE: 'group:leave',
  };