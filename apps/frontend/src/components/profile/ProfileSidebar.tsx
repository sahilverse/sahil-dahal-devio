import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Check, Share2, Plus, UserMinus, MessageCircle, MoreHorizontal } from "lucide-react";
import ProfileActionsDropdown from "./ProfileActionsDropdown";
import { toast } from "sonner";
import ProfileStats from "./ProfileStats";
import ProfileAchievements from "./ProfileAchievements";
import ProfileSocials from "./ProfileSocials";
import ProfileSettingsSection from "./ProfileSettingsSection";
import { useFollowUser, useUnfollowUser } from "@/hooks/useProfile";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAppSelector } from "@/store/hooks";

interface ProfileSidebarProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function ProfileSidebar({ profile, isCurrentUser }: ProfileSidebarProps) {
    const [hasCopied, setHasCopied] = useState(false);

    const { user } = useAppSelector((state) => state.auth);
    const isAuthenticated = !!user;
    const { openLogin } = useAuthModal();

    const { mutate: followUser, isPending: isFollowPending } = useFollowUser(profile.username);
    const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser(profile.username);
    const isPending = isFollowPending || isUnfollowPending;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
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

    const handleMessage = () => {
        if (!isAuthenticated) {
            openLogin();
            return;
        }
        // TODO: Implement messaging logic
    };

    return (
        <>

            <div className="flex-col gap-6 w-full hidden lg:flex border border-card rounded-lg p-4 pt-2 dark:border-secondary border-gray-700/20">
                {/* Username & Actions */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold tracking-tighter cursor-default">u/{profile.username}</h2>
                        {isCurrentUser ? (
                            <Button variant="ghost" size="icon" onClick={handleShare} className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground hidden lg:flex">
                                {hasCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            </Button>
                        ) : (
                            <div className="hidden lg:block">
                                <ProfileActionsDropdown onShare={handleShare} isAuthenticated={isAuthenticated} openLogin={openLogin}>
                                    <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </ProfileActionsDropdown>
                            </div>
                        )}
                    </div>

                    {!isCurrentUser && (
                        <div className="hidden lg:grid grid-cols-2 gap-2">
                            <Button
                                disabled={isPending}
                                className={`font-semibold cursor-pointer text-xs ${profile.isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}
                                variant={profile.isFollowing ? "secondary" : "brand"}
                                onClick={handleFollow}
                            >
                                {profile.isFollowing ? (
                                    <span className="flex items-center gap-2"><UserMinus className="w-4 h-4" /> Unfollow</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Follow</span>
                                )}
                            </Button>
                            {isAuthenticated && (
                                <Button
                                    className="font-semibold cursor-pointer text-xs"
                                    variant="secondary"
                                    onClick={handleMessage}
                                >
                                    <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Start Chat</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 divide-y-1">

                    <ProfileStats profile={profile} isCurrentUser={isCurrentUser} />
                    <ProfileAchievements achievements={profile.achievements} isCurrentUser={isCurrentUser} />
                    <ProfileSocials socials={profile.socials} isCurrentUser={isCurrentUser} />
                    <ProfileSettingsSection isCurrentUser={isCurrentUser} />
                </div>
            </div >

        </>
    );
}

