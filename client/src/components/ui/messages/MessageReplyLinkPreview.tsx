// import { LinkPreviewResponse } from "@/shared/types/responses/message.response";
// import React from "react";

// interface ReplyMessageLinkPreviewProps {
//   linkPreview?: LinkPreviewResponse | null;
// }

// export const MessageReplyLinkPreview: React.FC<
//   ReplyMessageLinkPreviewProps
// > = ({ linkPreview }) => {
//   if (!linkPreview) return null;

//   return (
//     <div className="p-1 border-2 border-blue-500 rounded-lg">
//       <div className="flex items-center text-blue-500 gap-1">
//         <span className="material-symbols-outlined text-sm">link</span>
//         <h1 className="truncate text-xs italic line-clamp-2 reply-text">
//           {linkPreview.url}
//         </h1>
//       </div>

//       <h1 className="font-semibold truncate line-clamp-2 reply-text">
//         {linkPreview.title || linkPreview.url}
//       </h1>
//     </div>
//   );
// };
