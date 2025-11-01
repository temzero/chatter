import { getSetSidebar, useIsCompactSidebar } from "@/stores/sidebarStore";
import { getCurrentUser } from "@/stores/authStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useSetActiveSavedChat } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import ThemeSwitcher from "@/components/ui/buttons/ThemeSwitcher";

const SidebarMore: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const isCompact = useIsCompactSidebar();
  const setSidebar = getSetSidebar();

  const pendingRequests = useFriendshipStore((state) => state.pendingRequests);
  const requestsCount = pendingRequests.length;
  const setActiveSavedChat = useSetActiveSavedChat();

  const sidebarButtons = [
    {
      icon: "bookmark",
      text: t("sidebar.saved_messages"),
      onClick: () => setActiveSavedChat(),
    },
    { type: "divider" },
    {
      icon: "call",
      text: t("sidebar.calls"),
      onClick: () => setSidebar(SidebarMode.CALLS),
    },
    {
      icon: "contacts",
      text: t("sidebar.contacts"),
      onClick: () => setSidebar(SidebarMode.CONTACTS),
    },
    {
      icon: "person_add",
      text:
        requestsCount > 0
          ? t("sidebar.friend_requests", { count: requestsCount }) // show number if >0
          : t("sidebar.friend_requests_none"), // fallback text when 0
      onClick: () => setSidebar(SidebarMode.FRIEND_REQUESTS),
    },
    { type: "divider" },
    {
      icon: "folder",
      text: t("sidebar.folders"),
      onClick: () => setSidebar(SidebarMode.FOLDERS),
    },
    {
      icon: "block",
      text: t("sidebar.blocked"),
      onClick: () => setSidebar(SidebarMode.BLOCKED_USERS),
    },
  ];

  return (
    <aside
      className={`relative h-full w-full flex flex-col justify-between transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
        <i
          className="material-symbols-outlined nav-btn"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          arrow_back
        </i>

        <i
          className="material-symbols-outlined nav-btn ml-auto"
          onClick={() => setSidebar(SidebarMode.DEFAULT)}
        >
          close
        </i>
      </header>

      {/* User Info */}
      <div
        className="flex items-center p-4 gap-4 w-full custom-border-b cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebar(SidebarMode.PROFILE)}
      >
        <div className="relative w-16 h-16">
          <Avatar
            avatarUrl={currentUser?.avatarUrl}
            name={currentUser?.firstName}
            size={16}
          />
        </div>

        {isCompact || (
          <div className="flex flex-col font-light min-w-60">
            <h1 className="font-semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            <a>{currentUser?.phoneNumber}</a>
          </div>
        )}
      </div>

      <div className="overflow-x-hidden overflow-y-auto">
        {sidebarButtons.map((button, index) =>
          button.type === "divider" ? (
            <div
              key={`divider-${index}`}
              className="border-b-[6px] custom-border-b"
            ></div>
          ) : (
            <div
              key={button.text}
              className={`sidebar-button ${isCompact ? "justify-center" : ""}`}
              onClick={button.onClick || undefined}
            >
              <div className="flex items-center justify-center h-10 w-10">
                <i className="material-symbols-outlined text-3xl">
                  {button.icon}
                </i>
              </div>
              {isCompact || (
                <p className="whitespace-nowrap text-ellipsis">{button.text}</p>
              )}
            </div>
          )
        )}
      </div>

      <div
        className={`w-full flex custom-border-t backdrop-blur-[20px] shadow mt-auto ${
          isCompact ? "justify-center" : "justify-between"
        }`}
      >
        <div
          className={`flex items-center cursor-pointer hover:bg-[var(--hover-color)] w-full p-1 px-4 ${
            isCompact ? "justify-center" : "gap-3"
          }`}
          onClick={() => setSidebar(SidebarMode.SETTINGS)}
        >
          <div className="flex items-center justify-center h-10 w-10">
            <i className="material-symbols-outlined text-3xl">settings</i>
          </div>
          {!isCompact && (
            <p className="whitespace-nowrap text-ellipsis">
              {t("sidebar.settings")}
            </p>
          )}
        </div>

        {!isCompact && (
          <div className=" flex items-center justify-center px-2">
            <ThemeSwitcher />
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarMore;
