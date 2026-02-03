"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/slices/auth";
import { AuthUser } from "@/slices/auth/authTypes";
import UserAvatar from "./UserAvatar";
import MobileUserMenu from "./MobileUserMenu";
import DesktopUserMenu from "./DesktopUserMenu";

interface UserMenuProps {
    user: AuthUser;
}

export default function UserMenu({ user }: UserMenuProps) {
    const dispatch = useAppDispatch();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
        setShowMobileMenu(false);
    };

    if (showMobileMenu) {
        return (
            <MobileUserMenu
                user={user}
                onClose={() => setShowMobileMenu(false)}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <>
            <div className="lg:hidden cursor-pointer select-none" onClick={() => setShowMobileMenu(true)}>
                <UserAvatar user={user} size="sm" />
            </div>
            <DesktopUserMenu user={user} onLogout={handleLogout} />
        </>
    );
}
