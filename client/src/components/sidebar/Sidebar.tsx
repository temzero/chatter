import SidebarDefault from "@/components/sidebar/SidebarDefault";
import SidebarSearch from "@/components/sidebar/SidebarSearch";
import SidebarNewChat from "@/components/sidebar/SidebarNewChat";
import SidebarMore from "@/components/sidebar/more/SidebarMore";
import SidebarProfile from "@/components/sidebar/SidebarProfile";
import SidebarProfileEdit from "@/components/sidebar/SidebarProfileEdit";
import SidebarSettings from "@/components/sidebar/settings/SidebarSettings";
import SidebarSettingsAccount from "./settings/account/SidebarSettingsAccount";
import SidebarSettingsPassword from "./settings/account/sidebarSettingsPassword";
import SidebarSettingsPrivacy from "./settings/sidebarSettingsPrivacy";
import SidebarSettingsTheme from "./settings/sidebarSettingsTheme";
import SidebarSettingsDisplay from "./settings/sidebarSettingsDisplay";
import SidebarSettingsKeyboard from "./settings/sidebarSettingsKeyboard";
import SidebarSettingsMessages from "./settings/sidebarSettingsMessages";
import SidebarSettingsFolders from "./settings/sidebarSettingsFolders";
import SidebarSettingsNotifications from "./settings/sidebarSettingsNotifications";
import SidebarSettingsData from "./settings/sidebarSettingsData";
import SidebarSettingsLanguage from "./settings/sidebarSettingsLanguage";
import SidebarFriendRequests from "./more/SidebarFriendRequests";
import SidebarSavedMessages from "./more/SidebarSavedMessages";
import SidebarCalls from "./more/SidebarCalls";
import SidebarContacts from "./more/SidebarContacts";
import SidebarFolders from "./more/SidebarFolders";
import SidebarBlockedUsers from "./more/SidebarBlockedUsers";
import SidebarPrivateChats from "./more/SidebarPrivateChats";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/types/enums/sidebarMode";
import { JSX } from "react";
import { sidebarAnimations } from "@/animations/sidebarAnimations";
import SidebarSettingsEmail from "./settings/account/sidebarSettingsEmail";
import SidebarSettingsUsername from "./settings/account/sidebarSettingsUsername";
import SidebarSettingsPhoneNumber from "./settings/account/sidebarSettingsPhoneNumber";

const Sidebar = () => {
  const currentSidebar = useCurrentSidebar();

  const sidebars: Record<SidebarMode, JSX.Element> = {
    [SidebarMode.DEFAULT]: <SidebarDefault />,
    [SidebarMode.NEW_CHAT]: <SidebarNewChat />,
    [SidebarMode.SEARCH]: <SidebarSearch />,
    [SidebarMode.MORE]: <SidebarMore />,

    // More tab
    [SidebarMode.PROFILE]: <SidebarProfile />,
    [SidebarMode.PROFILE_EDIT]: <SidebarProfileEdit />,
    [SidebarMode.SAVED_MESSAGES]: <SidebarSavedMessages />,
    [SidebarMode.CALLS]: <SidebarCalls />,
    [SidebarMode.CONTACTS]: <SidebarContacts />,
    [SidebarMode.FRIEND_REQUESTS]: <SidebarFriendRequests />,
    [SidebarMode.FOLDERS]: <SidebarFolders />,
    [SidebarMode.PRIVATE_CHATS]: <SidebarPrivateChats />,
    [SidebarMode.BLOCKED_USERS]: <SidebarBlockedUsers />,

    // Settings
    [SidebarMode.SETTINGS]: <SidebarSettings />,
    [SidebarMode.SETTINGS_ACCOUNT]: <SidebarSettingsAccount />,
    [SidebarMode.SETTINGS_PASSWORD]: <SidebarSettingsPassword />,
    [SidebarMode.SETTINGS_PRIVACY]: <SidebarSettingsPrivacy />,
    [SidebarMode.SETTINGS_EMAIL]: <SidebarSettingsEmail />,
    [SidebarMode.SETTINGS_USERNAME]: <SidebarSettingsUsername />,
    [SidebarMode.SETTINGS_PHONE]: <SidebarSettingsPhoneNumber />,

    // settings
    [SidebarMode.SETTINGS_THEME]: <SidebarSettingsTheme />,
    [SidebarMode.SETTINGS_DISPLAY]: <SidebarSettingsDisplay />,
    [SidebarMode.SETTINGS_KEYBOARD]: <SidebarSettingsKeyboard />,
    [SidebarMode.SETTINGS_MESSAGES]: <SidebarSettingsMessages />,
    [SidebarMode.SETTINGS_FOLDERS]: <SidebarSettingsFolders />,
    [SidebarMode.SETTINGS_NOTIFICATIONS]: <SidebarSettingsNotifications />,
    [SidebarMode.SETTINGS_DATA_STORAGE]: <SidebarSettingsData />,
    [SidebarMode.SETTINGS_LANGUAGE]: <SidebarSettingsLanguage />,
  };

  // Get the animations for the current sidebar or use fallback
  const CurrentComponent = sidebars[currentSidebar] || null;
  const animation =
    sidebarAnimations[currentSidebar as unknown as keyof typeof sidebarAnimations] ||
    sidebarAnimations.fallback;

  return (
    <div className="bg-[var(--sidebar-color)] h-full flex flex-col shadow border-[var(--border-color)] border-r-2 transition-all duration-300 ease-in-out z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSidebar}
          {...animation}
          className="h-full"
        >
          {CurrentComponent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
