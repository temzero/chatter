// SidebarContacts.tsx
import React from "react";
import SidebarLayout from "@/layouts/SidebarLayout";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useFriendContacts } from "@/common/hooks/useFriendContacts";
import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
import { useTranslation } from "react-i18next";

interface SidebarContactsProps {
  onVideoCall?: (phoneNumber: string) => void;
  onAudioCall?: (phoneNumber: string) => void;
}

interface ContactItemProps {
  contact: FriendContactResponse;
  onVideoCall?: (phoneNumber: string) => void;
  onAudioCall?: (phoneNumber: string) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  onVideoCall,
  onAudioCall,
}) => {
  const { t } = useTranslation();
  const handleVideoCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact?.phoneNumber) {
      onVideoCall?.(contact.phoneNumber);
    }
  };

  const handleAudioCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact?.phoneNumber) {
      onAudioCall?.(contact.phoneNumber);
    }
  };

  return (
    <div className="flex gap-3 items-center justify-between custom-border-b p-3 hover:bg-[var(--hover-color)] cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar
          avatarUrl={contact.avatarUrl}
          name={contact.firstName}
          size={10}
        />
        <h1 className="font-medium">
          {contact.firstName} {contact.lastName}
        </h1>
      </div>
      <div className="flex gap-2 items-center">
        {contact?.phoneNumber && (
          <>
            <button
              className="opacity-60 hover:opacity-100 hover:text-green-500"
              onClick={handleVideoCall}
              title={t("sidebar_contacts.video_call")}
            >
              <i className="material-symbols-outlined">videocam</i>
            </button>
            <button
              className="opacity-60 hover:opacity-100 hover:text-green-500"
              onClick={handleAudioCall}
              title={t("sidebar_contacts.audio_call")}
            >
              <i className="material-symbols-outlined">phone_enabled</i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SidebarContacts: React.FC<SidebarContactsProps> = ({
  onVideoCall,
  onAudioCall,
}) => {
  const { t } = useTranslation();
  const { contacts: friendContacts, loading } = useFriendContacts();

  return (
    <SidebarLayout title={t("sidebar_contacts.title")}>
      {loading ? (
        <div className="text-center py-4 text-gray-400">
          {t("common.loading.loading")}
        </div>
      ) : friendContacts.length > 0 ? (
        friendContacts.map((contact) => (
          <ContactItem
            key={contact.userId}
            contact={contact}
            onVideoCall={onVideoCall}
            onAudioCall={onAudioCall}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center mt-8 opacity-60">
          <i className="material-symbols-outlined text-6xl mb-4">contacts</i>
          <p>{t("sidebar_contacts.no_contacts")}</p>
        </div>
      )}
    </SidebarLayout>
  );
};

export default SidebarContacts;
