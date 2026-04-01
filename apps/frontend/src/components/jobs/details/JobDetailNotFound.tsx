import React from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobDetailNotFound() {
    return (
        <div className="container py-20 text-center space-y-6">
            <div className="bg-brand-primary/10 p-6 rounded-full w-fit mx-auto">
                <Briefcase className="h-12 w-12 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-black">Position Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                This job posting may have expired or was removed by the employer.
            </p>
            <Button asChild className="rounded-xl">
                <Link href="/jobs">Return to Job Board</Link>
            </Button>
        </div>
    );
}
