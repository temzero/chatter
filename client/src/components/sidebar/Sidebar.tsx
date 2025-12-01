import { JSX, lazy } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { sidebarAnimations } from "@/common/animations/sidebarAnimations";
import { useSidebarWidth } from "@/common/hooks/useSidebarWidth";

import SidebarDefault from "@/components/sidebar/SidebarDefault";
import SidebarWellCome from "@/components/sidebar/SidebarWellCome";
import SidebarSearch from "@/components/sidebar/SidebarSearch";
import SidebarNewChat from "@/components/sidebar/SidebarNewChat";
import SidebarMore from "@/components/sidebar/more/SidebarMore";

const SidebarProfile = lazy(
  () => import("@/components/sidebar/SidebarProfile")
);
const SidebarProfileEdit = lazy(
  () => import("@/components/sidebar/SidebarProfileEdit")
);
const SidebarSettings = lazy(
  () => import("@/components/sidebar/settings/SidebarSettings")
);
const SidebarSettingsAccount = lazy(
  () => import("./settings/account/SidebarSettingsAccount")
);
const SidebarSettingsPassword = lazy(
  () => import("./settings/account/sidebarSettingsPassword")
);
const SidebarSettingsPrivacy = lazy(
  () => import("./settings/sidebarSettingsPrivacy")
);
const SidebarSettingsTheme = lazy(
  () => import("./settings/sidebarSettingsTheme")
);
const SidebarSettingsDisplay = lazy(
  () => import("./settings/sidebarSettingsDisplay")
);
const SidebarSettingsKeyboard = lazy(
  () => import("./settings/sidebarSettingsKeyboard")
);
const SidebarSettingsMessages = lazy(
  () => import("./settings/sidebarSettingsMessages")
);
const SidebarSettingsFolders = lazy(
  () => import("./settings/sidebarSettingsFolders")
);
const SidebarSettingsNotifications = lazy(
  () => import("./settings/sidebarSettingsNotifications")
);
const SidebarSettingsData = lazy(
  () => import("./settings/sidebarSettingsData")
);
const SidebarSettingsLanguage = lazy(
  () => import("./settings/sidebarSettingsLanguage")
);
const SidebarFriendRequests = lazy(
  () => import("./more/SidebarFriendRequests")
);
const SidebarCalls = lazy(() => import("./more/sidebarCalls/SidebarCalls"));
const SidebarContacts = lazy(() => import("./more/SidebarContacts"));
const SidebarFolders = lazy(
  () => import("./more/sidebarFolders/SidebarFolders")
);
const SidebarFolder = lazy(() => import("./more/sidebarFolders/SidebarFolder"));
const SidebarBlockedUsers = lazy(() => import("./more/SidebarBlockedUsers"));
const SidebarSettingsEmail = lazy(
  () => import("./settings/account/sidebarSettingsEmail")
);
const SidebarSettingsUsername = lazy(
  () => import("./settings/account/sidebarSettingsUsername")
);
const SidebarSettingsPhoneNumber = lazy(
  () => import("./settings/account/sidebarSettingsPhoneNumber")
);
const SidebarNewFolder = lazy(() => import("./more/SidebarNewFolder"));

const Sidebar = () => {
  console.log("[MOUNTED]", "Sidebar");
  const currentSidebar = useCurrentSidebar();
  const sidebarWidthClass = useSidebarWidth();

  const sidebars: Record<SidebarMode, JSX.Element> = {
    [SidebarMode.DEFAULT]: <SidebarDefault />,
    [SidebarMode.WELL_COME]: <SidebarWellCome />,
    [SidebarMode.NEW_CHAT]: <SidebarNewChat />,
    [SidebarMode.SEARCH]: <SidebarSearch />,
    [SidebarMode.MORE]: <SidebarMore />,

    // More tab
    [SidebarMode.PROFILE]: <SidebarProfile />,
    [SidebarMode.PROFILE_EDIT]: <SidebarProfileEdit />,
    [SidebarMode.CALLS]: <SidebarCalls />,
    [SidebarMode.CONTACTS]: <SidebarContacts />,
    [SidebarMode.FRIEND_REQUESTS]: <SidebarFriendRequests />,
    [SidebarMode.FOLDERS]: <SidebarFolders />,
    [SidebarMode.FOLDER]: <SidebarFolder />,
    [SidebarMode.NEW_FOLDER]: <SidebarNewFolder />,
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
    sidebarAnimations[
      currentSidebar as unknown as keyof typeof sidebarAnimations
    ] || sidebarAnimations.fallback;

  return (
    <div
      className={clsx(
        "h-full overflow-hidden flex flex-col bg-(--sidebar-color) shadow border-(--border-color) border-r-2 transition-all duration-300 ease-in-out select-none",
        sidebarWidthClass
      )}
      style={{ zIndex: 10 }}
    >
      <AnimatePresence mode="wait">
        <motion.div key={currentSidebar} {...animation} className="h-full">
          {CurrentComponent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
