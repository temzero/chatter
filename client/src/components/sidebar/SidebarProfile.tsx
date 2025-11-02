import { getSetSidebar, useIsCompactSidebar } from "@/stores/sidebarStore";
import { useAuthStore, getCurrentUser } from "@/stores/authStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { useTranslation } from "react-i18next";
import ContactInfoItem from "@/components/ui/contact/contactInfoItem";
import SidebarLayout from "@/layouts/SidebarLayout";

const SidebarProfile: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const isCompact = useIsCompactSidebar();
  const setSidebar = getSetSidebar();
  const logout = useAuthStore.getState().logout;

  return (
    <SidebarLayout
      title={isCompact ? "" : t("sidebar_profile.title")}
      rightButton={
        !isCompact && (
          <i
            title={t("sidebar_profile.edit_tooltip")}
            className="material-symbols-outlined nav-btn"
            onClick={() => setSidebar(SidebarMode.PROFILE_EDIT)}
          >
            edit
          </i>
        )
      }
    >
      {/* User Info */}
      <div className="overflow-y-auto flex-1 h-full overflow-x-hidden">
        <div className="flex flex-col items-center p-4 gap-2 w-full">
          {currentUser && (
            <Avatar
              avatarUrl={currentUser.avatarUrl}
              name={currentUser.firstName}
              size={isCompact ? 16 : 36}
            />
          )}

          <h1 className="font-semibold text-xl">
            {isCompact
              ? "You"
              : `${currentUser?.firstName} ${currentUser?.lastName}`}
          </h1>

          {!isCompact && (
            <>
              <p className="text-sm text-center font-light opacity-80 w-full min-w-[240px] text-ellipsis">
                {currentUser?.bio || ""}
              </p>

              <div className="w-full flex flex-col font-light my-2 custom-border-t custom-border rounded">
                <div>
                  <ContactInfoItem
                    icon="alternate_email"
                    value={currentUser?.username}
                    copyType="username"
                    defaultText={t("sidebar_profile.no_username")}
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
            </>
          )}
        </div>

        <div
          title={t("common.actions.logout")}
          className="absolute bottom-0 flex items-center justify-center custom-border-t hover:bg-[var(--hover-color)] gap-2 p-2 cursor-pointer w-full text-red-400"
          onClick={logout}
        >
          {!isCompact && (
            <h1 className="text-xl">{t("common.actions.logout")}</h1>
          )}
          <i className="material-symbols-outlined cursor-pointer">logout</i>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SidebarProfile;
