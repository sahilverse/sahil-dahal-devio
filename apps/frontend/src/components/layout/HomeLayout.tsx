"use client";

import { useAppSelector } from "@/store/hooks";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useAppSelector((state) => state.ui);
    return (
        <div className="px-4">
            <div
                className={cn(
                    "grid gap-6 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "grid-cols-1 md:grid-cols-[240px_1fr]" : "grid-cols-1 md:grid-cols-[0px_1fr]"
                )}
            >
                <Sidebar />
                <main className="min-w-0 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
