"use client";

import PostFeed from "@/components/profile/posts/PostFeed";
import { useAppSelector } from "@/store/hooks";
import { Home } from "lucide-react";
import DiscoverySidebar from "@/components/layout/DiscoverySidebar";

export default function Home_Page() {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="grid grid-cols-12 gap-6 pb-20">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Home className="size-6 text-brand-primary" />
                        {user ? "Your Feed" : "Global Feed"}
                    </h1>
                </div>

                <PostFeed sortBy={user ? "BEST" : "HOT"} />
            </div>

            {/* Right Sidebar - Discovery */}
            <div className="hidden lg:block lg:col-span-4 relative">
                <div className="sticky top-28 self-start h-[calc(100vh-140px)] w-full">
                    <DiscoverySidebar />
                </div>
            </div>
        </div>
    );
}