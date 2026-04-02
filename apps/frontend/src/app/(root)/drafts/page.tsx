"use client";

import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PostFeed from "@/components/profile/posts/PostFeed";
import { FileText } from "lucide-react";
import Head from "next/head";

export default function DraftsPage() {
    const { user, status } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();
    const router = useRouter();

    useEffect(() => {
        if (status !== "loading" && !user) {
            router.push("/");
            openLogin();
        }
    }, [user, status, router, openLogin]);

    if (status === "loading" || !user) {
        return null;
    }

    return (
        <main className="max-w-3xl py-4 flex flex-col gap-8">
            <Head>
                <title>Your Drafts - Dev.io</title>
                <meta name="description" content="Manage your saved drafts." />
            </Head>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1.5 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(88,101,242,0.4)]" />
                    <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-foreground flex items-center gap-3">
                        <FileText className="h-8 w-8 text-brand-primary hidden sm:block" />
                        Your Drafts
                    </h1>
                </div>
                <p className="text-muted-foreground/80 text-sm font-medium ml-4.5">
                    Continue working on your unfinished posts.
                </p>
            </div>

            <div>
                <PostFeed
                    userId={user.id}
                    status="DRAFT"
                    limit={10}
                    isCurrentUser={true}
                />
            </div>
        </main>
    );
}
