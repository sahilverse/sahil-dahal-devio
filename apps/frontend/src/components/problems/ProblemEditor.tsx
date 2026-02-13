"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Upload, ChevronDown } from "lucide-react";
import Editor, { OnMount } from "@monaco-editor/react";
import { PROBLEM_LANGUAGES } from "./constants";
import { useAppSelector } from "@/store/hooks";

interface ProblemEditorProps {
    language: string;
    setLanguage: (lang: string) => void;
    code: string;
    setCode: (code: string) => void;
    setIsDirty: (dirty: boolean) => void;
    handleRun: () => void;
    handleSubmit: () => void;
    isRunning: boolean;
    isSubmitting: boolean;
    isSavingDraft: boolean;
    isBoilerplateLoading: boolean;
    mounted: boolean;
    handleEditorDidMount: OnMount;
}

export function ProblemEditor({
    language,
    setLanguage,
    code,
    setCode,
    setIsDirty,
    handleRun,
    handleSubmit,
    isRunning,
    isSubmitting,
    isSavingDraft,
    isBoilerplateLoading,
    mounted,
    handleEditorDidMount
}: ProblemEditorProps) {
    const { actualTheme } = useAppSelector((state) => state.theme);

    return (
        <div className="bg-card flex flex-col h-full">
            {/* Editor Toolbar */}
            <div className="h-11 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
                <div className="flex items-center gap-4">
                    <Select value={language} onValueChange={(val) => {
                        setLanguage(val);
                        setCode("");
                        setIsDirty(false);
                    }}>
                        <SelectTrigger size="sm" className="h-7 px-2 text-xs font-bold bg-muted/50 border-border/50 gap-1 min-w-[100px] cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" className="bg-card border-border">
                            {Object.entries(PROBLEM_LANGUAGES).map(([key, value]) => (
                                <SelectItem key={key} value={key} className="text-xs cursor-pointer">
                                    {value.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {isSavingDraft && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded animate-pulse">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                        className="px-4 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold border border-brand-primary-dark/20 transition-all flex items-center gap-1.5 shadow-[0_2px_8px_-2px_rgba(88,101,242,0.4)] hover:shadow-none active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
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
        </div>
    );
}
