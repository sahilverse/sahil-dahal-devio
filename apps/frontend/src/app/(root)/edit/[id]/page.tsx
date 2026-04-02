"use client";

import { use } from "react";
import CreatePage from "@/components/create/CreatePage";
import { useFetchPost } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: post, isLoading, error } = useFetchPost(id);

    if (isLoading) {
        return (
            <main className="max-w-3xl py-4 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Loading post...</p>
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="max-w-3xl py-4 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <p className="text-sm font-medium">Post not found or you don&apos;t have permission to edit it.</p>
                </div>
            </main>
        );
    }

    return <CreatePage initialData={post} isEdit />;
}
