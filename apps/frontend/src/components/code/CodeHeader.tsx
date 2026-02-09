"use client";

import { Share2, Sun, Moon, Play, Menu, X, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language } from "./constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme as setReduxTheme } from "@/slices/theme";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface CodeHeaderProps {
    language: Language;
    isExecuting: boolean;
    onRun: () => void;
    onShare: () => void;
    showLanguageMenu: boolean;
    setShowLanguageMenu: (show: boolean) => void;
    activeTab: 'code' | 'output';
    setActiveTab: (tab: 'code' | 'output') => void;
}

export function CodeHeader({
    language,
    isExecuting,
    onRun,
    onShare,
    showLanguageMenu,
    setShowLanguageMenu,
    activeTab,
    setActiveTab
}: CodeHeaderProps) {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.theme);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        dispatch(setReduxTheme(nextTheme));
    };

    return (
        <>
            <header className="h-12 sm:h-14 bg-card border-b border-border dark:border-white/5 flex items-center justify-between px-2 sm:px-4 z-40 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="lg:hidden p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        {showLanguageMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Mobile Logo - only show on small screens */}
                    <Link href="/" className="lg:hidden hover:opacity-80 transition-opacity">
                        <Image
                            src="/devio-logo.png"
                            width={28}
                            height={28}
                            alt="Dev.io"
                            className="rounded-md"
                        />
                    </Link>


                    {/* Mobile Tabs */}
                    <div className="flex lg:hidden bg-accent/50 rounded-lg p-0.5 sm:p-1">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={cn(
                                "px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all cursor-pointer",
                                activeTab === 'code' ? "bg-brand-primary text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {language.extension}
                        </button>
                        <button
                            onClick={() => setActiveTab('output')}
                            className={cn(
                                "px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer",
                                activeTab === 'output' ? "bg-brand-primary text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Terminal className="w-3 h-3" />
                            <span className="hidden xs:inline">Output</span>
                        </button>
                    </div>

                    {/* Desktop Filename */}
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-t-lg border-t border-x border-border dark:border-white/10 text-sm font-medium text-foreground translate-y-[9px]">
                        <span className="w-2 h-2 rounded-full bg-brand-primary" />
                        {language.extension}
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg hover:bg-accent"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>

                    <button
                        onClick={onShare}
                        className="hidden xs:flex p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg hover:bg-accent"
                        title="Share Code"
                    >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {/* Desktop Run Button */}
                    <Button
                        onClick={onRun}
                        disabled={isExecuting}
                        size="sm"
                        className="hidden sm:flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold cursor-pointer h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm"
                    >
                        {isExecuting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                <span>Run</span>
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Mobile Floating Action Button for Run */}
            <button
                onClick={onRun}
                disabled={isExecuting}
                className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full shadow-lg shadow-brand-primary/30 flex items-center justify-center cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                title="Run Code"
            >
                {isExecuting ? (
                    <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <Play className="w-6 h-6 fill-current" />
                )}
            </button>
        </>
    );
}
