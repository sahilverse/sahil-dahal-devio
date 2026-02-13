"use client";

import { useExploreCommunities } from "@/hooks/useCommunities";
import { Compass, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CommunityRow } from "@/components/community/CommunityRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

export default function ExplorePage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useExploreCommunities();

    const { ref, inView } = useInView();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const topics = data?.pages.flatMap((page) => page.topics) || [];

    const toggleExpand = (slug: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(slug)) {
                next.delete(slug);
            } else {
                next.add(slug);
            }
            return next;
        });
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.5;
            scrollRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:pr-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Compass className="size-7 text-brand" />
                <h1 className="text-2xl font-bold tracking-tight">Explore Communities</h1>
            </div>

            {/* Topic Navigation Bar */}
            <div className="relative group/nav">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1"
                >
                    <Button
                        variant={selectedTopic === null ? "brand" : "secondary"}
                        size="sm"
                        className="rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap shrink-0"
                        onClick={() => setSelectedTopic(null)}
                    >
                        All
                    </Button>
                    {topics.map((topic: any) => (
                        <Button
                            key={topic.id}
                            variant={selectedTopic === topic.slug ? "brand" : "secondary"}
                            size="sm"
                            className="rounded-full px-4 h-8 text-xs font-semibold whitespace-nowrap shrink-0"
                            onClick={() => setSelectedTopic(topic.slug)}
                        >
                            {topic.name}
                        </Button>
                    ))}
                </div>

                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-8 flex items-center justify-center bg-card border rounded-full shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-8 flex items-center justify-center bg-card border rounded-full shadow-md opacity-0 group-hover/nav:opacity-100 transition-opacity"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-10">
                {topics
                    .filter(t => !selectedTopic || t.slug === selectedTopic)
                    .map((topic: any) => (
                        <TopicSection
                            key={topic.id}
                            topic={topic}
                            isExpanded={expandedTopics.has(topic.slug)}
                            onToggle={() => toggleExpand(topic.slug)}
                        />
                    ))}
            </div>

            {/* Infinite Scroll Trigger (only when not filtered) */}
            {!selectedTopic && (
                <div ref={ref} className="h-20 flex justify-center items-center">
                    {isFetchingNextPage && (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}
        </div>
    );
}

function TopicSection({ topic, isExpanded, onToggle }: { topic: any, isExpanded: boolean, onToggle: () => void }) {
    const { data: expandedData, isLoading } = useExploreCommunities(12, isExpanded ? topic.slug : undefined);

    const communities = isExpanded && expandedData
        ? expandedData.pages[0].topics[0]?.communities || []
        : topic.communities;

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-bold px-1 capitalize">{topic.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                {communities.map((item: any) => (
                    <CommunityRow
                        key={item.community.id}
                        community={item.community}
                        className="py-1.5"
                    />
                ))}
            </div>

            {topic.communities.length >= 5 && !isExpanded && (
                <div className="pt-2 px-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="h-8 text-xs font-bold text-brand hover:text-brand hover:bg-brand/5 rounded-full"
                    >
                        View More
                    </Button>
                </div>
            )}

            {isExpanded && isLoading && (
                <div className="flex justify-start py-2 px-4">
                    <Loader2 className="size-4 animate-spin text-brand" />
                </div>
            )}
        </section>
    );
}
