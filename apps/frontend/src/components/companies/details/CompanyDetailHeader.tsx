import React from "react";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompanyDetailHeaderProps {
    companyName: string;
    description: string;
}

export function CompanyDetailHeader({ companyName, description }: CompanyDetailHeaderProps) {
    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: `${companyName} on Dev.io`,
                text: description || `Check out ${companyName} on Dev.io`,
                url: url,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="rounded-xl text-muted-foreground hover:text-foreground -ml-4">
                <Link href="/jobs">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Board
                </Link>
            </Button>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl size-10"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
