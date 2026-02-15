"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface UserAvatarProps {
    user: {
        avatarUrl?: string | null;
        username: string | null;
    }
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const SIZE_CLASSES = {
    xs: "w-5 h-5 text-[10px]",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-18 h-18",
};

export default function UserAvatar({ user, size = "sm", className }: UserAvatarProps) {
    return (
        <Avatar className={`${SIZE_CLASSES[size]} border border-gray-200 dark:border-gray-700 ${className || ""}`}>
            <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.username || "User"}
                className="object-cover"
            />
            <AvatarFallback className="bg-transparent">
                <Image
                    src="/devio-logo.png"
                    alt="Devio"
                    height={24}
                    width={24}
                    className="object-contain"
                />
            </AvatarFallback>
        </Avatar>
    );
}
