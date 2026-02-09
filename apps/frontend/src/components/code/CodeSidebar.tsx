"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { LANGUAGES, Language } from "./constants";
import { PythonLogo, JavaScriptLogo, CLogo, CPPLogo, JavaLogo } from "./LanguageLogos";
import Link from "next/link";
import Image from "next/image";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    python: PythonLogo,
    javascript: JavaScriptLogo,
    c: CLogo,
    cpp: CPPLogo,
    java: JavaLogo,
};

interface CodeSidebarProps {
    selectedLanguage: Language;
    onLanguageChange: (lang: Language) => void;
    className?: string;
    isMobile?: boolean;
}

export function CodeSidebar({
    selectedLanguage,
    onLanguageChange,
    className,
    isMobile = false
}: CodeSidebarProps) {
    return (
        <aside className={cn(
            "bg-card flex flex-col items-center py-4 border-r border-border dark:border-white/5",
            isMobile ? "w-full border-r-0" : "w-16",
            className
        )}>
            {/* Devio Logo - Only show on desktop sidebar */}
            {!isMobile && (
                <Link href="/" className="mb-6 hover:opacity-80 transition-opacity">
                    <Image
                        src="/devio-logo.png"
                        width={32}
                        height={32}
                        alt="Dev.io"
                        className="rounded-lg"
                    />
                </Link>
            )}

            <div className={cn(
                "flex flex-col gap-3",
                isMobile ? "w-full px-2" : "items-center"
            )}>
                {Object.values(LANGUAGES).map((lang) => {
                    const Icon = ICON_MAP[lang.id];
                    const isActive = selectedLanguage.id === lang.id;

                    return (
                        <button
                            key={lang.id}
                            onClick={() => onLanguageChange(lang)}
                            className={cn(
                                "flex items-center rounded-xl transition-all border cursor-pointer group",
                                isMobile ? "w-full px-4 py-3 gap-3" : "w-10 h-10 justify-center",
                                isActive
                                    ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-[0_0_12px_rgba(88,101,242,0.2)]"
                                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                            title={lang.name}
                        >
                            {Icon && <Icon size={isMobile ? 24 : 22} />}
                            {isMobile && (
                                <span className="text-sm font-medium">
                                    {lang.name}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

export function LanguageIcon({
    langId,
    name,
    active,
    onClick
}: {
    langId: string,
    name: string,
    active?: boolean,
    onClick: () => void
}) {
    const Icon = ICON_MAP[langId];

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg transition-all border cursor-pointer",
                active
                    ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-[0_0_12px_rgba(88,101,242,0.2)]"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title={name}
        >
            {Icon ? <Icon size={24} /> : <span className="text-xs font-bold">{name[0]}</span>}
        </button>
    );
}
