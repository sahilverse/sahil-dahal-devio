"use client";

import PostFeed from "@/components/profile/posts/PostFeed";
import { useAppSelector } from "@/store/hooks";
import { Home } from "lucide-react";

export default function Home_Page() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6 lg:pr-50">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Home className="size-6 text-brand-primary" />
          {user ? "Your Feed" : "Global Feed"}
        </h1>
      </div>

      <PostFeed sortBy={user ? "BEST" : "HOT"} />
    </div>
  );
}