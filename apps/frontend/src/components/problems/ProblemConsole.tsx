"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Terminal, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/problem";

interface ProblemConsoleProps {
    problem: Problem;
    consoleTab: string;
    setConsoleTab: (tab: string) => void;
    selectedTestCase: number;
    setSelectedTestCase: (index: number) => void;
    runData: {
        status: string;
        time: string | number | null;
        memory: number | null;
        stdout?: string | null;
        compile_output?: string | null;
    }[] | null | undefined;
    submitData: {
        status: string;
        score: number;
        runtime: number | null;
        memory: number | null;
        error?: string | null;
    } | null | undefined;
    isPending: boolean;
}

export function ProblemConsole({
    problem,
    consoleTab,
    setConsoleTab,
    selectedTestCase,
    setSelectedTestCase,
    runData,
    submitData,
    isPending
}: ProblemConsoleProps) {

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

    return (
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
                        {isPending ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <div className="w-12 h-12 rounded-full border-4 border-muted border-t-brand-primary animate-spin mb-4" />
                                <p className="font-semibold text-sm">Executing code...</p>
                                <p className="text-xs">Your code is being processed by Judge0</p>
                            </div>
                        ) : runData ? (
                            <div className="space-y-6 pb-4">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                    {runData.map((res: { status: string }, idx: number) => (
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

                                {runData[selectedTestCase] && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className={cn(
                                            "p-4 rounded-xl border flex items-center gap-4",
                                            runData[selectedTestCase].status === "Accepted"
                                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                                                : "bg-rose-500/5 border-rose-500/20 text-rose-500"
                                        )}>
                                            {runData[selectedTestCase].status === "Accepted"
                                                ? <CheckCircle2 className="w-8 h-8 opacity-80" />
                                                : <XCircle className="w-8 h-8 opacity-80" />}
                                            <div>
                                                <div className="text-lg font-black tracking-tight leading-none mb-1">
                                                    {runData[selectedTestCase].status}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                                                    Runtime: {runData[selectedTestCase].time}s | Memory: {runData[selectedTestCase].memory}KB
                                                </div>
                                            </div>
                                        </div>

                                        {renderInputs(problem.testCases[selectedTestCase]?.input || "")}

                                        {runData[selectedTestCase].stdout && (
                                            <div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1.5 tracking-wider">
                                                    Output
                                                </div>
                                                <div className="bg-muted/50 border border-border px-3 py-2 rounded-md font-mono text-xs text-foreground whitespace-pre-wrap break-all">
                                                    {runData[selectedTestCase].stdout}
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

                                        {runData[selectedTestCase].compile_output && (
                                            <div>
                                                <div className="text-[10px] text-rose-500 font-bold uppercase mb-1.5 tracking-wider">
                                                    Compile Output
                                                </div>
                                                <div className="bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md font-mono text-xs text-rose-500 whitespace-pre-wrap break-all overflow-y-auto max-h-32 shadow-inner">
                                                    {runData[selectedTestCase].compile_output}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : submitData ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                                {submitData.status === "ACCEPTED" ? (
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
                                        <h2 className="text-2xl font-black text-rose-500 tracking-tighter mb-2">{submitData.status}</h2>
                                        <p className="text-sm text-muted-foreground mb-6 font-medium">Score: {submitData.score}/100</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Runtime</div>
                                        <div className="text-sm font-black">{submitData.runtime}ms</div>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Memory</div>
                                        <div className="text-sm font-black">{submitData.memory}KB</div>
                                    </div>
                                </div>

                                {submitData.error && (
                                    <div className="w-full mt-6 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-left">
                                        <div className="text-[10px] uppercase font-bold text-rose-500 mb-2">Evaluation Error</div>
                                        <div className="text-xs font-mono text-rose-500/80 whitespace-pre-wrap line-clamp-4">{submitData.error}</div>
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
                                    <p className="text-sm leading-relaxed max-w-[200px]">Run your code against sample test cases to see the output here.</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
