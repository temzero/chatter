// hooks/useChats.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useChats = () =>
  useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/chats");
      return data;
    },
  });
