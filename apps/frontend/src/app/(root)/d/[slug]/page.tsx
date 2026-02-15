"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCommunity } from "@/hooks/useCommunity";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import CommunitySkeleton from "@/components/community/CommunitySkeleton";
import AccessDenied from "@/components/community/AccessDenied";
import PostFeed from "@/components/profile/posts/PostFeed";
import MemberList from "@/components/community/MemberList";
import { useAppSelector } from "@/store/hooks";
import { notFound } from "next/navigation";

export default function CommunityPage() {
    const { slug } = useParams<{ slug: string }>();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("view")?.toLowerCase() || "posts";
    const { user } = useAppSelector((state) => state.auth);

    const { data: community, isLoading, isError } = useCommunity(slug);

    if (isLoading) return <CommunitySkeleton />;
    if (!community) return notFound();
    if (isError) throw new Error("Failed to load community");

    const isPrivateAndNotMember =
        community.visibility === "PRIVATE" && !community.isMember;

    if (isPrivateAndNotMember) {
        return <AccessDenied community={community} />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="min-w-0">
                    <CommunityHeader community={community} />

                    <div className="mt-4">
                        {activeTab === "posts" && (
                            <PostFeed communityId={community.id} />
                        )}
                        {activeTab === "members" && (
                            <MemberList
                                communityName={community.name}
                                isMod={!!community.isMod}
                            />
                        )}
                    </div>
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-4 w-full">
                        <CommunitySidebar community={community} />
                    </div>
                </div>
            </div>
        </div>
    );
}
