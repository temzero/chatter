// import { motion, AnimatePresence } from "framer-motion";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import React from "react";

// const ChatSidebar = React.memo(() => {
//   const isChatInfoVisible = useSidebarInfoVisibility();

//   return (
//     <AnimatePresence>
//       {isChatInfoVisible && (
//         <motion.div
//           key={`sidebar-${isChatInfoVisible}`}
//           initial={{ opacity: 0, x: 300, width: 0 }}
//           animate={{ opacity: 1, x: 0, width: "var(--sidebar-width)" }}
//           exit={{ opacity: 0, x: 300, width: 0 }}
//           transition={{ duration: 0.2, ease: "easeInOut" }}
//           className="overflow-hidden" // Prevent content overflow during animation
//         >
//           <SidebarInfo />
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// });

const ChatSidebar = React.memo(() => {
  const isChatInfoVisible = useSidebarInfoVisibility();

  return isChatInfoVisible ? (
    <div className="w-[var(--sidebar-width)]">
      <SidebarInfo />
    </div>
  ) : null;
});

export default ChatSidebar;
