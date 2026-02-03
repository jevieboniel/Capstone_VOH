import React from "react";
import ProfileSettings from "../Pages/ProfileSettings"; 
// ✅ adjust this import path to where your ProfileSettings component file is located

import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
    const { user } = useAuth();

    const initialUser = {
        firstName: user?.firstName || "",
        middleName: user?.middleName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        role: user?.role || "Staff",
        avatarUrl: user?.avatarUrl || "",
        notifications: user?.notifications || { email: true, sms: false, system: true },
    };

    const onSave = async (payload) => {
        console.log("Saving profile:", payload);

        // TODO: send to backend
        // await api.post("/profile/update", payload);

        alert("Saved! (check console)");
    };

    const onCancel = () => {
        // optional: maybe navigate back or just reset form
        console.log("Cancelled");
    };

    return (
        <ProfileSettings
        initialUser={initialUser}
        onSave={onSave}
        onCancel={onCancel}
        roleReadOnly={true}
        />
    );
};

export default Profile;
