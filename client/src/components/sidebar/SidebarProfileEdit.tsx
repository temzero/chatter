import { useState, useEffect, useMemo } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useCurrentUser } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import AvatarEdit from "../ui/avatar/AvatarEdit";
import { userService } from "@/services/userService";
import { uploadService } from "@/services/uploadService";

export interface ProfileFormData {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  birthday: string | Date | undefined;
  bio: string;
}

const SidebarProfileEdit: React.FC = () => {
  const currentUser = useCurrentUser();
  console.log("Current User in Profile Edit:", currentUser);
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

  // Check for changes including the avatar file
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
      // If avatar file changed, upload it first
      if (avatarFile) {
        // Keep old avatar URL for deletion later
        const oldAvatarUrl = currentUser?.avatarUrl || "";

        // Upload new avatar
        const uploadResult = await userService.uploadAvatar(avatarFile);
        newAvatarUrl =
          typeof uploadResult === "string" ? uploadResult : uploadResult.url;

        // Delete old avatar if it exists and is different from the new one
        if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
          try {
            console.log("Deleting old avatar:", oldAvatarUrl);
            await uploadService.deleteImage(oldAvatarUrl); // You need to implement this method in userService
          } catch (deleteError) {
            console.warn("Failed to delete old avatar:", deleteError);
            // You may decide whether to continue or fail here — typically continue is fine
          }
        }
        // Update form data avatarUrl before profile update
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      }
      // Update profile with possibly new avatarUrl and other data
      await updateProfile({ ...formData, avatarUrl: newAvatarUrl });
      setSidebar("profile");
    } catch (error) {
      setError("Failed to update profile!");
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="relative w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
        <button className="flex items-center">
          <i
            className="material-symbols-outlined nav-btn"
            onClick={() => setSidebar("profile")}
          >
            arrow_back
          </i>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
        </button>
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
            onClick={() => setSidebar("default")}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
      </header>

      {error && (
        <div className="text-red-500 text-center mt-2">
          <p>{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form
        className="overflow-y-auto h-screen p-4"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar Upload */}
          <AvatarEdit
            avatarUrl={formData.avatarUrl}
            onAvatarChange={handleAvatarChange}
          />

          {/* Form Fields */}
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
      </form>

      <div
        className="flex gap-2 justify-center items-center cursor-pointer p-2 text-blue-500 custom-border-t absolute bottom-0 w-full"
        onClick={() => setSidebar("settingsAccount")}
      >
        <i className="material-symbols-outlined">person</i>
        <span>Account Settings</span>
      </div>
    </aside>
  );
};

export default SidebarProfileEdit;
