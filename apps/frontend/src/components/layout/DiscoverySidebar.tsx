"use client";

import Link from "next/link";
import { TrendingUp, Users, ArrowUpRight, X } from "lucide-react";
import { useExploreCommunities } from "@/hooks/useCommunities";
import { useFetchPosts } from "@/hooks/usePosts";
import { PostResponseDto } from "@/types/post";
import UserAvatar from "@/components/navbar/UserAvatar";
import { formatCompactNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DiscoverySidebar() {
    const [showCommunities, setShowCommunities] = useState(true);
    const [showPopular, setShowPopular] = useState(true);

    const { data: trendingPostsData, isLoading: isLoadingPosts } = useFetchPosts({
        sortBy: "HOT",
        limit: 3
    });

    const { data: communitiesData, isLoading: isLoadingCommunities } = useExploreCommunities(5);

    const trendingPosts = trendingPostsData?.pages?.[0]?.posts || [];
    const topCommunities = communitiesData?.pages?.[0]?.communities || [];

    return (
        <aside className="hidden lg:flex flex-col gap-6 fixed top-[110px] bottom-8 w-[320px] xl:w-[350px] overflow-hidden select-none mt-5" >
            <div className="flex flex-col gap-6 px-1">
                {/* Top Communities Widget */}
                {showCommunities && (isLoadingCommunities || topCommunities.length > 0) && (
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative group/card">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowCommunities(false)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-muted"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </Button>

                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-brand" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Communities</h2>
                        </div>

                        <div className="space-y-3">
                            {isLoadingCommunities ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-2 w-12" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                topCommunities.map((community: any) => (
                                    <Link
                                        key={community.id}
                                        href={`/d/${community.name}`}
                                        className="flex items-center gap-3 group hover:bg-muted/50 p-1 -m-1 rounded-lg transition-colors"
                                    >
                                        <UserAvatar
                                            user={{ username: community.name, avatarUrl: community.iconUrl }}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate group-hover:underline">
                                                d/{community.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground font-medium">
                                                <span className="font-bold">{formatCompactNumber(community._count?.members || 0)}</span> members
                                            </p>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand transition-colors" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Popular Today Widget */}
                {showPopular && (isLoadingPosts || trendingPosts.length > 0) && (
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative group/card">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPopular(false)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-muted"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </Button>

                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-brand" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Popular Today</h2>
                        </div>

                        <div className="space-y-4">
                            {isLoadingPosts ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-2 w-24" />
                                    </div>
                                ))
                            ) : (
                                trendingPosts.map((post: PostResponseDto) => (
                                    <Link
                                        key={post.id}
                                        href={`/post/${post.id}`}
                                        className="block group space-y-1 border-b border-border/40 last:border-0 pb-3 last:pb-0 font-sans"
                                    >
                                        <p className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-brand transition-colors">
                                            {post.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                            <span className="uppercase tracking-tight text-orange-500 font-bold">
                                                {formatCompactNumber(post.voteCount)} Upvotes
                                            </span>
                                            <span>•</span>
                                            <span className="font-bold">{formatCompactNumber(post.commentCount)} Comments</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Links - Magnet for bottom placement */}
            <div className="px-2 pb-6 mt-auto">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground/60 font-medium">
                    <Link href="#" className="hover:underline">User Agreement</Link>
                    <Link href="#" className="hover:underline">Privacy Policy</Link>
                    <Link href="#" className="hover:underline">Content Policy</Link>
                </div>
                <p className="mt-4 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                    © 2026 Devio, Inc. All rights reserved.
                </p>
            </div>
        </aside>
    );
}
