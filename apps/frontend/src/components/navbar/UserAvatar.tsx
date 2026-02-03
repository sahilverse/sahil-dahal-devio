"use client";

import Image from "next/image";
import { AuthUser } from "@/slices/auth/authTypes";

interface UserAvatarProps {
    user: AuthUser;
    size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
};

const IMG_SIZES = { sm: 32, md: 40, lg: 48 };

export default function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
    return (
        <div className={`${SIZE_CLASSES[size]} rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700`}>
            {user.avatarUrl ? (
                <Image
                    src={user.avatarUrl}
                    alt={user.username || "User"}
                    width={IMG_SIZES[size]}
                    height={IMG_SIZES[size]}
                    className="object-cover w-full h-full"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold">
                    {user.username?.slice(0, 2).toUpperCase() || "U"}
                </div>
            )}
        </div>
    );
}
