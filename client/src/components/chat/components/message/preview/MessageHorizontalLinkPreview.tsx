// import React from "react";
// import clsx from "clsx";
// import { LinkPreviewResponse } from "@/shared/types/responses/message.response";
// import { audioManager, SoundType } from "@/services/audioManager";
// import { useIsMobile } from "@/stores/deviceStore";

// interface MessageHorizontalLinkPreviewProps {
//   linkPreview?: LinkPreviewResponse | null;
//   isCrop?: boolean;
// }

// export const MessageHorizontalLinkPreview: React.FC<
//   MessageHorizontalLinkPreviewProps
// > = ({ linkPreview, isCrop }) => {
//   const isMobile = useIsMobile();
//   if (!linkPreview) return null;

//   const imageUrl = linkPreview.image || linkPreview.favicon;
//   const title = linkPreview.title;
//   const url = linkPreview.url;

//   const linkClass = clsx(
//     "group",
//     "flex items-center pr-1",
//     "bg-blue-800 hover:bg-blue-600",
//     "text-white",
//     "border-2 hover:border-4 border-(--input-border-color)",
//     "rounded",
//     {
//       "max-w-[45vw]": isCrop,
//     }
//   );

//   return (
//     <a
//       href={url}
//       target="_blank"
//       rel="noopener noreferrer"
//       title={url || title}
//       className={linkClass}
//       onMouseEnter={(e) => {
//         e.stopPropagation();
//         audioManager.playSound(SoundType.LINK_HOVER, 0.2);
//       }}
//       onClick={(e) => {
//         e.stopPropagation();
//       }}
//     >
//       <img
//         src={imageUrl}
//         className={clsx(
//           "h-9 object-cover rounded mr-1",
//           "transition-transform duration-300",
//           "hover:scale-200 group-hover:scale-125"
//         )}
//         style={{ zIndex: 999 }}
//       />

//       <div className="flex-1 min-w-0 overflow-hidden">
//         {title ? (
//           <div>
//             <h1 className="font-semibold truncate line-clamp-1">{title}</h1>
//             {isMobile && (
//               <h2 className="text-xs text-white/70 italic underline -mt-1 line-clamp-1">
//                 {url}
//               </h2>
//             )}
//           </div>
//         ) : (
//           <h1 className="text-xs italic truncate line-clamp-1">{url}</h1>
//         )}
//       </div>
//     </a>
//   );
// };
