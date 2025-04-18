// import React from 'react';
// import classNames from 'classnames';

// export interface MessageProps {
//   id: number;
//   senderName: string;
//   content: string;
//   timestamp: string;
//   isMe: boolean;
//   isGroup?: boolean
// }

// const Message: React.FC<MessageProps> = ({ isMe = false, avatar, isGroup = false ,senderName, timestamp, content }) => {
//   return (
//     <div className={classNames('flex max-w-[60%] group', {
//         'flex-row-reverse text-right ml-auto': isMe,
//         'flex-row text-left mr-auto': !isMe,})}
//     >
//       {isGroup && !isMe &&
//         <div className="mt-auto h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
//           {avatar ? (
//               <img src={avatar} className="h-full w-full object-cover"/>
//             ) : (
//               <i className="material-symbols-outlined text-2xl opacity-20">mood</i>
//           )}
//         </div>
//       }

//       <div className="flex flex-col gap-1">
//         {isGroup && !isMe && (
//           <div className="text-sm font-semibold opacity-60 mb-1">
//             {senderName}
//           </div>
//         )}

//         <div
//           className={classNames('relative',
//             {
//               'message-bubble self-message': isMe,
//               'message-bubble': !isMe,
//             }
//           )}
//         >
//           {content}
//           <i
//             className={classNames(
//               'material-symbols-outlined absolute opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer',
//               {
//                 '-bottom-6 left-0': isMe,
//                 '-bottom-6 right-0': !isMe,
//               }
//             )}
//           >
//             favorite
//           </i>
//         </div>

//         <div className="text-xs opacity-0 group-hover:opacity-40">{timestamp}</div>

//       </div>
//     </div>
//   );
// };

// export default Message;
