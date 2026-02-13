"use client";

import PostFeed from "@/components/profile/posts/PostFeed";
import { TrendingUp } from "lucide-react";

export default function PopularPage() {
    return (
        <div className="space-y-6 lg:pr-50">
            <div className="flex items-center gap-2">
                <TrendingUp className="size-6 text-brand" />
                <h1 className="text-2xl font-bold tracking-tight">Popular</h1>
            </div>

            <PostFeed sortBy="HOT" />
        </div>
    );
}
