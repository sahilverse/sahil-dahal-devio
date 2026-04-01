"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LibrarySquare } from "lucide-react";
import { useParams } from "next/navigation";

export default function TheaterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams() as { courseId: string };

    return (

        <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
            {/* Minimal Top Navigation */}
            <header className="h-14 shrink-0 border-b border-border/50 bg-background/95 backdrop-blur z-50 flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4">
                    <Link href={`/learn/${params.courseId}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 rounded-md hover:bg-muted/50">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="sr-only">Back to courses</span>
                    </Link>
                    <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                        <LibrarySquare className="w-5 h-5 text-primary" />
                        <span className="font-bold hidden sm:inline-block">Devio Learn</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area (Player + Sidebar) */}
            <main className="flex-1 flex overflow-hidden">
                {children}
            </main>
        </div>
    );
}
