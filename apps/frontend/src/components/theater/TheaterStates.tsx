"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TheaterLoadingProps {
    title?: string;
    subtitle?: string;
}

export function TheaterLoading({ 
    title = "Architecting Theater...", 
    subtitle = "Synchronizing lesson artifacts" 
}: TheaterLoadingProps) {
    return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-8">
            <div className="relative">
                <div className="size-24 rounded-[2.5rem] bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center animate-pulse">
                    <Loader2 className="size-10 text-brand-primary animate-spin" />
                </div>
            </div>
            <div className="space-y-2 text-center">
                <h2 className="font-black text-xs uppercase tracking-[0.4em] text-brand-primary/60 italic">{title}</h2>
                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );
}


interface TheaterErrorProps {
    title?: string;
    message?: string;
    onAction?: () => void;
    actionLabel?: string;
}

export function TheaterError({ 
    title = "Access Denied", 
    message = "This protocol requires a valid enrollment token. Redirecting to course landing page...",
    onAction,
    actionLabel = "Return to Surface"
}: TheaterErrorProps) {
    return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-8 p-6 text-center">
            <div className="size-24 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">

                <AlertCircle className="size-10" />
            </div>
            <div className="space-y-3">
                <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
                <p className="text-muted-foreground max-w-md mx-auto text-sm font-medium">{message}</p>
            </div>
            {onAction && (
                <Button
                    variant="outline"
                    className="mt-6 rounded-2xl border-white/10 h-12 px-8 uppercase font-black text-xs tracking-widest"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
