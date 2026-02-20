"use client";

import React from "react";
import CreateCompanyForm from "@/components/companies/CreateCompanyForm";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useRouter } from "next/navigation";

export default function CreateCompanyPage() {
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
        <div className="container max-w-3xl py-6 space-y-10">
            {/* Header section with back button */}
            <div className="space-y-6">
                <Button variant="ghost" asChild className="w-fit -ml-4 rounded-xl text-muted-foreground hover:text-foreground transition-all hover:bg-muted/50">
                    <Link href="/jobs">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Board
                    </Link>
                </Button>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
                        <div className="bg-brand-primary/10 p-3 rounded-2xl">
                            <Building2 className="h-10 w-10 text-brand-primary" />
                        </div>
                        Register Company
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
                        Establish your organization&apos;s presence on the platform to start posting jobs and connecting with top engineering talent.
                    </p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CreateCompanyForm />
            </div>

            <div className="bg-muted/30 border border-border/40 rounded-3xl p-6 text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Notice</p>
                <p className="text-sm text-foreground/70 px-4">
                    After registration, you&apos;ll need to verify your corporate domain to unlock official job posting privileges and the &quot;Verified&quot; badge.
                </p>
            </div>
        </div>
    );
}
