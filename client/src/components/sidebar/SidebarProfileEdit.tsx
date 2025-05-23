import { useState, useEffect, useMemo } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useCurrentUser } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import AvatarEdit from "../ui/avatar/AvatarEdit";

const SidebarProfileEdit: React.FC = () => {
  const currentUser = useCurrentUser();
  const { updateProfile } = useProfileStore();
  const { setSidebar } = useSidebarStore();

  const initialFormData = useMemo(
    () => ({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      phoneNumber: currentUser?.phoneNumber || null,
      birthday: currentUser?.birthday
        ? new Date(currentUser.birthday).toISOString().split("T")[0]
        : "",
      bio: currentUser?.bio || "",
      avatarUrl: currentUser?.avatarUrl || "",
    }),
    [currentUser]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changesDetected = Object.keys(initialFormData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        initialFormData[key as keyof typeof initialFormData]
    );
    setHasChanges(changesDetected);
  }, [formData, initialFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      await updateProfile(formData);
      setSidebar("profile");
    } catch (error) {
      console.error("Failed to update profile", error);
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
              className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white"
              onClick={handleSubmit}
            >
              <i className="material-symbols-outlined text-3xl">check</i>
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

      {/* Edit Form */}
      <form className="overflow-y-auto h-screen p-4" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar Upload */}
          <AvatarEdit
            avatarUrl={formData.avatarUrl}
            onAvatarChange={(newAvatar) =>
              setFormData((prev) => ({ ...prev, avatarUrl: newAvatar }))
            }
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
                value={formData.birthday || ""}
                onChange={handleChange}
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
                placeholder="Tell us about yourself"
                maxLength={150}
              />
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
