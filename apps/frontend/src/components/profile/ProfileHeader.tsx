"use client";

import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, MapPin, MoreHorizontal, MessageCircle, UserMinus, Plus, ChevronDown } from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import { toast } from "sonner";
import ProfileStats from "./ProfileStats";
import ProfileActionsDropdown from "./ProfileActionsDropdown";
import ProfileAchievements from "./ProfileAchievements";

interface ProfileHeaderProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    const handleSave = (file: File) => {
        console.log("Selected file:", file);
    };

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);

        // TODO: Implement follow/unfollow logic
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

                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{fullName}</h1>
                            {location && (
                                <p className="text-muted-foreground tracking-wider font-semibold whitespace-nowrap">
                                    {location}
                                </p>
                            )}
                        </div>

                        {/* Mobile Actions (< 1024px) */}
                        {!isCurrentUser && (
                            <div className="flex lg:hidden items-center gap-4 mt-1">
                                <Button
                                    className={`h-8 px-3 font-semibold cursor-pointer ${isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}
                                    variant={isFollowing ? "secondary" : "brand"}
                                    size="sm"
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? (
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


                    <p className="text-muted-foreground max-w-md">{profile.bio}</p>

                    {/* Mobile Stats Accordion */}
                    <div className="lg:hidden rounded-lg overflow-hidden border bg-card">
                        <button
                            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                            className="flex justify-between items-center w-full p-4 font-semibold hover:bg-accent/50 transition-colors cursor-pointer text-left"
                        >
                            <span>u/{profile.username}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isAccordionOpen ? "rotate-180" : ""}`} />
                        </button>

                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isAccordionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <div className="overflow-hidden">
                                <div className="p-4 pt-0 border-t bg-accent/20">
                                    <div className="pt-4 space-y-4 divide-y">
                                        <ProfileStats profile={profile} isCurrentUser={isCurrentUser} />
                                        <div>
                                            <ProfileAchievements achievements={profile.achievements} isCurrentUser={isCurrentUser} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


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