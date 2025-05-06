import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useCurrentUser } from "@/stores/authStore";

const SidebarProfileEdit: React.FC = () => {
  const { setCurrentUser } = useAuth();

  const currentUser = useCurrentUser();

  const { setSidebar } = useSidebar();
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name || "",
    last_name: currentUser?.last_name || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    phone_number: currentUser?.phone_number || "",
    birthday: currentUser?.birthday || "",
    bio: currentUser?.bio || "",
    avatar: currentUser?.avatar || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...formData });
      setSidebar("profile");
    }
  };

  return (
    <aside className="relative w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
        <div className="flex items-center">
          <i
            className="material-symbols-outlined nav-btn"
            onClick={() => setSidebar("profile")}
          >
            arrow_back
          </i>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
        </div>
        <div className="flex gap-1">
          <a
            className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white"
            onClick={handleSubmit}
          >
            <i className="material-symbols-outlined text-3xl">check</i>
          </a>
          <a
            className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)] mr-1"
            onClick={() => setSidebar("default")}
          >
            <i className="material-symbols-outlined">close</i>
          </a>
        </div>
      </header>

      {/* Edit Form */}
      <form className="overflow-y-auto h-screen p-4" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar Upload */}
          <div className="h-36 w-36 flex items-center justify-center rounded-full custom-border relative">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <i className="material-symbols-outlined text-8xl opacity-20">
                mood
              </i>
            )}
            <label className="w-10 h-10 absolute bottom-0 right-0 bg-gray-600 text-white rounded-full p-2 cursor-pointer hover:bg-gray-700 flex items-center justify-center">
              <i className="material-symbols-outlined">edit</i>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData((prev) => ({
                        ...prev,
                        avatar: event.target?.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="p-2 custom-border-b"
                placeholder="First Name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="p-2 custom-border-b"
                placeholder="Last Name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Birthday</label>
              <input
                type="text"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="p-2 custom-border-b"
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="p-2 custom-border min-h-[120px]"
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
