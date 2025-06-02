import { useEffect } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useCurrentUser } from "@/stores/authStore";
import { Avatar } from "../../ui/avatar/Avatar";
import { useFriendshipStore } from "@/stores/friendshipStore";
import ThemeSwitcher from "../../ui/ThemeSwitcher";
import { SidebarMode } from "@/types/enums/sidebarMode";

const SidebarMore: React.FC = () => {
  const currentUser = useCurrentUser();
  const { setSidebar, isCompact, toggleCompact } = useSidebarStore();
  const { receivedRequests, sentRequests } = useFriendshipStore();
  const requestsCount = receivedRequests.length + sentRequests.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`") {
        e.preventDefault();
        toggleCompact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCompact]);

  const sidebarButtons = [
    {
      icon: "bookmark",
      text: "Saved Messages",
      onClick: () => setSidebar(SidebarMode.SAVED_MESSAGES),
    },
    { type: "divider" }, // This will render the border divider
    {
      icon: "call",
      text: "Calls",
      onClick: () => setSidebar(SidebarMode.CALLS),
    },
    {
      icon: "contacts",
      text: "Contacts",
      onClick: () => setSidebar(SidebarMode.CONTACTS),
    },
    {
      icon: "person_add",
      text: `Friend requests ${requestsCount > 0 ? requestsCount : ""}`,
      onClick: () => setSidebar(SidebarMode.FRIEND_REQUESTS),
    },
    { type: "divider" }, // Another divider
    {
      icon: "folder",
      text: "Folders",
      onClick: () => setSidebar(SidebarMode.FOLDERS),
    },
    {
      icon: "lock",
      text: "Private",
      onClick: () => setSidebar(SidebarMode.PRIVATE_CHATS),
    },
    {
      icon: "block",
      text: "Blocked",
      onClick: () => setSidebar(SidebarMode.BLOCKED_USERS),
    },
  ];

  return (
    <aside
      className={`relative h-full flex flex-col justify-between transition-all duration-300 ease-in-out
        ${
          isCompact
            ? "w-[var(--sidebar-width-small)]"
            : "w-[var(--sidebar-width)]"
        }`}
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
        <div className="w-16 h-16">
          <Avatar
            avatarUrl={currentUser?.avatarUrl}
            firstName={currentUser?.firstName}
            lastName={currentUser?.lastName}
            size="16"
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
            <p className="whitespace-nowrap text-ellipsis">Settings</p>
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
