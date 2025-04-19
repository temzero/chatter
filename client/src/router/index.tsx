type ChatAvatarProps = {
    chat: ChatProps;
  };
  
  const ChatAvatar = ({ chat }: ChatAvatarProps) => {
    if (chat.type === 'private') {
      return (
        <div className='h-16 w-16 min-w-[4rem] custom-border flex items-center justify-center overflow-hidden rounded-full'>
          {chat.avatar ? (
            <img
              className="h-full w-full object-cover"
              src={chat.avatar}
              alt={`${chat.name}'s avatar`}
            />
          ) : (
            <i className="material-symbols-outlined text-6xl opacity-20">mood</i>
          )}
        </div>
      );
    }
  
    return (
      <div className='h-16 w-16 min-w-[4rem] custom-border grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl'>
        {[...Array(4)].map((_, idx) => (
          <i
            key={idx}
            className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full"
          >
            mood
          </i>
        ))}
      </div>
    );
  };
  