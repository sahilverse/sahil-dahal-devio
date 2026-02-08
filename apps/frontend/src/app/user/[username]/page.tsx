"use client";

import { Header } from "@/components/profile/header";
import { Sidebar } from "@/components/profile/sidebar";
import { Overview } from "@/components/profile/overview";
import { About } from "@/components/profile/about";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { notFound } from "next/navigation";
import { useUserProfile } from "@/hooks/useProfile";
import { useParams, useSearchParams } from "next/navigation";
import PostFeed from "@/components/profile/posts/PostFeed";

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("view")?.toLowerCase() || "overview";

    const { data: profile, isLoading, isError } = useUserProfile(username);

    if (isLoading) return <ProfileSkeleton />;
    if (!profile) return notFound();
    if (isError) throw new Error("Failed to load profile");

    const isCurrentUser = profile.isOwner;

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="min-w-0">
                    <Header profile={profile} isCurrentUser={isCurrentUser} />

                    <div className="mt-4">
                        {activeTab === "overview" && <Overview profile={profile} />}

                        {activeTab === "posts" && (

                            <PostFeed userId={profile.id} isCurrentUser={isCurrentUser} username={profile.username} />

                        )}
                        {activeTab === "saved" && isCurrentUser && (
                            <PostFeed onlySaved={true} isCurrentUser={isCurrentUser} />
                        )}
                        {activeTab === "about" && (
                            <About profile={profile} isCurrentUser={isCurrentUser} />
                        )}
                    </div>
                </div>
                <div className="hidden lg:block">
                    <div className="fixed w-80">
                        <Sidebar profile={profile} isCurrentUser={isCurrentUser} />
                    </div>
                </div>
            </div>
        </div>
    );
}