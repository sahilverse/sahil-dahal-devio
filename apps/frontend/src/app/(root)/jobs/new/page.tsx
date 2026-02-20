"use client";

import React from "react";
import PostJobForm from "@/components/jobs/PostJobForm";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { openLogin } = useAuthModal();
    const router = useRouter();

    React.useEffect(() => {
        if (!user) {
            openLogin();
            router.replace("/jobs");
        }
    }, [user, openLogin, router]);

    if (!user) return null;

    return (
        <div className="container max-w-5xl py-6 space-y-10">
            {/* Minimal Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="w-fit -ml-4 rounded-xl text-muted-foreground hover:text-foreground">
                    <Link href="/jobs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Board
                    </Link>
                </Button>

                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <div className="bg-brand-primary/10 p-2 rounded-xl">
                            <Briefcase className="h-8 w-8 text-brand-primary" />
                        </div>
                        Post a New Role
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">
                        Reach the next generation of engineers on Dev.io.
                    </p>
                </div>
            </div>

            <PostJobForm />
        </div>
    );
}
