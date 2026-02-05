import { useState } from "react";
import { UserProfile } from "@/types/profile";
import StatCard from "./StatCard";
import ContributionsModal from "./ContributionsModal";

interface StatsProps {
    profile: UserProfile;
    isCurrentUser?: boolean;
}

export default function Stats({ profile, isCurrentUser }: StatsProps) {
    const [isContributionsOpen, setIsContributionsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 pb-4">
            {/* Follow Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs pb-2 border-b">
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
                    value={profile.contributions?.total?.toLocaleString() || 0}
                    onClick={() => setIsContributionsOpen(true)}
                    isInteractive
                />

                <StatCard
                    label="Devio Age"
                    value={profile.devioAge || "0 y"}
                />

                {isCurrentUser && (
                    <StatCard
                        label="Cipher"
                        value={(profile.cipherBalance ?? 0).toLocaleString()}
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
