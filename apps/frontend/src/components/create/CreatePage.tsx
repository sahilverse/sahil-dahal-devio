"use client";

import PostContextSelector from "./PostContextSelector";
import PostTypeTabs from "./PostTypeTabs";
import CreatePostForm from "./CreatePostForm";
import TitleInput from "./inputs/TitleInput";
import PostTypeContent from "./inputs/PostTypeContent";
import TopicSelector from "./TopicSelector";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/hooks/usePosts";
import CreatePostActions from "./CreatePostActions";


export default function CreatePage() {
    const { mutate: createPost, isPending } = useCreatePost();

    return (
        <main className="max-w-3xl py-4">
            <div
                className="flex flex-col gap-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/20">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1.5 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(88,101,242,0.4)]" />
                            <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-foreground">
                                Create a post
                            </h1>
                        </div>
                        <p className="text-muted-foreground/80 text-sm font-medium ml-4.5">
                            Share your thoughts and questions with the community.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 ml-4.5 lg:ml-0">
                        <Button variant="outline" className="rounded-3xl font-bold bg-card border-border/50 hover:bg-muted transition-colors shadow-sm px-5 group cursor-pointer">
                            <span className="text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">Drafts</span>
                            <span className="ml-2.5 bg-muted-foreground/10 group-hover:bg-muted-foreground/20 text-muted-foreground/60 group-hover:text-foreground transition-colors px-2 py-0.5 rounded-lg text-[10px] font-black">
                                1
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Posting Context & Main Card Shell */}
                <CreatePostForm onSubmit={(data) => createPost(data)} isPending={isPending}>
                    <div className="space-y-4">
                        <PostContextSelector />

                        <div className="bg-card rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300">
                            <PostTypeTabs />

                            <div className="p-8 space-y-4">
                                <TitleInput />
                                <TopicSelector />
                                <PostTypeContent />
                                <CreatePostActions isPending={isPending} />
                            </div>
                        </div>
                    </div>
                </CreatePostForm>
            </div>
        </main>
    );
}
