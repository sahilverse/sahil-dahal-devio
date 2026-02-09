"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { LANGUAGES, Language } from '@/components/code/constants';
import { useCompiler } from '@/hooks/useCompiler';
import { CodeHeader } from '@/components/code/CodeHeader';
import { CodeSidebar } from '@/components/code/CodeSidebar';
import { CodeTerminal } from '@/components/code/CodeTerminal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function OnlineCompilerPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#0B0B0F] flex items-center justify-center text-[#9CA3AF]">Loading IDE...</div>}>
            <OnlineCompiler />
        </Suspense>
    );
}

function OnlineCompiler() {
    const { isExecuting, output, runCode, sendInput, clearOutput } = useCompiler();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme } = useAppSelector((state) => state.theme);

    const [language, setLanguage] = useState(LANGUAGES.python);
    const [code, setCode] = useState(language.boilerplate);
    const [inputValue, setInputValue] = useState("");

    // UI States
    const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [editorFontSize, setEditorFontSize] = useState(14);

    // Responsive font size for editor
    useEffect(() => {
        const updateFontSize = () => {
            if (window.innerWidth < 640) {
                setEditorFontSize(12);
            } else if (window.innerWidth < 1024) {
                setEditorFontSize(13);
            } else {
                setEditorFontSize(14);
            }
        };
        updateFontSize();
        window.addEventListener('resize', updateFontSize);
        return () => window.removeEventListener('resize', updateFontSize);
    }, []);


    // Sync from URL on mount
    useEffect(() => {
        const langParam = searchParams.get('language');
        if (langParam && LANGUAGES[langParam]) {
            setLanguage(LANGUAGES[langParam]);
        }
    }, [searchParams]);

    // Update code when language changes
    useEffect(() => {
        setCode(language.boilerplate);
    }, [language]);

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setShowLanguageMenu(false);
        clearOutput();
        const params = new URLSearchParams(searchParams.toString());
        params.set('language', lang.id);
        router.push(`/code?${params.toString()}`, { scroll: false });
    };

    const handleRun = () => {
        runCode(language.id, code);
        if (window.innerWidth < 1024) {
            setActiveTab('output');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'dev.io Playground',
                    text: `Check out my ${language.name} code on dev.io!`,
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleTerminalInput = (val: string) => {
        setInputValue(val);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendInput(inputValue + '\n');
            setInputValue("");
        }
    };


    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop Sidebar */}
                <CodeSidebar
                    selectedLanguage={language}
                    onLanguageChange={handleLanguageChange}
                    className="hidden lg:flex"
                />

                {/* Mobile Language Menu (Side Drawer) */}
                {showLanguageMenu && (
                    <div
                        className="absolute inset-0 z-50 bg-black/60 lg:hidden animate-in fade-in duration-200"
                        onClick={() => setShowLanguageMenu(false)}
                    >
                        <div
                            className="bg-card w-[80%] max-w-[280px] h-full p-6 border-r border-border shadow-2xl animate-in slide-in-from-left duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-brand-primary rounded-full" />
                                    Languages
                                </h3>

                                <button onClick={() => setShowLanguageMenu(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <CodeSidebar
                                selectedLanguage={language}
                                onLanguageChange={handleLanguageChange}
                                isMobile
                                className="bg-transparent border-none py-0 w-full"
                            />
                        </div>
                    </div>
                )}


                <main className="flex-1 flex flex-col min-w-0">
                    <CodeHeader
                        language={language}
                        isExecuting={isExecuting}
                        onRun={handleRun}
                        onShare={handleShare}
                        showLanguageMenu={showLanguageMenu}
                        setShowLanguageMenu={setShowLanguageMenu}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <div className="flex-1 flex overflow-hidden">
                        {/* Editor Section */}
                        <div className={cn(
                            "flex-1 border-r border-border dark:border-white/5 relative h-full",
                            activeTab === 'output' ? "hidden lg:block" : "block"
                        )}>
                            <Editor
                                height="100%"
                                language={language.monaco}
                                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                loading={<div className="w-full h-full bg-card" />}
                                options={{
                                    fontSize: editorFontSize,
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

                        </div>

                        {/* Terminal Section */}
                        <div className={cn(
                            "lg:w-[40%] h-full",
                            activeTab === 'code' ? "hidden lg:block" : "block w-full"
                        )}>
                            <CodeTerminal
                                output={output}
                                onClear={clearOutput}
                                inputValue={inputValue}
                                onInputChange={handleTerminalInput}
                                onInputKeyDown={handleInputKeyDown}
                                isExecuting={isExecuting}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
