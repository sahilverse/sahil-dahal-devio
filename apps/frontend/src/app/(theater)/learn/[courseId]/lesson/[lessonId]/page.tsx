"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/api/courseService";
import { 
    ResizableHandle, 
    ResizablePanel, 
    ResizablePanelGroup as Group
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    PlayCircle, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    FileText, 
    MessageSquare, 
    Info, 
    Download,
    Search,
    PlaySquare,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { API_URL } from "@/lib/constants";

export default function CoursePlayerPage() {
    const params = useParams() as { courseId: string; lessonId: string };
    const router = useRouter();
    const queryClient = useQueryClient();
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [commentContent, setCommentContent] = useState("");

    // 1. Fetch Lesson Data
    const { data: lesson, isLoading: isLessonLoading, error: lessonError } = useQuery({
        queryKey: ["lesson", params.lessonId],
        queryFn: () => courseService.getLessonById(params.lessonId),
        enabled: !!params.lessonId && params.lessonId !== "start",
    });

    // 2. Fetch Course & Modules for Sidebar
    const { data: course } = useQuery({
        queryKey: ["course", params.courseId],
        queryFn: () => courseService.getCourseBySlug(params.courseId),
    });

    const { data: modules, isLoading: isModulesLoading } = useQuery({
        queryKey: ["course-modules", course?.id],
        queryFn: () => courseService.getCourseModules(course!.id),
        enabled: !!course?.id,
    });

    // 3. Fetch Comments
    const { data: commentsResponse, isLoading: isCommentsLoading } = useQuery({
        queryKey: ["lesson-comments", params.lessonId],
        queryFn: () => courseService.getLessonComments(params.lessonId, { limit: 10 }),
        enabled: !!params.lessonId && params.lessonId !== "start",
    });

    // 4. Mutation for posting comments
    const postCommentMutation = useMutation({
        mutationFn: (content: string) => courseService.postComment(params.lessonId, { content }),
        onSuccess: () => {
            setCommentContent("");
            toast.success("Comment posted!");
            queryClient.invalidateQueries({ queryKey: ["lesson-comments", params.lessonId] });
        },
        onError: () => toast.error("Failed to post comment."),
    });

    const toggleModule = (id: string) => {
        setExpandedModules(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    // Auto-expand current module
    useEffect(() => {
        if (modules && lesson) {
            const currentModule = modules.find(m => m.lessons.some(l => l.id === lesson.id));
            if (currentModule && !expandedModules.includes(currentModule.id)) {
                setExpandedModules(prev => [...prev, currentModule.id]);
            }
        }
    }, [modules, lesson]);

    if (isLessonLoading || isModulesLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Preparing Lesson...</p>
            </div>
        );
    }

    if (lessonError) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                 <h2 className="text-2xl font-bold">Error Loading Lesson</h2>
                 <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background">
            <Group orientation="horizontal" className="flex-1">
                {/* Main Player Area */}
                <ResizablePanel defaultSize={75} minSize={50}>
                    <div className="h-full flex flex-col overflow-hidden">
                        {/* Video Player Section */}
                        <div className="aspect-video bg-black w-full relative flex items-center justify-center shadow-2xl">
                            {lesson?.videoUrl ? (
                                lesson.videoStatus === "READY" ? (
                                    <VideoPlayer 
                                        src={`${API_URL?.replace(/\/$/, "")}/courses/lessons/${params.lessonId}/stream/master.m3u8`}
                                        title={lesson.title}
                                    />
                                ) : (
                                    <div className="text-white flex flex-col items-center gap-4">
                                         <Loader2 className="size-10 text-primary animate-spin" />
                                         <p className="font-bold tracking-widest uppercase text-xs">Video is still processing...</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-white flex flex-col items-center gap-4 opacity-50">
                                    <FileText className="size-20" />
                                    <p className="font-bold">Text-based Lesson Content Below</p>
                                </div>
                            )}
                        </div>

                        {/* Content Header & Tabs */}
                        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                            <div className="p-8 border-b border-border/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-black tracking-tight">{lesson?.title || "Welcome to the Course"}</h1>
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Info className="size-3" /> Lesson Details</span>
                                        <span className="flex items-center gap-1.5"><PlayCircle className="size-3" /> {lesson?.duration ? `${Math.floor(lesson.duration/60)}m` : "10m"}</span>
                                    </div>
                                </div>
                                <Button className="font-bold shadow-lg shadow-primary/20 rounded-xl" size="sm">
                                    <CheckCircle2 className="mr-2 size-4" /> Mark as Complete
                                </Button>
                            </div>

                            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                                <div className="px-8 border-b border-border/10">
                                    <TabsList className="h-14 bg-transparent gap-8">
                                        <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">Overview</TabsTrigger>
                                        <TabsTrigger value="qa" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest text-nowrap">Q&A ({commentsResponse?.items.length || 0})</TabsTrigger>
                                        <TabsTrigger value="resources" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">Resources</TabsTrigger>
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-8 max-w-4xl mx-auto">
                                        <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="prose prose-invert max-w-none prose-h3:text-xl prose-h3:font-black prose-p:text-muted-foreground prose-li:text-muted-foreground leading-relaxed">
                                                {lesson?.content ? (
                                                     <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                                ) : (
                                                    <div className="space-y-4">
                                                        <h3>Lesson Brief</h3>
                                                        <p>In this lesson, we break down the core architecture of Devio Learn. We will discuss the fundamental choices made during the development of this project-based platform.</p>
                                                        <ul>
                                                            <li>How HLS streaming works in Devio</li>
                                                            <li>Integration with Redis for real-time progress</li>
                                                            <li>Managing complex state in the course player</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="qa" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                            <div className="flex gap-4 bg-muted/20 p-6 rounded-3xl border border-border/50">
                                                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg text-white font-black italic">D</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="relative group">
                                                        <Input 
                                                            placeholder="Ask a question about this lesson..." 
                                                            className="h-12 rounded-xl pr-12 border-border/50 focus:border-primary/50 transition-all bg-background" 
                                                            value={commentContent}
                                                            onChange={(e) => setCommentContent(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && postCommentMutation.mutate(commentContent)}
                                                        />
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="absolute right-1 top-1 h-10 w-10 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            onClick={() => postCommentMutation.mutate(commentContent)}
                                                            disabled={postCommentMutation.isPending || !commentContent.trim()}
                                                        >
                                                            {postCommentMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-2">
                                                {commentsResponse?.items.map((comment) => (
                                                    <div key={comment.id} className="flex gap-4 p-6 rounded-3xl bg-card/40 border border-border/10 hover:border-primary/20 transition-all group">
                                                        <img src={comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user.username}`} className="size-10 rounded-2xl border border-border shadow-sm shrink-0" alt={comment.user.username} />
                                                        <div className="space-y-2 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-sm text-primary">{comment.user.username}</span>
                                                                    <span className="size-1 bg-muted-foreground/30 rounded-full" />
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">2 hours ago</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-medium leading-relaxed">{comment.content}</p>
                                                            <div className="flex items-center gap-6 pt-2">
                                                                <button className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Reply</button>
                                                                {comment.replyCount > 0 && <button className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-1.5"><MessageSquare className="size-3" /> {comment.replyCount} Replies</button>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {commentsResponse?.items.length === 0 && (
                                                    <div className="py-20 text-center space-y-4">
                                                         <MessageSquare className="size-12 mx-auto text-muted-foreground/20" />
                                                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No questions yet. Be the first to ask!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="resources" className="mt-0">
                                            <div className="space-y-3 prose prose-invert max-w-none">
                                                <h3>Lesson Material</h3>
                                                <div className="flex items-center justify-between p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors cursor-pointer group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                            <FileText className="size-5 text-blue-500 group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black">Project_Asset_Starter.zip</p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">2.4 MB • ZIP Archive</p>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="rounded-lg">
                                                        <Download className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </Tabs>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Sidebar - Syllabus */}
                <ResizablePanel defaultSize={25} minSize={20} className="bg-card/20 backdrop-blur-md">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-border/10 bg-background/20 flex items-center justify-between">
                            <h2 className="font-black flex items-center gap-2 text-sm tracking-tight uppercase">
                                <PlaySquare className="size-4 text-primary" />
                                Course Content
                            </h2>
                            <Badge variant="outline" className="text-[10px] font-black tracking-widest px-2 py-0 border-primary/20 text-primary">35% COMPLETE</Badge>
                        </div>
                        <ScrollArea className="flex-1">
                            {modules?.map((module) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <div key={module.id} className="border-b border-border/10">
                                        <button 
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-all text-left group"
                                        >
                                            <span className="font-black text-xs uppercase tracking-wider group-hover:text-primary">{module.title}</span>
                                            {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                                        </button>
                                        {isExpanded && (
                                            <div className="bg-background/40">
                                                {module.lessons.map((l) => (
                                                    <Link 
                                                        key={l.id} 
                                                        href={`/learn/${params.courseId}/lesson/${l.id}`}
                                                        className={`flex items-start gap-4 p-5 pl-8 cursor-pointer hover:bg-primary/10 transition-all group border-l-2 ${l.id === params.lessonId ? 'bg-primary/5 border-primary shadow-inner' : 'border-transparent'}`}
                                                    >
                                                        <div className="mt-1 shrink-0">
                                                            {l.id === params.lessonId ? (
                                                                <Loader2 className="size-4 text-primary animate-spin" />
                                                            ) : (
                                                                <PlayCircle className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className={`text-xs font-extrabold leading-tight tracking-tight ${l.id === params.lessonId ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                                {l.title}
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{l.duration ? `${Math.floor(l.duration/60)}m` : "10m"}</span>
                                                                {l.type === 'TEXT' && <Badge variant="secondary" className="text-[8px] px-1 h-3 font-bold uppercase tracking-widest border-none opacity-60">Text</Badge>}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </Group>
        </div>
    );
}
