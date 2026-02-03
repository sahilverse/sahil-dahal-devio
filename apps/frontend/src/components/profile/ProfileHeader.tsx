"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvatarUploadModal from "./AvatarUploadModal";
import type { UserProfile } from "@/types/user";

interface ProfileHeaderProps {
    profile: UserProfile;
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOwnProfile?: boolean;
    onAvatarChange?: (file: File) => void;
    onBannerChange?: (file: File) => void;
}

function getInitials(firstName: string | null, lastName: string | null, username: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
}

export default function ProfileHeader({
    profile,
    activeTab,
    onTabChange,
    isOwnProfile = false,
    onAvatarChange,
    onBannerChange
}: ProfileHeaderProps) {
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const displayName = profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile.username;

    const initials = getInitials(profile.firstName, profile.lastName, profile.username);

    return (
        <>
            <div>
                {/* Mobile Layout */}
                <div className="lg:hidden">
                    <div className="relative">
                        <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-hover overflow-hidden">
                            {profile.bannerUrl && (
                                <img
                                    src={profile.bannerUrl}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsBannerModalOpen(true)}
                                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                    aria-label="Change banner"
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>

                        <div className="absolute left-4 bottom-0 translate-y-1/2 z-20">
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-4 border-white dark:border-bg-dark">
                                    <AvatarImage src={profile.avatarUrl || undefined} alt={displayName} />
                                    <AvatarFallback className="text-xl font-medium bg-muted text-muted-foreground">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsAvatarModalOpen(true)}
                                        className="absolute bottom-0 right-0 w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center border-2 border-white dark:border-bg-dark hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors cursor-pointer"
                                        aria-label="Change avatar"
                                    >
                                        <Camera className="w-3 h-3 text-white dark:text-gray-900" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 px-4 pb-4">
                        <h1 className="text-xl font-bold text-primary">{displayName}</h1>
                        <p className="text-secondary text-sm">u/{profile.username}</p>
                        {profile.bio && (
                            <p className="text-primary mt-3 text-sm line-clamp-3">{profile.bio}</p>
                        )}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                    <div className="flex items-start gap-4 pt-2 pb-4 px-4 lg:px-5">
                        <div className="relative flex-shrink-0 -mt-2">
                            <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                                <AvatarImage src={profile.avatarUrl || undefined} alt={displayName} />
                                <AvatarFallback className="text-xl lg:text-2xl font-medium bg-muted text-muted-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="absolute bottom-1 right-1 w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center border-2 border-white dark:border-bg-dark hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors cursor-pointer"
                                    aria-label="Change avatar"
                                >
                                    <Camera className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl lg:text-3xl font-bold text-primary truncate">{displayName}</h1>
                            <p className="text-secondary text-base mt-1">u/{profile.username}</p>
                            {profile.bio && (
                                <p className="text-primary mt-3 text-base max-w-2xl">{profile.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={onTabChange}>
                    <TabsList className="bg-transparent p-0 h-auto gap-0 w-full overflow-x-auto flex justify-start lg:justify-center">
                        {["Overview", "Posts", "Comments", "About"].map((tab) => {
                            const isSelected = activeTab === tab.toLowerCase();
                            return (
                                <TabsTrigger
                                    key={tab}
                                    value={tab.toLowerCase()}
                                    className="group rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-0 text-sm text-secondary data-[state=active]:text-brand-primary flex-shrink-0 cursor-pointer transition-colors"
                                >
                                    <span className={`inline-block py-3 border-b-2 border-transparent transition-colors ${!isSelected ? "group-hover:border-gray-300 dark:group-hover:border-white/50" : ""}`}>
                                        {tab}
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>
            </div>

            <AvatarUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={(file) => onAvatarChange?.(file)}
                currentAvatarUrl={profile.avatarUrl}
                fallbackText={initials}
            />

            <AvatarUploadModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSave={(file) => onBannerChange?.(file)}
                currentAvatarUrl={profile.bannerUrl}
                fallbackText="BN"
            />
        </>
    );
}
