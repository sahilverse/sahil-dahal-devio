"use client";

import { useEffect, useState, useRef } from "react";
import {
    Panel,
    Group,
    Separator,
} from "react-resizable-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor, { OnMount } from "@monaco-editor/react";
import {
    Bug,
    ChevronRight,
    Play,
    Upload,
    Code2,
    FileText,
    History,
    Loader2,
    Terminal,
    Maximize2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Problem } from "@/types/problem";
import {
    useFetchBoilerplate,
    useSaveDraft
} from "@/hooks/useProblems";
import {
    useRunSubmission,
    useSubmitSubmission,
    useFetchSubmissions
} from "@/hooks/useSubmissions";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";
import ReactMarkdown from "react-markdown";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PROBLEM_LANGUAGES } from "./constants";
import React from "react";

interface ProblemWorkspaceProps {
    problem: Problem;
}

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { actualTheme } = useAppSelector((state) => state.theme);
    const { openLogin } = useAuthModal();

    // Editor & Language State
    const [language, setLanguage] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(`problem-lang-${problem.slug}`) || "python";
        }
        return "python";
    });

    const [code, setCode] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const debouncedData = useDebounce({ code, language }, 3000);

    // UI State
    const [activeTab, setActiveTab] = useState("description");
    const [consoleTab, setConsoleTab] = useState("testcase");
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

    // Queries & Mutations
    const { data: boilerplate, isLoading: isBoilerplateLoading } = useFetchBoilerplate(problem.slug, language);
    const saveDraftMutation = useSaveDraft();
    const runMutation = useRunSubmission();
    const {
        data: submissionsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isSubmissionsLoading
    } = useFetchSubmissions(problem.slug);

    const submitMutation = useSubmitSubmission();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync code with boilerplate or draft
    useEffect(() => {
        if (boilerplate?.code) {
            setCode(boilerplate.code);
            setIsDirty(false);
        }
    }, [boilerplate]);

    // Save language preference
    useEffect(() => {
        localStorage.setItem(`problem-lang-${problem.slug}`, language);
    }, [language, problem.slug]);

    // Auto-save draft
    useEffect(() => {
        if (user &&
            isDirty &&
            debouncedData.code &&
            debouncedData.language === language &&
            debouncedData.code !== boilerplate?.code
        ) {
            saveDraftMutation.mutate({
                slug: problem.slug,
                language,
                code: debouncedData.code
            });
        }
    }, [debouncedData, user, problem.slug, language, boilerplate?.code, isDirty]);

    const handleRun = async () => {
        if (!user) return openLogin();
        if (!code.trim()) return toast.error("Please write some code first.");

        setConsoleTab("result");
        setIsConsoleCollapsed(false);
        runMutation.mutate({ slug: problem.slug, code, language });
    };

    const handleSubmit = async () => {
        if (!user) return openLogin();
        if (!code.trim()) return toast.error("Please write some code first.");

        setConsoleTab("result");
        setIsConsoleCollapsed(false);

        submitMutation.mutate(
            { slug: problem.slug, code, language },
            {
                onError: (error: any) => {
                    const message = error.response?.data?.message || error.message;
                    if (error.response?.status === 403 && message?.toLowerCase().includes("verified")) {
                        toast.error("Please verify your account to submit solutions.", {
                            description: "Check your email for the verification link.",
                            action: {
                                label: "Resend",
                                onClick: () => console.log("Resend verification email")
                            }
                        });
                    } else {
                        toast.error(message || "Failed to submit solution");
                    }
                }
            }
        );
    };

    const handleRunRef = useRef(handleRun);
    useEffect(() => {
        handleRunRef.current = handleRun;
    }, [handleRun]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleRunRef.current();
        });
    };

    // Helper to split test case input by \n
    const renderInputs = (input: string) => {
        const lines = input.split('\n').filter(l => l.trim() !== '');
        return lines.map((line, idx) => {
            const paramName = problem.inputStructure?.[idx]?.name;
            const label = paramName ? paramName : `Input ${idx + 1}`;

            return (
                <div key={idx} className="mb-4 last:mb-0">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 tracking-wider">
                        {label}
                    </div>
                    <div className="bg-muted/50 border border-border px-3 py-2 rounded-md font-mono text-xs whitespace-pre-wrap break-all">
                        {line}
                    </div>
                </div>
            );
        });
    };

    if (!problem) return null;

    return (
        <div className="h-full w-full bg-background flex flex-col overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <Group orientation="horizontal">
                    {/* Left: Problem Details */}
                    <Panel defaultSize={40} minSize={20} className="bg-card">
                        <div className="h-full flex flex-col border-r border-border">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <div className="px-4 border-b border-border bg-card shrink-0">
                                    <TabsList className="bg-transparent gap-4 h-11 w-full justify-start overflow-x-auto no-scrollbar">
                                        <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                                            <FileText className="w-3.5 h-3.5" /> Description
                                        </TabsTrigger>
                                        <TabsTrigger value="editorial" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                                            <Bug className="w-3.5 h-3.5" /> Editorial
                                        </TabsTrigger>
                                        <TabsTrigger value="submissions" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                                            <History className="w-3.5 h-3.5" /> Submissions
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    <TabsContent value="description" className="h-full m-0 p-6 focus-visible:outline-none">
                                        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>

                                        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full font-bold",
                                                problem.difficulty === "EASY" && "bg-emerald-500/10 text-emerald-500",
                                                problem.difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-500",
                                                problem.difficulty === "HARD" && "bg-rose-500/10 text-rose-500"
                                            )}>
                                                {problem.difficulty}
                                            </span>

                                            {problem.cipherReward > 0 && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full font-bold border border-amber-500/20">
                                                    <span className="text-[10px] leading-none">+{problem.cipherReward}</span>
                                                    <div className="w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white">₵</div>
                                                </div>
                                            )}
                                            {problem.topics?.map(topic => (
                                                <Link
                                                    key={topic.id}
                                                    href={`/t/${topic.slug}`}
                                                    className="bg-muted px-2.5 py-1 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                                                >
                                                    {topic.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                                            <ReactMarkdown
                                                components={{
                                                    pre({ children }) {
                                                        return (
                                                            <pre className="!bg-muted/50 !border-border !my-4 !p-4 rounded-lg overflow-x-auto">
                                                                {children}
                                                            </pre>
                                                        );
                                                    },
                                                    code({ node, className, children, ...props }: any) {
                                                        const isBlock = !!className;
                                                        if (isBlock) {
                                                            return (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                        return (
                                                            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium border border-border/50 break-words my-0" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {problem.description}
                                            </ReactMarkdown>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="editorial" className="p-6">
                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground italic">
                                            Editorial coming soon.
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="submissions" className="p-0 h-full flex flex-col">
                                        {!user ? (
                                            <div className="flex flex-col items-center justify-center h-64 p-6 text-center space-y-4">
                                                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                                                    <History className="w-8 h-8 text-muted-foreground opacity-30" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-sm">Sign in to view submissions</h3>
                                                    <p className="text-xs text-muted-foreground">Track your progress and review previous attempts.</p>
                                                </div>
                                                <button
                                                    onClick={() => openLogin()}
                                                    className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-brand-primary/90 transition-colors"
                                                >
                                                    Sign In
                                                </button>
                                            </div>
                                        ) : isSubmissionsLoading ? (
                                            <div className="flex items-center justify-center h-48">
                                                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                                            </div>
                                        ) : submissionsData?.pages[0].items.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                                                <History className="w-8 h-8 opacity-20" />
                                                <p className="text-sm font-medium">No submissions yet.</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-y-auto">
                                                <div className="divide-y divide-border">
                                                    {submissionsData?.pages.map((page, pIdx) => (
                                                        <React.Fragment key={pIdx}>
                                                            {page.items.map((sub: any) => (
                                                                <div key={sub.id} className="p-4 hover:bg-muted/30 transition-colors group">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className={cn(
                                                                            "text-xs font-bold uppercase tracking-wider",
                                                                            sub.status === "ACCEPTED" ? "text-emerald-500" : "text-rose-500"
                                                                        )}>
                                                                            {sub.status.replace("_", " ")}
                                                                        </div>
                                                                        <div className="text-[10px] text-muted-foreground font-medium">
                                                                            {new Date(sub.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                                                                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                                                            <Code2 className="w-2.5 h-2.5" /> {sub.language}
                                                                        </span>
                                                                        {sub.runtime !== null && (
                                                                            <span>{sub.runtime}ms</span>
                                                                        )}
                                                                        {sub.memory !== null && (
                                                                            <span>{(sub.memory / 1024).toFixed(1)}MB</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                {hasNextPage && (
                                                    <div className="p-4 flex justify-center border-t border-border">
                                                        <button
                                                            onClick={() => fetchNextPage()}
                                                            disabled={isFetchingNextPage}
                                                            className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
                                                        >
                                                            {isFetchingNextPage ? (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                                                </>
                                                            ) : (
                                                                "Load More"
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </Panel>

                    <Separator className="w-1.5 bg-transparent hover:bg-brand-primary/20 transition-colors flex items-center justify-center group">
                        <div className="w-0.5 h-12 bg-border group-hover:bg-brand-primary rounded-full transition-colors" />
                    </Separator>

                    {/* Right: Code & Console */}
                    <Panel defaultSize={60} minSize={30}>
                        <Group orientation="vertical">
                            {/* Editor Section */}
                            <Panel defaultSize={70} minSize={20} className="bg-card flex flex-col">
                                {/* Editor Toolbar */}
                                <div className="h-11 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-md border border-border/50 relative">
                                            <select
                                                value={language}
                                                onChange={(e) => {
                                                    const newLang = e.target.value;
                                                    setLanguage(newLang);
                                                    setCode("");
                                                    setIsDirty(false);
                                                }}
                                                className="bg-transparent border-none outline-none text-xs font-bold text-foreground cursor-pointer appearance-none pr-6 focus:ring-0 z-10 w-full"
                                            >
                                                {Object.entries(PROBLEM_LANGUAGES).map(([key, value]) => (
                                                    <option key={key} value={key} className="bg-card">
                                                        {value.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>

                                        {saveDraftMutation.isPending && (
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded animate-pulse">
                                                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleRun}
                                            disabled={runMutation.isPending || submitMutation.isPending}
                                            className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                        >
                                            {runMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                            Run
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={runMutation.isPending || submitMutation.isPending}
                                            className="px-4 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold border border-brand-primary-dark/20 transition-all flex items-center gap-1.5 shadow-[0_2px_8px_-2px_rgba(88,101,242,0.4)] hover:shadow-none active:scale-95 disabled:opacity-50 cursor-pointer"
                                        >
                                            {submitMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            Submit
                                        </button>
                                    </div>
                                </div>

                                {/* Monaco Editor */}
                                <div className="flex-1 overflow-hidden relative">
                                    {isBoilerplateLoading && (
                                        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                                        </div>
                                    )}
                                    {mounted ? (
                                        <Editor
                                            height="100%"
                                            language={PROBLEM_LANGUAGES[language]?.monaco || "plaintext"}
                                            theme={actualTheme === 'dark' ? 'vs-dark' : 'light'}
                                            value={code}
                                            onChange={(val) => {
                                                setCode(val || "");
                                                setIsDirty(true);
                                            }}
                                            onMount={handleEditorDidMount}
                                            options={{
                                                fontSize: 14,
                                                fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
                                                wordWrap: 'on',
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                padding: { top: 16 },
                                                cursorSmoothCaretAnimation: "on",
                                                smoothScrolling: true,
                                                contextmenu: false,
                                                automaticLayout: true,
                                                quickSuggestions: true,
                                                parameterHints: { enabled: true },
                                                suggestOnTriggerCharacters: true,
                                                folding: false,
                                                lineNumbers: "on",
                                                renderLineHighlight: "line",
                                                overviewRulerBorder: false,
                                                hideCursorInOverviewRuler: true,
                                                scrollbar: {
                                                    verticalScrollbarSize: 8,
                                                    horizontalScrollbarSize: 8,
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-card flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </Panel>

                            <Separator className="h-1.5 bg-transparent hover:bg-brand-primary/20 transition-colors flex items-center justify-center group">
                                <div className="w-12 h-0.5 bg-border group-hover:bg-brand-primary rounded-full transition-colors" />
                            </Separator>

                            {/* Console Section */}
                            <Panel defaultSize={30} minSize={10} className="bg-card overflow-hidden">
                                <div className="h-full flex flex-col">
                                    <Tabs value={consoleTab} onValueChange={setConsoleTab} className="flex-1 flex flex-col overflow-hidden">
                                        <div className="h-11 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
                                            <TabsList className="bg-transparent gap-4 h-full w-full justify-start overflow-x-auto no-scrollbar">
                                                <TabsTrigger value="testcase" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                                                    <Terminal className="w-3.5 h-3.5" /> Testcase
                                                </TabsTrigger>
                                                <TabsTrigger value="result" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-primary data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none shadow-none px-0 h-full text-xs gap-2 transition-all font-semibold cursor-pointer">
                                                    <Play className="w-3.5 h-3.5" /> Result
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <div className="flex-1 overflow-y-auto no-scrollbar">
                                            <TabsContent value="testcase" className="h-full m-0 p-4">
                                                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar py-1">
                                                    {problem.testCases?.map((tc, idx) => (
                                                        <button
                                                            key={tc.id}
                                                            onClick={() => setSelectedTestCase(idx)}
                                                            className={cn(
                                                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                                                                selectedTestCase === idx
                                                                    ? "bg-muted border-border text-foreground shadow-sm"
                                                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/30"
                                                            )}
                                                        >
                                                            Case {idx + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                {problem.testCases?.[selectedTestCase] && (
                                                    <div className="space-y-6">
                                                        {renderInputs(problem.testCases[selectedTestCase].input)}

                                                        <div>
                                                            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 tracking-wider">
                                                                Expected Output
                                                            </div>
                                                            <div className="bg-muted/50 border border-border px-3 py-2 rounded-md font-mono text-xs whitespace-pre-wrap break-all">
                                                                {problem.testCases[selectedTestCase].output}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="result" className="h-full m-0 p-4">
                                                {runMutation.isPending || submitMutation.isPending ? (
                                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                                        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-brand-primary animate-spin mb-4" />
                                                        <p className="font-semibold text-sm">Executing code...</p>
                                                        <p className="text-xs">Your code is being processed by Judge0</p>
                                                    </div>
                                                ) : runMutation.data ? (
                                                    <div className="space-y-6 pb-4">
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                                            {runMutation.data.map((res: any, idx: number) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => setSelectedTestCase(idx)}
                                                                    className={cn(
                                                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-2",
                                                                        selectedTestCase === idx
                                                                            ? "bg-muted border-border text-foreground shadow-sm"
                                                                            : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/30"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-1.5 h-1.5 rounded-full",
                                                                        res.status === "Accepted" ? "bg-emerald-500" : "bg-rose-500"
                                                                    )} />
                                                                    Case {idx + 1}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {runMutation.data[selectedTestCase] && (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                <div className={cn(
                                                                    "p-4 rounded-xl border flex items-center gap-4",
                                                                    runMutation.data[selectedTestCase].status === "Accepted"
                                                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                                                                        : "bg-rose-500/5 border-rose-500/20 text-rose-500"
                                                                )}>
                                                                    {runMutation.data[selectedTestCase].status === "Accepted"
                                                                        ? <CheckCircle2 className="w-8 h-8 opacity-80" />
                                                                        : <XCircle className="w-8 h-8 opacity-80" />}
                                                                    <div>
                                                                        <div className="text-lg font-black tracking-tight leading-none mb-1">
                                                                            {runMutation.data[selectedTestCase].status}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                                                                            Runtime: {runMutation.data[selectedTestCase].time}s | Memory: {runMutation.data[selectedTestCase].memory}KB
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {renderInputs(problem.testCases[selectedTestCase]?.input || "")}

                                                                {runMutation.data[selectedTestCase].stdout && (
                                                                    <div>
                                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 tracking-wider">
                                                                            Output
                                                                        </div>
                                                                        <div className="bg-muted/50 border border-border px-3 py-2 rounded-md font-mono text-xs text-foreground whitespace-pre-wrap break-all">
                                                                            {runMutation.data[selectedTestCase].stdout}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 tracking-wider">
                                                                        Expected Output
                                                                    </div>
                                                                    <div className="bg-muted/50 border border-border px-3 py-2 rounded-md font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
                                                                        {problem.testCases[selectedTestCase]?.output}
                                                                    </div>
                                                                </div>

                                                                {runMutation.data[selectedTestCase].compile_output && (
                                                                    <div>
                                                                        <div className="text-[10px] text-rose-500 font-bold uppercase mb-1.5 tracking-wider">
                                                                            Compile Output
                                                                        </div>
                                                                        <div className="bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md font-mono text-xs text-rose-500 whitespace-pre-wrap break-all overflow-y-auto max-h-32 shadow-inner">
                                                                            {runMutation.data[selectedTestCase].compile_output}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : submitMutation.data ? (
                                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                                                        {submitMutation.data.status === "ACCEPTED" ? (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                                                </div>
                                                                <h2 className="text-2xl font-black text-emerald-500 tracking-tighter mb-2">Success!</h2>
                                                                <p className="text-sm text-muted-foreground mb-6 font-medium">Your solution was accepted with 100% score.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                                                                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                                                                </div>
                                                                <h2 className="text-2xl font-black text-rose-500 tracking-tighter mb-2">{submitMutation.data.status}</h2>
                                                                <p className="text-sm text-muted-foreground mb-6 font-medium">Score: {submitMutation.data.score}/100</p>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                                                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Runtime</div>
                                                                <div className="text-sm font-black">{submitMutation.data.runtime}ms</div>
                                                            </div>
                                                            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                                                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Memory</div>
                                                                <div className="text-sm font-black">{submitMutation.data.memory}KB</div>
                                                            </div>
                                                        </div>

                                                        {submitMutation.data.error && (
                                                            <div className="w-full mt-6 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-left">
                                                                <div className="text-[10px] uppercase font-bold text-rose-500 mb-2">Evaluation Error</div>
                                                                <div className="text-xs font-mono text-rose-500/80 whitespace-pre-wrap line-clamp-4">{submitMutation.data.error}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
                                                        <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mb-2">
                                                            <Terminal className="w-8 h-8 opacity-40 shrink-0" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">No results yet</p>
                                                            <p className="text-[11px] leading-relaxed max-w-[200px]">Run your code against sample test cases to see the output here.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>

            {/* Mobile Footer (Visible only on mobile) */}
            <div className="lg:hidden h-14 border-t border-border flex items-center justify-between px-4 bg-card shrink-0">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
                        <Terminal className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRun}
                        disabled={runMutation.isPending || submitMutation.isPending}
                        className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border transition-all flex items-center gap-1.5"
                    >
                        Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={runMutation.isPending || submitMutation.isPending}
                        className="px-4 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold border border-brand-primary/20 transition-all flex items-center gap-1.5"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
