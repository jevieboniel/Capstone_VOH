import React from "react";
import ProfileSettings from "./ProfileSettings";
import { useAuth } from "../../contexts/AuthContext";
import { splitName, joinName } from "../../utils/name";

const Profile = () => {
  const { user, authFetch, setUser } = useAuth();

  const parts = splitName(user?.name || "");

  const initialUser = {
    firstName: parts.firstName,
    middleName: parts.middleName,
    lastName: parts.lastName,
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "Staff",
    avatarUrl: user?.avatarUrl || "",
  };

  const onSave = async (payload) => {
    const hasFile = payload?.avatarFile instanceof File;

    const options = { method: "PUT" };

    if (hasFile) {
      const formData = new FormData();
      formData.append("firstName", payload.firstName || "");
      formData.append("middleName", payload.middleName || "");
      formData.append("lastName", payload.lastName || "");
      formData.append("email", payload.email || "");
      formData.append("phone", payload.phone || "");

      formData.append("currentPassword", payload.currentPassword || "");
      formData.append("newPassword", payload.newPassword || "");
      formData.append("confirmPassword", payload.confirmPassword || "");

      formData.append("avatar", payload.avatarFile);

      options.body = formData;
    } else {
      const { avatarFile, avatarUrl, ...rest } = payload || {};
      options.body = JSON.stringify(rest);
    }

    const res = await authFetch(`/users/${user.id}/profile`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to update profile");

    if (data.user) {
      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone,
        avatarUrl: data.user.avatarUrl,
      };
      setUser(updatedUser);
      localStorage.setItem("admin_user", JSON.stringify(updatedUser));
    }

    alert("Profile updated successfully!");
  };

  return (
    <ProfileSettings
      initialUser={initialUser}
      onSave={onSave}
      onCancel={() => {}}
      roleReadOnly={true}
    />
  );
};

export default Profile;
