import { useMemo } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/shared/types/responses/message.response";

interface UseMessageFilterParams {
  message?: MessageResponse;
}

export const useMessageFilter = ({ message }: UseMessageFilterParams) => {
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const filterImportantMessages = useMessageStore(
    (state) => state.filterImportantMessages
  );

  return useMemo(() => {
    if (!message) return false;

    const query = searchQuery.trim().toLowerCase();
    const contentText = message.content?.toString().toLowerCase() ?? "";

    /* -------------------------------
     🔍 SEARCH LOGIC
     -------------------------------- */
    let matchesSearch = true;

    if (query !== "") {
      // 📝 Normal message content search only
      matchesSearch = contentText.includes(query);
    }

    /* -------------------------------
     ⭐ IMPORTANT FILTER
     -------------------------------- */
    const matchesImportant = !filterImportantMessages || message.isImportant;

    return matchesSearch && matchesImportant;
  }, [message, searchQuery, filterImportantMessages]);
};
