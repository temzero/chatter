import { useEffect, useState } from "react";
import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
import { friendshipService } from "@/services/http/friendshipService";
import { handleError } from "@/common/utils/handleError";

export function useFriendContacts(excludeUserIds: string[] = []) {
  const [contacts, setContacts] = useState<FriendContactResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      console.log("Fetching contacts...");
      try {
        const allContacts = await friendshipService.fetchFriendContacts();
        console.log("All contacts fetched", allContacts);
        const filtered = allContacts.filter(
          (contact) => !excludeUserIds.includes(contact.userId)
        );
        setContacts(filtered);
      } catch (err) {
        handleError(err, "Failed to load friend contacts");
      } finally {
        setLoading(false);
        console.log("Set loading to false");
      }
    };

    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { contacts, loading };
}
