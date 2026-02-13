"use client";

import { usePathname } from "next/navigation";
import HomeLayout from "@/components/layout/HomeLayout";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isProblemWorkspace = pathname?.startsWith("/p/");

    if (isProblemWorkspace) {
        return (
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                <main className="flex-1 min-w-0 overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    return <HomeLayout>{children}</HomeLayout>;
}
