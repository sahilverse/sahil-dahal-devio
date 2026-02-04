"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { notFound } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useUserProfile } from "@/hooks/useProfile";
import { useParams } from "next/navigation";

export default function TestProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user } = useAppSelector((state) => state.auth);

    const { data: profile, isLoading, isError } = useUserProfile(username);

    const isCurrentUser = profile?.id === user?.id;

    if (isLoading) return <ProfileSkeleton />;
    if (!profile) return notFound();
    if (isError) throw new Error("Failed to load profile");

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="min-w-0">
                    <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
                </div>
                <div>
                    <ProfileSidebar profile={profile} isCurrentUser={isCurrentUser} />
                </div>
            </div>
        </div>
    );
}