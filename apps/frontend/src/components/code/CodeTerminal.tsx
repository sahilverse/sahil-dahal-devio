"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeTerminalProps {
    output: { text: string; type: string }[];
    onClear: () => void;
    inputValue: string;
    onInputChange: (value: string) => void;
    onInputKeyDown: (e: React.KeyboardEvent) => void;
    className?: string;
    isExecuting: boolean;
}

export function CodeTerminal({
    output,
    onClear,
    inputValue,
    onInputChange,
    onInputKeyDown,
    className,
    isExecuting
}: CodeTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output, inputValue]);

    const handleTerminalClick = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }
        hiddenInputRef.current?.focus();
    };

    return (
        <div className={cn("flex flex-col h-full bg-card rounded-b-lg overflow-hidden", className)}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border dark:border-white/5 bg-accent/30">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    <TerminalIcon className="w-3.5 h-3.5" />
                    Terminal
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    className="p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    title="Clear Console"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear
                </button>
            </div>

            <div
                ref={terminalRef}
                onClick={handleTerminalClick}
                className="flex-1 overflow-y-auto p-4 font-mono text-sm cursor-text selection:bg-[#5865F2]/30 scroll-smooth"
            >
                <div className="inline whitespace-pre-wrap">
                    {output.map((line, i) => {
                        const isError = line.type === 'stderr' || line.type === 'error';
                        return (
                            <span
                                key={i}
                                className={cn(
                                    isError ? "text-red-400" : "text-foreground",
                                    line.type === 'error' && "font-bold"
                                )}
                            >
                                {line.text}
                            </span>
                        );
                    })}

                    {/* Inline Current Input */}
                    {isExecuting && isFocused && (
                        <span className="relative inline-block min-w-[1px]">
                            {inputValue}
                            <span className="inline-block w-2 h-4 bg-[#5865F2] ml-0.5 align-middle animate-pulse" />
                        </span>
                    )}
                </div>

                {/* Hidden Input for capturing keystrokes */}
                <input
                    ref={hiddenInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="absolute pointer-events-none opacity-0"
                    disabled={!isExecuting}
                />
            </div>
        </div>
    );
}

