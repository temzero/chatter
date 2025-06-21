import { useSidebarStore } from "@/stores/sidebarStore";
import { useCurrentUser, useAuthStore } from "@/stores/authStore";
import ContactInfoItem from "../ui/contactInfoItem";
import { Avatar } from "../ui/avatar/Avatar";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SidebarLayout from "@/pages/SidebarLayout";

const SidebarProfile: React.FC = () => {
  const currentUser = useCurrentUser();
  const { setSidebar } = useSidebarStore();
  const logout = useAuthStore((state) => state.logout);

  return (
    <SidebarLayout
      title="My Profile"
      rightButton={
        <i
          className="material-symbols-outlined nav-btn"
          onClick={() => setSidebar(SidebarMode.PROFILE_EDIT)}
        >
          edit
        </i>
      }
    >
      {/* User Info */}
      <div className="overflow-y-auto flex-1 h-full">
        <div className="flex flex-col items-center p-4 gap-2 w-full">
          {currentUser && (
            <Avatar
              avatarUrl={currentUser.avatarUrl}
              name={currentUser.firstName}
              size="36"
            />
          )}

          <h1 className="text-xl font-semibold">
            {currentUser?.firstName} {currentUser?.lastName}
          </h1>

          <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
            {currentUser?.bio || ""}
          </p>

          <div className="w-full flex flex-col font-light my-2 custom-border-t custom-border rounded">
            <div>
              <ContactInfoItem
                icon="alternate_email"
                value={currentUser?.username}
                copyType="username"
                defaultText="No username"
              />

              <ContactInfoItem
                icon="call"
                value={currentUser?.phoneNumber}
                copyType="phone"
              />

              <ContactInfoItem
                icon="mail"
                value={currentUser?.email}
                copyType="email"
              />

              <ContactInfoItem
                icon="cake"
                value={currentUser?.birthday}
                copyType="birthday"
              />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 flex items-center justify-center custom-border-t hover:bg-[var(--hover-color)] gap-2 p-2 cursor-pointer w-full text-red-400"
          onClick={logout}
        >
          <h1 className="text-xl">Logout</h1>
          <i className="material-symbols-outlined cursor-pointer">logout</i>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarProfile;
