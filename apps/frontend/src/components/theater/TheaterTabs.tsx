"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscussionSection } from "@/components/theater/discussion/DiscussionSection";

interface TheaterTabsProps {
    lessonContent: string | null | undefined;
    lessonId: string;
}

export function TheaterTabs({
    lessonContent,
    lessonId
}: TheaterTabsProps) {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-white/5">
                <TabsList className="h-16 bg-transparent gap-12 p-0">
                    <TabsTrigger
                        value="overview"
                        className="cursor-pointer data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 font-black text-[10px] uppercase tracking-[0.3em] opacity-40 data-[state=active]:opacity-100 transition-all"
                    >
                        Description
                    </TabsTrigger>
                    <TabsTrigger
                        value="qa"
                        className="cursor-pointer data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 font-black text-[10px] uppercase tracking-[0.3em] opacity-40 data-[state=active]:opacity-100 transition-all"
                    >
                        Discussion
                    </TabsTrigger>

                </TabsList>
            </div>

            <div className="pt-12">
                <TabsContent
                    value="overview"
                    className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-1000"
                >
                    <div className="prose prose-invert max-w-none 
                        prose-h3:text-3xl prose-h3:font-black prose-h3:tracking-tighter prose-h3:mb-8
                        prose-p:text-muted-foreground/80 prose-p:text-xl prose-p:leading-relaxed prose-p:font-medium
                        prose-li:text-muted-foreground/70 prose-li:text-lg prose-li:font-medium space-y-12"
                    >
                        {lessonContent}
                    </div>
                </TabsContent>

                <TabsContent
                    value="qa"
                    className="mt-0 space-y-10 animate-in fade-in duration-700"
                >
                    <DiscussionSection lessonId={lessonId} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
