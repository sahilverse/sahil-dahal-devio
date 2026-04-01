import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyDetailNotFound() {
    return (
        <div className="container py-20 text-center space-y-6">
            <div className="bg-brand-primary/10 p-6 rounded-full w-fit mx-auto">
                <Building2 className="h-12 w-12 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black">Company Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                The organization you're looking for doesn't exist or has been removed from our records.
            </p>
            <Button asChild className="rounded-xl">
                <Link href="/jobs">Return to Job Board</Link>
            </Button>
        </div>
    );
}
