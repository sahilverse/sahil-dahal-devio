"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface ProfileNavProps {
    isCurrentUser?: boolean;
}

export default function ProfileNav({
    isCurrentUser = false
}: ProfileNavProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view")?.toLowerCase() || "overview";

    const [activeView, setActiveView] = useState(currentView);

    useEffect(() => {
        setActiveView(currentView);
    }, [currentView]);

    const navItems = ["Overview", "Posts", "Saved", "About"];

    const visibleItems = isCurrentUser
        ? navItems
        : navItems.filter(item => item !== "Saved");

    const handleSelect = (item: string) => {
        const value = item.toLowerCase();
        setActiveView(value);

        const params = new URLSearchParams(searchParams.toString());
        if (value === "overview") {
            params.delete("view");
        } else {
            params.set("view", value);
        }

        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-1 border-b border-border/50 px-2 lg:px-6">
            {visibleItems.map((item) => {
                const isActive = activeView === item.toLowerCase();

                return (
                    <button
                        key={item}
                        onClick={() => handleSelect(item)}
                        className={cn(
                            "relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer hover:text-foreground",
                            isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {item}
                        {isActive && (
                            <motion.div
                                layoutId="profile-nav-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}