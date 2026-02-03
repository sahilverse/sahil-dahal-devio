"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { Loader2, Plus, Filter } from "lucide-react";
import { useUserProfile } from "@/hooks/useProfile";
import { useAppSelector } from "@/store/hooks";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfilePageProps {
    params: Promise<{
        username: string;
    }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
    const { username } = use(params);
    const [activeTab, setActiveTab] = useState("overview");

    const { data: profile, isLoading, isError, error } = useUserProfile(username);
    const currentUser = useAppSelector((state) => state.auth.user);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
                <h2 className="text-2xl font-bold">User not found</h2>
                <p className="text-muted-foreground">The user @{username} does not exist or could not be loaded.</p>
            </div>
        );
    }

    const isOwnProfile = currentUser?.username === profile.username;
    const initials = `${profile.username[0]}`.toUpperCase();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container max-w-6xl mx-auto px-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Main Content */}
                    <div className="md:col-span-2 space-y-4">

                        {/* Mobile Header (Only visible on small screens) */}
                        <div className="md:hidden mb-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={profile.avatarUrl || undefined} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-xl font-bold">{profile.username}</h1>
                                    <p className="text-sm text-muted-foreground">u/{profile.username}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs/Filter Bar */}
                        <div className="flex flex-col gap-4 mb-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex items-center justify-between border-b pb-2 overflow-x-auto">
                                    <TabsList className="bg-transparent p-0 h-auto gap-2 bg-muted/0">
                                        {["Overview", "Posts", "Comments", "Saved", "Hidden", "Upvoted", "Downvoted"].map((tab) => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab.toLowerCase()}
                                                className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-foreground bg-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                                            >
                                                {tab}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {/* Tab Content */}
                                <div className="mt-4">
                                    {/* Create Post Input (Only if own profile or generally available) */}
                                    {isOwnProfile && (
                                        <div className="flex items-center gap-2 p-2 rounded-md border bg-card mb-4">
                                            <Plus className="w-5 h-5 text-muted-foreground" />
                                            <Input
                                                placeholder="Create Post"
                                                className="border-none bg-transparent shadow-none focus-visible:ring-0"
                                            />
                                            <Button size="sm" variant="ghost"><Filter className="w-4 h-4" /></Button>
                                        </div>
                                    )}

                                    <TabsContent value="overview" className="mt-0">
                                        {profile.recentActivity?.length ? (
                                            <div className="space-y-4">
                                                {/* Render activities here */}
                                                <p>Activities list...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-dashed border-2 rounded-xl bg-muted/20">
                                                <div className="w-16 h-16 bg-muted rounded-full mb-4 flex items-center justify-center opacity-50">
                                                    <span className="text-2xl font-bold">?</span>
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">You don't have any posts yet</h3>
                                                <p className="text-sm max-w-sm text-center mb-6">
                                                    Once you post to a community, it'll show up here.
                                                </p>
                                                {isOwnProfile && <Button>Create Post</Button>}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="posts">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No posts yet</p>
                                        </div>
                                    </TabsContent>

                                    {/* Add other tab contents as placeholders */}
                                    <TabsContent value="comments">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No comments yet</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="saved">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No saved items</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="hidden">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No hidden items</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="upvoted">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No upvoted items</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="downvoted">
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <p>No downvoted items</p>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="hidden md:block">
                        <ProfileSidebar
                            profile={profile}
                            isOwnProfile={isOwnProfile}
                            // Pass handlers if you have them in the parent or context
                            onAvatarChange={() => { }}
                            onBannerChange={() => { }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
