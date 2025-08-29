// hooks/useCallMembers.ts
import { useCallStore } from "@/stores/callStore/callStore";
import { useSFUCallStore } from "@/stores/callStore/sfuCallStore";
import { useP2PCallStore } from "@/stores/callStore/p2pCallStore";
import { useSyncExternalStore } from "react";

export const useCallMembers = () => {
  const isGroupCall = useCallStore((state) => state.isGroupCall);

  const sfuMembers = useSyncExternalStore(
    (callback) => useSFUCallStore.subscribe(callback),
    () => useSFUCallStore.getState().sfuMembers
  );

  const p2pMembers = useSyncExternalStore(
    (callback) => useP2PCallStore.subscribe(callback),
    () => useP2PCallStore.getState().p2pMembers
  );

  return isGroupCall ? sfuMembers : p2pMembers;
};
