"use client";

import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import { MapPin } from "lucide-react";

interface ProfileHeaderProps {
    profile: UserProfile;
}


export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const handleSave = (file: File) => {
        console.log("Selected file:", file);
    };

    return (
        <div className="flex flex-col relative bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="relative w-full h-48">
                {profile.bannerUrl ? (
                    <Image
                        src={profile.bannerUrl}
                        alt="Profile Banner"
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No banner image</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <button
                    className="absolute top-2 right-2 z-20 bg-[#262626] dark:text-primary text-white 
               rounded-full p-2 shadow cursor-pointer dark:bg-gray-800"
                    type="button"
                    onClick={() => setIsBannerModalOpen(true)}
                >
                    <ImagePlus className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="px-6 pb-6">
                <div className="relative flex justify-between items-end -mt-16 mb-4">
                    <div className="relative inline-block shrink-0">
                        <Avatar className="h-24 w-24 border-2 border-card bg-card ring-2 ring-primary/10">
                            <AvatarImage src={profile.avatarUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="text-3xl font-bold dark:bg-gray-900 bg-gray-300 flex items-center justify-center">
                                <Image src="/devio-logo.png" alt="Avatar" width={64} height={64} />
                            </AvatarFallback>
                        </Avatar>

                        <button
                            className="absolute bottom-1 right-1 z-20 bg-[#262626] dark:text-primary text-white rounded-full p-1.5 shadow cursor-pointer bg-gray-500 dark:bg-gray-800"
                            type="button"
                            onClick={() => setIsAvatarModalOpen(true)}
                        >
                            <ImagePlus className="h-4 w-4" />
                        </button>
                    </div>
                </div>


                <div className="flex flex-col gap-2">

                    <div>
                        <h1 className="text-2xl font-bold">{fullName}</h1>
                        {
                            location && <p className="text-muted-foreground tracking-wider font-semibold">
                                {location}
                            </p>
                        }
                    </div>


                    <p className="text-muted-foreground max-w-md">{profile.bio}</p>


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