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

interface ProfileSidebarProps {
    profile: UserProfile;
    isCurrentUser: boolean;
}

export default function ProfileSidebar({ profile, isCurrentUser }: ProfileSidebarProps) {
    const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
    const [hasCopied, setHasCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
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
                                <ProfileActionsDropdown onShare={handleShare}>
                                    <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </ProfileActionsDropdown>
                            </div>
                        )}
                    </div>

                    {!isCurrentUser && (
                        <div className="hidden lg:flex items-center gap-2">
                            <Button
                                className={`flex-1 font-semibold cursor-pointer text-xs ${isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}
                                variant={isFollowing ? "secondary" : "brand"}
                                onClick={handleFollow}
                            >
                                {isFollowing ? (
                                    <span className="flex items-center gap-2"><UserMinus className="w-4 h-4" /> Unfollow</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Follow</span>
                                )}
                            </Button>
                            <Button
                                className="flex-1 font-semibold cursor-pointer text-xs"
                                variant="secondary"
                            >
                                <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Start Chat</span>
                            </Button>
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

