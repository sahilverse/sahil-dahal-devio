"use client";

import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    ImagePlus, MoreHorizontal,
    Plus,
    UserMinus,
    MessageCircle,
    Pencil
} from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";
import { toast } from "sonner";
import ActionsDropdown from "./ActionsDropdown";
import MobileAccordion from "./MobileAccordion";
import ProfileInfoModal from "./ProfileInfoModal";
import {
    useFollowUser,
    useUnfollowUser,
    useUploadAvatar,
    useUploadBanner,
    useRemoveAvatar,
    useRemoveBanner,
    useUpdateProfile
} from "@/hooks/useProfile";
import Nav from "./Nav";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppDispatch } from "@/store/hooks";
import { openChat, setPendingRecipient } from "@/slices/chat/chatSlice";
import { useAppSelector } from "@/store/hooks";
import { copyCurrentUrl } from "@/lib/string";

interface HeaderProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function Header({ profile, isCurrentUser }: HeaderProps) {
    const { openLogin } = useAuthModal();
    const dispatch = useAppDispatch();
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    const location = [profile.city, profile.country].filter(Boolean).join(", ");

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isProfileInfoModalOpen, setIsProfileInfoModalOpen] = useState(false);
    const [profileModalMode, setProfileModalMode] = useState<"title" | "location">("title");

    const { user } = useAppSelector((state) => state.auth);
    const isAuthenticated = !!user;

    const { mutate: followUser, isPending: isFollowPending } = useFollowUser(profile.username);
    const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser(profile.username);
    const isPending = isFollowPending || isUnfollowPending;

    const { mutate: uploadAvatar } = useUploadAvatar(profile.username);
    const { mutate: uploadBanner } = useUploadBanner(profile.username);
    const { mutate: removeAvatar } = useRemoveAvatar(profile.username);
    const { mutate: removeBanner } = useRemoveBanner(profile.username);
    const { mutate: updateProfile, isPending: isUpdatePending } = useUpdateProfile(profile.username);

    const openTitleModal = () => {
        setProfileModalMode("title");
        setIsProfileInfoModalOpen(true);
    };

    const openLocationModal = () => {
        setProfileModalMode("location");
        setIsProfileInfoModalOpen(true);
    };

    const handleAvatarSave = (file: File) => {
        uploadAvatar(file);
    };

    const handleBannerSave = (file: File) => {
        uploadBanner(file);
    };

    const handleAvatarRemove = () => {
        removeAvatar();
    };

    const handleBannerRemove = () => {
        removeBanner();
    };

    const handleFollow = () => {
        if (!isAuthenticated) {
            openLogin();
            return;
        }
        if (profile.isFollowing) {
            unfollowUser();
        } else {
            followUser();
        }
    };

    const handleShare = async () => {
        await copyCurrentUrl();
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
                        unoptimized
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No banner image</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {isCurrentUser && (
                    <button
                        className="absolute top-2 right-2 z-20 bg-gray-500 dark:bg-gray-800 dark:text-primary text-white rounded-full p-2 shadow cursor-pointer"
                        type="button"
                        onClick={() => setIsBannerModalOpen(true)}
                    >
                        <ImagePlus className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            <div className=" px-3 lg:px-6 pb-6">
                <div className="relative flex justify-between items-end -mt-16 mb-4">
                    <div className="relative inline-block shrink-0">
                        <Avatar className="h-24 w-24 border-2 border-card bg-card ring-2 ring-primary/10">
                            <AvatarImage src={profile.avatarUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold dark:bg-gray-900 bg-gray-300 flex items-center justify-center">
                                <Image src="/devio-logo.png" alt="Avatar" width={64} height={64} priority />
                            </AvatarFallback>
                        </Avatar>

                        {isCurrentUser && (
                            <button
                                className="absolute bottom-1 right-1 z-20 bg-[#262626] dark:text-primary text-white rounded-full p-1.5 shadow cursor-pointer bg-gray-500 dark:bg-gray-800"
                                type="button"
                                onClick={() => setIsAvatarModalOpen(true)}
                            >
                                <ImagePlus className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>


                <div className="flex flex-col gap-2">

                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-lg font-bold">{fullName}</h1>
                            {location ? (
                                <p
                                    className={`group flex items-center gap-1.5 text-muted-foreground tracking-wider text-xs whitespace-nowrap mt-1 ${isCurrentUser ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                                    onClick={() => isCurrentUser && openLocationModal()}
                                >
                                    {location}
                                    {isCurrentUser && (
                                        <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </p>
                            ) : isCurrentUser && (
                                <button
                                    className="mt-2 text-muted-foreground/50 hover:text-primary tracking-wider text-xs cursor-pointer flex items-center gap-1 transition-colors"
                                    type="button"
                                    onClick={openLocationModal}
                                >
                                    <Plus className="w-3 h-3" /> Add Location
                                </button>
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

                                {isAuthenticated && (
                                    <Button
                                        variant="secondary"
                                        size="icon-sm"
                                        className="h-8 w-8 cursor-pointer rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        onClick={() => {
                                            dispatch(setPendingRecipient({
                                                id: profile.id,
                                                username: profile.username,
                                                avatarUrl: profile.avatarUrl ?? null,
                                            }));
                                            dispatch(openChat());
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </Button>
                                )}

                                <ActionsDropdown onShare={handleShare} isAuthenticated={isAuthenticated} openLogin={openLogin}>
                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 cursor-pointer">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </ActionsDropdown>
                            </div>
                        )}
                    </div>


                    {profile.title ? (
                        <p
                            className={`group flex items-center gap-1.5 text-muted-foreground max-w-md text-xs ${isCurrentUser ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                            onClick={() => isCurrentUser && openTitleModal()}
                        >
                            <span className="flex-1">{profile.title}</span>
                            {isCurrentUser && (
                                <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                        </p>
                    ) : isCurrentUser && (
                        <button
                            className="text-muted-foreground/50 hover:text-primary text-xs cursor-pointer flex items-center gap-1 transition-colors w-fit"
                            type="button"
                            onClick={openTitleModal}
                        >
                            <Plus className="w-3 h-3" /> Add Title
                        </button>
                    )}

                    {/* Mobile Stats Accordion */}
                    <MobileAccordion profile={profile} isCurrentUser={isCurrentUser} />


                </div>

            </div>

            <Nav isCurrentUser={isCurrentUser} />

            <ImageUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleAvatarSave}
                onRemove={handleAvatarRemove}
                currentUrl={profile.avatarUrl}
                variant="avatar"
            />

            <ImageUploadModal
                isOpen={isBannerModalOpen}
                onClose={() => setIsBannerModalOpen(false)}
                onSave={handleBannerSave}
                onRemove={handleBannerRemove}
                currentUrl={profile.bannerUrl}
                variant="banner"
            />

            <ProfileInfoModal
                isOpen={isProfileInfoModalOpen}
                onClose={() => setIsProfileInfoModalOpen(false)}
                mode={profileModalMode}
                onSave={(data) => {
                    updateProfile(data, {
                        onSuccess: () => setIsProfileInfoModalOpen(false)
                    });
                }}
                initialData={{
                    title: profile.title,
                    city: profile.city,
                    country: profile.country
                }}
                isPending={isUpdatePending}
            />
        </div>
    );

}
