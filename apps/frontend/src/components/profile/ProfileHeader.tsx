"use client";

import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";

interface ProfileHeaderProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
    onFollow?: () => void;
    onEdit?: () => void;
}


export default function ProfileHeader({ profile, isCurrentUser, onFollow, onEdit }: ProfileHeaderProps) {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const handleSave = (file: File) => {
        console.log("Selected file:", file);
    };

    return (
        <div className="flex items-start gap-4 flex-col relative">
            <div className="w-full">
                {profile.bannerUrl ? (
                    <Image src={profile.bannerUrl} alt="Profile Banner" width={45} height={45} />
                ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center relative">
                        <span className="text-gray-500 dark:text-gray-400">No banner image</span>

                        <button
                            className="absolute top-2 right-2 z-20 rounded-full p-2 shadow cursor-pointer 
             bg-[#262626] text-white dark:bg-primary-foreground dark:text-white"
                            type="button"
                            onClick={() => setIsBannerModalOpen(true)}
                        >
                            <ImagePlus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex gap-4 absolute -bottom-8 left-4">
                <div className="relative inline-block shrink-0">
                    <Avatar className="h-19 w-19">
                        <AvatarImage src={profile.avatarUrl ?? undefined} className="bg-primary-foreground" />
                        <AvatarFallback className="p-0 dark:bg-gray-900 bg-gray-300">
                            <Image src="/devio-logo.png" alt="Avatar" width={45} height={45} />
                        </AvatarFallback>
                    </Avatar>

                    <button
                        className="absolute bottom-[8px] -right-1 z-20 bg-[#262626] dark:text-primary text-white rounded-full p-1.5 shadow cursor-pointer bg-gray-500 dark:bg-gray-800"
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                    >
                        <ImagePlus className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex flex-col mt-3">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-muted-foreground tracking-wider font-semibold">u/{profile.username}</p>
                </div>

            </div>

            <ImageUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleSave}
                currentUrl={profile.avatarUrl}
                variant="avatar"
            />

            <ImageUploadModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSave={handleSave}
                currentUrl={profile.bannerUrl}
                variant="banner"
            />

        </div>
    );

}