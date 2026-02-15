"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface CommunityNavProps {
    isMod?: boolean;
}

export default function CommunityNav({ isMod = false }: CommunityNavProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view")?.toLowerCase() || "posts";

    const navItems = ["Posts", "Members"];

    const handleSelect = (item: string) => {
        const value = item.toLowerCase();
        if (value === currentView) return;

        const params = new URLSearchParams(searchParams.toString());
        if (value === "posts") {
            params.delete("view");
        } else {
            params.set("view", value);
        }

        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-1 border-b border-border/50 px-2 lg:px-6">
            {navItems.map((item) => {
                const isActive = currentView === item.toLowerCase();

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
                                layoutId="community-nav-indicator"
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
