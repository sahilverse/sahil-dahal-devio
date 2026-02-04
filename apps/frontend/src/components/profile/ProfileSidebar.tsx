import { useState } from "react";
import { UserProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Check, Share2, Plus, UserMinus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import ContributionsModal from "./ContributionsModal";
import StatCard from "./StatCard";

interface ProfileSidebarProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
}

export default function ProfileSidebar({ profile, isCurrentUser }: ProfileSidebarProps) {
    const [isContributionsOpen, setIsContributionsOpen] = useState(false);
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

        // TODO: Implement follow/unfollow logic
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Username & Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tighter cursor-default">u/{profile.username}</h2>
                    <Button variant="ghost" size="icon" onClick={handleShare} className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground">
                        {hasCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                    </Button>
                </div>

                {!isCurrentUser && (
                    <div className="flex items-center gap-2">
                        <Button
                            className={`flex-1 font-semibold cursor-pointer ${isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}`}
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
                            className="flex-1 font-semibold cursor-pointer"
                            variant="secondary"
                        >
                            <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Start Chat</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Follow Stats */}
            <div className="flex items-center gap-[60px] text-sm pb-2 border-b">
                <span className="cursor-pointer flex gap-1">
                    <span className="text-foreground">{profile.followersCount.toLocaleString()}</span>
                    <span className="text-muted-foreground font-semibold">follower{profile.followersCount !== 1 ? "s" : ""}</span>
                </span>
                <span className="cursor-pointer flex gap-1">
                    <span className="text-foreground">{profile.followingCount.toLocaleString()}</span>
                    <span className="text-muted-foreground font-semibold">following</span>
                </span>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="Aura"
                    value={profile.auraPoints.toLocaleString()}
                />

                <StatCard
                    label="Contributions"
                    value={profile.contributions.total.toLocaleString()}
                    onClick={() => setIsContributionsOpen(true)}
                    isInteractive
                />

                <StatCard
                    label="Devio Age"
                    value={profile.devioAge || "0y"}
                />

                {isCurrentUser && (
                    <StatCard
                        label="Cipher"
                        value={(profile.cipherPoints ?? 0).toLocaleString()}
                    />
                )}
            </div>

            <ContributionsModal
                isOpen={isContributionsOpen}
                onClose={() => setIsContributionsOpen(false)}
                contributions={profile.contributions}
            />
        </div>
    );
}

