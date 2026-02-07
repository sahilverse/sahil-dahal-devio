"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Image as ImageIcon, Link as LinkIcon, BarChart2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { PostType } from "@devio/zod-utils";

export default function PostTypeTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramType = searchParams.get("type")?.toUpperCase() as PostType;
    const currentType = [PostType.TEXT, PostType.LINK, PostType.QUESTION].includes(paramType)
        ? paramType
        : PostType.TEXT;

    const handleTabChange = (value: string) => {
        router.push(`/create?type=${value.toLowerCase()}`);
    };

    const tabs = [
        { id: PostType.TEXT, label: "Post", icon: FileText },
        { id: PostType.QUESTION, label: "Questions", icon: BarChart2 },
        { id: PostType.LINK, label: "Link", icon: LinkIcon },
    ];

    return (
        <Tabs value={currentType} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-1 border-b border-border/40 rounded-none pb-0 px-4 lg:px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentType === tab.id;

                    return (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="relative flex items-center gap-2.5 px-5 py-4 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all duration-300 font-bold text-sm text-muted-foreground hover:text-foreground data-[state=active]:text-brand-primary cursor-pointer"
                        >
                            <Icon className={isActive ? "h-4 w-4 animate-in zoom-in-75 duration-300" : "h-4 w-4"} />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabPost"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </TabsTrigger>
                    );
                })}
            </TabsList>
        </Tabs>
    );
}
