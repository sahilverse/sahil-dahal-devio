"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Panel,
    Group,
    Separator,
    useDefaultLayout,
    type LayoutStorage,
    type PanelImperativeHandle,
} from "react-resizable-panels";
import { OnMount } from "@monaco-editor/react";
import {
    Loader2,
    Maximize2,
    Terminal
} from "lucide-react";

import { Problem } from "@/types/problem";
import {
    useFetchBoilerplate,
    useSaveDraft
} from "@/hooks/useProblems";
import {
    useRunSubmission,
    useSubmitSubmission,
} from "@/hooks/useSubmissions";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { ProblemDescription } from "./ProblemDescription";
import { ProblemEditor } from "./ProblemEditor";
import { ProblemConsole } from "./ProblemConsole";

const storage: LayoutStorage = {
    getItem: (name) => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(name);
    },
    setItem: (name, value) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(name, value);
    },
};

interface ProblemWorkspaceProps {
    problem: Problem;
    eventId?: string;
}

export function ProblemWorkspace({ problem, eventId }: ProblemWorkspaceProps) {
    const { user } = useAppSelector((state) => state.auth);
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
    const debouncedCode = useDebounce(code, 3000);

    // UI State
    const [activeTab, setActiveTab] = useState("description");
    const [consoleTab, setConsoleTab] = useState("testcase");
    const [selectedTestCase, setSelectedTestCase] = useState(0);

    // Layout Persistence
    const mainLayout = useDefaultLayout({
        id: "problem-main-layout",
        storage,
        debounceSaveMs: 100,
    });

    const editorLayout = useDefaultLayout({
        id: "problem-editor-layout",
        storage,
        debounceSaveMs: 100,
    });

    // Queries & Mutations
    const { data: boilerplate, isLoading: isBoilerplateLoading } = useFetchBoilerplate(problem.slug, language);
    const saveDraftMutation = useSaveDraft();
    const runMutation = useRunSubmission();
    const submitMutation = useSubmitSubmission();

    const consolePanelRef = useRef<PanelImperativeHandle>(null);

    const expandConsoleIfNeeded = useCallback(() => {
        const panel = consolePanelRef.current;
        if (panel) {
            const size = panel.getSize();
            if (size.asPercentage < 15) {
                panel.resize("50%");
            }
        }
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync code with boilerplate or draft (only on initial load / language switch)
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
    const saveDraftRef = useRef(saveDraftMutation);
    saveDraftRef.current = saveDraftMutation;

    const isDirtyRef = useRef(isDirty);
    isDirtyRef.current = isDirty;

    useEffect(() => {
        if (user &&
            isDirtyRef.current &&
            debouncedCode &&
            debouncedCode !== boilerplate?.code
        ) {
            saveDraftRef.current.mutate({
                slug: problem.slug,
                language,
                code: debouncedCode
            }, {
                onSuccess: () => {
                    setIsDirty(false);
                }
            });
        }
    }, [debouncedCode, user, problem.slug, language, boilerplate?.code]);

    const handleRun = useCallback(async () => {
        if (!user) return openLogin();
        if (!code.trim()) return toast.error("Please write some code first.");

        setConsoleTab("result");
        expandConsoleIfNeeded();
        runMutation.mutate({ slug: problem.slug, code, language });
    }, [user, code, language, problem.slug, runMutation, openLogin, expandConsoleIfNeeded]);

    const handleSubmit = async () => {
        if (!user) return openLogin();
        if (!code.trim()) return toast.error("Please write some code first.");

        setConsoleTab("result");
        expandConsoleIfNeeded();

        submitMutation.mutate({ slug: problem.slug, code, language, eventId });
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

    if (!problem) return null;
    if (!mounted) return (
        <div className="h-full w-full bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
    );

    return (
        <div className="h-full w-full bg-background flex flex-col overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <Group
                    orientation="horizontal"
                    id="main-group"
                    defaultLayout={mainLayout.defaultLayout}
                    onLayoutChanged={mainLayout.onLayoutChanged}
                >
                    {/* Left: Problem Details */}
                    <Panel id="problem-details" defaultSize={60} minSize={20} className="bg-card">
                        <ProblemDescription
                            problem={problem}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </Panel>

                    <Separator className="w-1.5 bg-border hover:bg-brand-primary/50 transition-colors cursor-col-resize z-50 flex items-center justify-center group outline-none ring-0">
                        <div className="w-0.5 h-8 bg-muted-foreground/20 group-hover:bg-brand-primary rounded-full transition-colors" />
                    </Separator>

                    {/* Right: Code & Console */}
                    <Panel id="problem-editor-container" defaultSize={60} minSize={30}>
                        <Group
                            orientation="vertical"
                            id="editor-group"
                            defaultLayout={editorLayout.defaultLayout}
                            onLayoutChanged={editorLayout.onLayoutChanged}
                        >
                            {/* Editor Section */}
                            <Panel id="problem-editor" defaultSize={70} minSize={20} className="bg-card flex flex-col">
                                <ProblemEditor
                                    language={language}
                                    setLanguage={setLanguage}
                                    code={code}
                                    setCode={setCode}
                                    setIsDirty={setIsDirty}
                                    handleRun={handleRun}
                                    handleSubmit={handleSubmit}
                                    isRunning={runMutation.isPending}
                                    isSubmitting={submitMutation.isPending}
                                    isSavingDraft={saveDraftMutation.isPending}
                                    isBoilerplateLoading={isBoilerplateLoading}
                                    mounted={mounted}
                                    handleEditorDidMount={handleEditorDidMount}
                                />
                            </Panel>

                            <Separator className="h-1.5 bg-border hover:bg-brand-primary/50 transition-colors cursor-row-resize z-50 flex items-center justify-center group outline-none ring-0">
                                <div className="w-12 h-0.5 bg-muted-foreground/20 group-hover:bg-brand-primary rounded-full transition-colors" />
                            </Separator>

                            {/* Console Section */}
                            <Panel id="console-panel" defaultSize={30} minSize={10} className="bg-card overflow-hidden" panelRef={consolePanelRef} collapsible collapsedSize={0}>
                                <ProblemConsole
                                    problem={problem}
                                    consoleTab={consoleTab}
                                    setConsoleTab={setConsoleTab}
                                    selectedTestCase={selectedTestCase}
                                    setSelectedTestCase={setSelectedTestCase}
                                    runData={runMutation.data}
                                    submitData={submitMutation.data}
                                    isPending={runMutation.isPending || submitMutation.isPending}
                                />
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>

            {/* Mobile Footer */}
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
