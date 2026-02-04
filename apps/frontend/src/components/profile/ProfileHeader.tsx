"use client";

import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, MoreHorizontal, MessageCircle, UserMinus, Plus } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import { toast } from "sonner";
import ProfileActionsDropdown from "./ProfileActionsDropdown";
import ProfileMobileAccordion from "./ProfileMobileAccordion";
import { useFollowUser, useUnfollowUser } from "@/hooks/useProfile";

interface ProfileHeaderProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const { mutate: followUser, isPending: isFollowPending } = useFollowUser(profile.username);
    const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser(profile.username);
    const isPending = isFollowPending || isUnfollowPending;

    const handleSave = (file: File) => {
        console.log("Selected file:", file);
    };

    const handleFollow = () => {
        if (profile.isFollowing) {
            unfollowUser();
        } else {
            followUser();
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
    };

    return (
        <div className="flex flex-col relative bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="relative w-full aspect-[4/1] min-h-[120px] max-h-[300px]">
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

            <div className=" px-3 lg:px-6 pb-6">
                <div className="relative flex justify-between items-end -mt-16 mb-4">
                    <div className="relative inline-block shrink-0">
                        <Avatar className="h-24 w-24 border-2 border-card bg-card ring-2 ring-primary/10">
                            <AvatarImage src={profile.avatarUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold dark:bg-gray-900 bg-gray-300 flex items-center justify-center">
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

                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-lg font-bold">{fullName}</h1>
                            {location && (
                                <p className="text-muted-foreground tracking-wider text-xs whitespace-nowrap">
                                    {location}
                                </p>
                            )}
                        </div>

                        {/* Mobile Actions (< 1024px) */}
                        {!isCurrentUser && (
                            <div className="flex lg:hidden items-center gap-2 mt-1">
                                <Button
                                    disabled={isPending}
                                    className={`h-8 px-3 font-semibold cursor-pointer text-xs ${profile.isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}
                                    variant={profile.isFollowing ? "secondary" : "brand"}
                                    size="sm"
                                    onClick={handleFollow}
                                >
                                    {profile.isFollowing ? (
                                        <span className="flex items-center gap-1.5"><UserMinus className="w-3.5 h-3.5" /> Unfollow</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Follow</span>
                                    )}
                                </Button>

                                <Button variant="secondary" size="icon-sm" className="h-8 w-8 cursor-pointer rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    <MessageCircle className="w-4 h-4" />
                                </Button>

                                <ProfileActionsDropdown onShare={handleShare}>
                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 cursor-pointer">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </ProfileActionsDropdown>
                            </div>
                        )}
                    </div>


                    <p className="text-muted-foreground max-w-md text-xs">{profile.title}</p>

                    {/* Mobile Stats Accordion */}
                    <ProfileMobileAccordion profile={profile} isCurrentUser={isCurrentUser} />


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