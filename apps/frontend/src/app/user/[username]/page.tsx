"use client";

import { Header } from "@/components/profile/header";
import { Sidebar } from "@/components/profile/sidebar";
import { Overview } from "@/components/profile/overview";
import { About } from "@/components/profile/about";
import { Button } from "@/components/ui/button";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { notFound } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useUserProfile } from "@/hooks/useProfile";
import { useParams, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

export default function UserProfilePage() {
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
                    <Header profile={profile} isCurrentUser={isCurrentUser} />

                    <div className="mt-4">
                        {activeTab === "overview" && <Overview profile={profile} />}

                        {activeTab === "posts" && (
                            <div className="p-16 border rounded-xl bg-card border-dashed text-center space-y-4">
                                <div className="space-y-2">
                                    <p className="text-muted-foreground">
                                        {isCurrentUser
                                            ? "You haven't posted anything yet"
                                            : `u/${profile.username} hasn't posted anything yet`}
                                    </p>
                                    {isCurrentUser && (
                                        <p className="text-sm text-muted-foreground/70">
                                            Share your thoughts, projects, or questions with the community
                                        </p>
                                    )}
                                </div>
                                {isCurrentUser && (
                                    <Button variant="brand" className="cursor-pointer">
                                        <Plus className="size-4" />
                                        Create Post
                                    </Button>
                                )}
                            </div>
                        )}
                        {activeTab === "saved" && isCurrentUser && (
                            <div className="p-16 border rounded-xl bg-card border-dashed text-center space-y-2">
                                <p className="text-muted-foreground">
                                    You haven't saved any posts yet
                                </p>
                                <p className="text-sm text-muted-foreground/70">
                                    Posts you save will appear here for easy access
                                </p>
                            </div>
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