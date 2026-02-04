"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import Sidebar from "./Sidebar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useAppSelector((state) => state.ui);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)");

        const updateOverflow = () => {
            if (isSidebarOpen && mediaQuery.matches) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        };

        updateOverflow();
        mediaQuery.addEventListener("change", updateOverflow);

        return () => {
            document.body.style.overflow = "";
            mediaQuery.removeEventListener("change", updateOverflow);
        };
    }, [isSidebarOpen]);

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-w-0 lg:py-4 md:px-4">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
