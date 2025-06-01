// import SidebarDefault from "@/components/sidebar/SidebarDefault";
// import SidebarSearch from "@/components/sidebar/SidebarSearch";
// import SidebarNewChat from "@/components/sidebar/SidebarNewChat";
// import SidebarMore from "@/components/sidebar/more/SidebarMore";
// import SidebarProfile from "@/components/sidebar/SidebarProfile";
// import SidebarProfileEdit from "@/components/sidebar/SidebarProfileEdit";
// import SidebarSettings from "@/components/sidebar/settings/SidebarSettings";
// import SidebarSettingsAccount from "./settings/SidebarSettingsAccount";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCurrentSidebar } from "@/stores/sidebarStore";
// import SidebarFriendRequests from "./more/SidebarFriendRequests";
// import SidebarSavedMessages from "./more/SidebarSavedMessages";
// import SidebarCall from "./more/SidebarCall";
// import SidebarContacts from "./more/SidebarContacts";
// import SidebarFolders from "./more/SidebarFolders";
// import SidebarPrivate from "./more/SidebarPrivate";
// import SidebarBlocked from "./more/SidebarBlocked";
// import SidebarSettingsTheme from "./settings/sidebarSettingTheme";

// const Sidebar = () => {
//   const currentSidebar = useCurrentSidebar();

//   const sidebars = {
//     default: <SidebarDefault />,
//     newChat: <SidebarNewChat />,
//     search: <SidebarSearch />,
//     more: <SidebarMore />,

//     profile: <SidebarProfile />,
//     profileEdit: <SidebarProfileEdit />,
//     savedMessages: <SidebarSavedMessages />,
//     call: <SidebarCall />,
//     contacts: <SidebarContacts />,
//     friendRequests: <SidebarFriendRequests />,
//     folders: <SidebarFolders />,
//     private: <SidebarPrivate />,
//     blocked: <SidebarBlocked />,

//     settings: <SidebarSettings />,
//     settingsAccount: <SidebarSettingsAccount />,
//     settingsTheme: <SidebarSettingsTheme />
//   };

//   // Define different animations for each sidebar
//   const animations = {
//     default: {
//       initial: { opacity: 0, scale: 0.9 },
//       animate: {
//         opacity: 1,
//         scale: 1,
//         transition: { duration: 0.2, ease: "easeOut" },
//       },
//       exit: {
//         opacity: 0,
//         transition: {
//           duration: 0,
//         },
//       },
//     },
//     search: {
//       initial: { opacity: 0, y: 400 },
//       animate: {
//         opacity: 1,
//         y: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },
//       exit: {
//         opacity: 0,
//         y: 400,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//     newChat: {
//       initial: { opacity: 0, y: 400 },
//       animate: {
//         opacity: 1,
//         y: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },
//       exit: {
//         opacity: 0,
//         y: 400,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//     fallback: {
//       initial: { opacity: 0, x: -300 },
//       animate: {
//         opacity: 1,
//         x: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },

//       exit: {
//         opacity: 0,
//         x: -300,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//   };

//   // Get the animations for the current sidebar or use fallback
//   const CurrentComponent = sidebars[currentSidebar] || null;
//   const currentAnimation =
//     animations[currentSidebar as keyof typeof animations] ||
//     animations.fallback;

//   return (
//     <div className="bg-[var(--sidebar-color)] h-full flex flex-col shadow border-[var(--border-color)] border-r-2 transition-all duration-300 ease-in-out z-50">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentSidebar}
//           initial={currentAnimation.initial}
//           animate={currentAnimation.animate}
//           exit={currentAnimation.exit}
//           className="h-full"
//         >
//           {CurrentComponent}
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Sidebar;


// import SidebarDefault from "@/components/sidebar/SidebarDefault";
// import SidebarSearch from "@/components/sidebar/SidebarSearch";
// import SidebarNewChat from "@/components/sidebar/SidebarNewChat";
// import SidebarMore from "@/components/sidebar/more/SidebarMore";
// import SidebarProfile from "@/components/sidebar/SidebarProfile";
// import SidebarProfileEdit from "@/components/sidebar/SidebarProfileEdit";
// import SidebarSettings from "@/components/sidebar/settings/SidebarSettings";
// import SidebarSettingsAccount from "./settings/SidebarSettingsAccount";
// import SidebarSettingsPassword from "./settings/SidebarSettingsPassword";
// import SidebarSettingsPrivacy from "./settings/SidebarSettingsPrivacy";
// import SidebarSettingsTheme from "./settings/SidebarSettingsTheme";
// import SidebarSettingsDisplay from "./settings/SidebarSettingsDisplay";
// import SidebarSettingsKeyboard from "./settings/SidebarSettingsKeyboard";
// import SidebarSettingsMessages from "./settings/SidebarSettingsMessages";
// import SidebarSettingsFolders from "./settings/SidebarSettingsFolders";
// import SidebarSettingsNotifications from "./settings/SidebarSettingsNotifications";
// import SidebarSettingsDataStorage from "./settings/SidebarSettingsDataStorage";
// import SidebarSettingsLanguage from "./settings/SidebarSettingsLanguage";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCurrentSidebar } from "@/stores/sidebarStore";
// import SidebarFriendRequests from "./more/SidebarFriendRequests";
// import SidebarSavedMessages from "./more/SidebarSavedMessages";
// import SidebarCalls from "./more/SidebarCalls";
// import SidebarContacts from "./more/SidebarContacts";
// import SidebarFolders from "./more/SidebarFolders";
// import SidebarPrivateChats from "./more/SidebarPrivateChats";
// import SidebarBlockedUsers from "./more/SidebarBlockedUsers";
// import { SidebarMode } from "@/types/sidebar";

// const Sidebar = () => {
//   const currentSidebar = useCurrentSidebar();

//   const sidebars: Record<SidebarMode, JSX.Element> = {
//     [SidebarMode.DEFAULT]: <SidebarDefault />,
//     [SidebarMode.NEW_CHAT]: <SidebarNewChat />,
//     [SidebarMode.SEARCH]: <SidebarSearch />,
//     [SidebarMode.MORE]: <SidebarMore />,

//     // More tab
//     [SidebarMode.PROFILE]: <SidebarProfile />,
//     [SidebarMode.PROFILE_EDIT]: <SidebarProfileEdit />,
//     [SidebarMode.SAVED_MESSAGES]: <SidebarSavedMessages />,
//     [SidebarMode.CALLS]: <SidebarCalls />,
//     [SidebarMode.CONTACTS]: <SidebarContacts />,
//     [SidebarMode.FRIEND_REQUESTS]: <SidebarFriendRequests />,
//     [SidebarMode.FOLDERS]: <SidebarFolders />,
//     [SidebarMode.PRIVATE_CHATS]: <SidebarPrivateChats />,
//     [SidebarMode.BLOCKED_USERS]: <SidebarBlockedUsers />,

//     // Settings
//     [SidebarMode.SETTINGS]: <SidebarSettings />,
//     [SidebarMode.SETTINGS_ACCOUNT]: <SidebarSettingsAccount />,
//     [SidebarMode.SETTINGS_PASSWORD]: <SidebarSettingsPassword />,
//     [SidebarMode.SETTINGS_PRIVACY]: <SidebarSettingsPrivacy />,
//     [SidebarMode.SETTINGS_THEME]: <SidebarSettingsTheme />,
//     [SidebarMode.SETTINGS_DISPLAY]: <SidebarSettingsDisplay />,
//     [SidebarMode.SETTINGS_KEYBOARD]: <SidebarSettingsKeyboard />,
//     [SidebarMode.SETTINGS_MESSAGES]: <SidebarSettingsMessages />,
//     [SidebarMode.SETTINGS_FOLDERS]: <SidebarSettingsFolders />,
//     [SidebarMode.SETTINGS_NOTIFICATIONS]: <SidebarSettingsNotifications />,
//     [SidebarMode.SETTINGS_DATA_STORAGE]: <SidebarSettingsDataStorage />,
//     [SidebarMode.SETTINGS_LANGUAGE]: <SidebarSettingsLanguage />,
//   };

//   // Define different animations for each sidebar
//   const animations = {
//     [SidebarMode.DEFAULT]: {
//       initial: { opacity: 0, scale: 0.9 },
//       animate: {
//         opacity: 1,
//         scale: 1,
//         transition: { duration: 0.2, ease: "easeOut" },
//       },
//       exit: {
//         opacity: 0,
//         transition: {
//           duration: 0,
//         },
//       },
//     },
//     [SidebarMode.SEARCH]: {
//       initial: { opacity: 0, y: 400 },
//       animate: {
//         opacity: 1,
//         y: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },
//       exit: {
//         opacity: 0,
//         y: 400,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//     [SidebarMode.NEW_CHAT]: {
//       initial: { opacity: 0, y: 400 },
//       animate: {
//         opacity: 1,
//         y: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },
//       exit: {
//         opacity: 0,
//         y: 400,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//     fallback: {
//       initial: { opacity: 0, x: -300 },
//       animate: {
//         opacity: 1,
//         x: 0,
//         transition: {
//           type: "spring",
//           stiffness: 300,
//           damping: 28,
//           bounce: 0.2,
//         },
//       },
//       exit: {
//         opacity: 0,
//         x: -300,
//         transition: {
//           duration: 0.2,
//         },
//       },
//     },
//   };

//   // Get the animations for the current sidebar or use fallback
//   const CurrentComponent = sidebars[currentSidebar] || null;
//   const currentAnimation =
//     animations[currentSidebar as unknown as keyof typeof animations] ||
//     animations.fallback;

//   return (
//     <div className="bg-[var(--sidebar-color)] h-full flex flex-col shadow border-[var(--border-color)] border-r-2 transition-all duration-300 ease-in-out z-50">
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentSidebar}
//           initial={currentAnimation.initial}
//           animate={currentAnimation.animate}
//           exit={currentAnimation.exit}
//           className="h-full"
//         >
//           {CurrentComponent}
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Sidebar;
