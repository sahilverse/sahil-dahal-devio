"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { notFound } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useUserProfile } from "@/hooks/useProfile";
import { useParams, useSearchParams } from "next/navigation";
import ProfileOverview from "@/components/profile/ProfileOverview";

export default function TestProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user } = useAppSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("view")?.toLowerCase() || "overview";


    const { data: profile, isLoading, isError } = useUserProfile(username);

    const isCurrentUser = profile?.id === user?.id;

    if (isLoading) return <ProfileSkeleton />;
    if (!profile) return notFound();
    if (isError) throw new Error("Failed to load profile");

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="min-w-0">
                    <ProfileHeader
                        profile={profile}
                        isCurrentUser={isCurrentUser}
                    />

                    <div className="mt-4">
                        {activeTab === "overview" && (
                            <ProfileOverview profile={profile} />
                        )}

                        {activeTab === "posts" && (
                            <div className="p-12 border rounded-xl bg-card border-dashed text-center">
                                <p className="text-muted-foreground">Posts Content Placeholder</p>
                            </div>
                        )}
                        {activeTab === "saved" && (
                            <div className="p-12 border rounded-xl bg-card border-dashed text-center">
                                <p className="text-muted-foreground">Saved Content Placeholder</p>
                            </div>
                        )}
                        {activeTab === "about" && (
                            <div className="p-12 border rounded-xl bg-card border-dashed text-center">
                                <p className="text-muted-foreground">About Content Placeholder</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="self-start">
                    <div className="fixed">
                        <ProfileSidebar profile={profile} isCurrentUser={isCurrentUser} />
                    </div>
                </div>
            </div>
        </div>
    );
}