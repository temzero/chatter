// import { useMemo } from "react";
// import { useMessageStore } from "@/stores/messageStore";
// import { MessageResponse } from "@/shared/types/responses/message.response";

// interface UseMessageFilterParams {
//   message?: MessageResponse;
// }

// export const useMessageFilter = ({ message }: UseMessageFilterParams) => {
//   const searchQuery = useMessageStore((state) => state.searchQuery);
//   const filterImportantMessages = useMessageStore(
//     (state) => state.filterImportantMessages
//   );
//   const filterLinkMessages = useMessageStore(
//     (state) => state.filterLinkMessages
//   );

//   return useMemo(() => {
//     if (!message) return false;

//     const query = searchQuery.trim().toLowerCase();

//     const contentText = message.content?.toString().toLowerCase() ?? "";

//     const linkUrl = message.linkPreview?.url?.toLowerCase() ?? "";
//     const linkTitle = message.linkPreview?.title?.toLowerCase() ?? "";
//     const linkSiteName = message.linkPreview?.site_name?.toLowerCase() ?? "";

//     /* -------------------------------
//      🔍 SEARCH LOGIC
//      -------------------------------- */
//     let matchesSearch = true;

//     if (query !== "") {
//       if (filterLinkMessages) {
//         // 🔗 Link-only search (strict)
//         matchesSearch =
//           !!message.linkPreview &&
//           (linkUrl.includes(query) ||
//             linkTitle.includes(query) ||
//             linkSiteName.includes(query));
//       } else {
//         // 📝 Normal message content search only
//         matchesSearch = contentText.includes(query);
//       }
//     }

//     /* -------------------------------
//      ⭐ IMPORTANT FILTER
//      -------------------------------- */
//     const matchesImportant = !filterImportantMessages || message.isImportant;

//     /* -------------------------------
//      🔗 LINK FILTER
//      -------------------------------- */
//     const matchesLink = !filterLinkMessages || !!message.linkPreview;

//     return matchesSearch && matchesImportant && matchesLink;
//   }, [message, searchQuery, filterImportantMessages, filterLinkMessages]);
// };
