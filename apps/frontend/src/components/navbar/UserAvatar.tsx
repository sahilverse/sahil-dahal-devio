"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUser } from "@/slices/auth/authTypes";
import Image from "next/image";

interface UserAvatarProps {
    user: AuthUser;
    size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-18 h-18",
};

export default function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
    return (
        <Avatar className={`${SIZE_CLASSES[size]} border border-gray-200 dark:border-gray-700`}>
            <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.username || "User"}
                className="object-cover"
            />
            <AvatarFallback>
                <Image
                    src="/devio-logo.png"
                    alt="Devio"
                    height={24}
                    width={24}
                />
            </AvatarFallback>``
        </Avatar>
    );
}
