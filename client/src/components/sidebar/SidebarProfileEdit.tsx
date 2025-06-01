import { useState, useEffect, useMemo } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useCurrentUser } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import AvatarEdit from "../ui/avatar/AvatarEdit";
import { storageService } from "@/services/storageService";
import { SidebarMode } from "@/types/enums/sidebarMode";
import SidebarLayout from "@/pages/SidebarLayout";

export interface ProfileFormData {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  birthday: string | Date | undefined;
  bio: string;
}

const SidebarProfileEdit: React.FC = () => {
  const currentUser = useCurrentUser();
  const { updateProfile } = useProfileStore();
  const { setSidebar } = useSidebarStore();

  const initialFormData = useMemo<ProfileFormData>(
    () => ({
      avatarUrl: currentUser?.avatarUrl || "",
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      birthday: currentUser?.birthday ?? undefined,
      bio: currentUser?.bio || "",
    }),
    [currentUser]
  );

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const changesDetected =
      Object.keys(initialFormData).some(
        (key) =>
          formData[key as keyof ProfileFormData] !==
          initialFormData[key as keyof ProfileFormData]
      ) || avatarFile !== null;
    setHasChanges(changesDetected);
  }, [formData, initialFormData, avatarFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (newAvatar: string, file?: File) => {
    setFormData((prev) => ({ ...prev, avatarUrl: newAvatar }));
    setAvatarFile(file || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    setIsSubmitting(true);
    setError("");

    try {
      let newAvatarUrl = formData.avatarUrl;
      if (avatarFile) {
        const oldAvatarUrl = currentUser?.avatarUrl || "";
        newAvatarUrl = await storageService.uploadAvatar(
          avatarFile,
          oldAvatarUrl
        );
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      }
      await updateProfile({ ...formData, avatarUrl: newAvatarUrl });
      setSidebar(SidebarMode.PROFILE);
    } catch (error) {
      setError("Failed to update profile!");
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rightButton = (
    <div className="flex gap-1">
      {hasChanges && (
        <button
          className={`flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <i className="material-symbols-outlined text-3xl animate-spin">
              progress_activity
            </i>
          ) : (
            <i className="material-symbols-outlined text-3xl">check</i>
          )}
        </button>
      )}
      <button
        className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)] mr-1"
        onClick={() => setSidebar(SidebarMode.DEFAULT)}
      >
        <i className="material-symbols-outlined">close</i>
      </button>
    </div>
  );

  return (
    <SidebarLayout
      title="Edit Profile"
      backLocation={SidebarMode.PROFILE}
      rightButton={rightButton}
    >
      {error && (
        <div className="text-red-500 text-center mt-2">
          <p>{error}</p>
        </div>
      )}

      <form
        className="p-4 flex-1 flex flex-col"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          <AvatarEdit
            avatarUrl={formData.avatarUrl}
            onAvatarChange={handleAvatarChange}
          />

          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input text-lg"
                placeholder="First Name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input text-lg"
                placeholder="Last Name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">
                Birthday (Month/Date/Year)
              </label>
              <input
                type="date"
                name="birthday"
                value={
                  formData.birthday
                    ? formData.birthday instanceof Date
                      ? formData.birthday.toISOString().slice(0, 10)
                      : new Date(formData.birthday).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthday: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
                className="input text-lg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input min-h-[120px]"
                placeholder="Describe something about yourself"
                maxLength={150}
              />
              <span className="text-xs opacity-50 text-right">
                {formData.bio.length}/150
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full flex gap-2 justify-center items-center cursor-pointer p-2 text-blue-500 custom-border-t mt-auto"
          onClick={() => setSidebar(SidebarMode.SETTINGS_ACCOUNT)}
        >
          <i className="material-symbols-outlined">person</i>
          <span>Account Settings</span>
        </div>
      </form>
    </SidebarLayout>
  );
};

export default SidebarProfileEdit;
