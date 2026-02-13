"use client";

import PostFeed from "@/components/profile/posts/PostFeed";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6 lg:pr-50">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {user ? "Your Feed" : "Global Feed"}
        </h1>
      </div>

      <PostFeed sortBy={user ? "BEST" : "HOT"} />
    </div>
  );
}