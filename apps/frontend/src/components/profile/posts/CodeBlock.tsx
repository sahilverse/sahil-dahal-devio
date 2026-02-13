import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

interface CodeBlockProps {
    language?: string;
    value: string;
    className?: string;
}

const detectLanguage = (code: string): string => {
    const tokens = [
        { lang: "python", keywords: [/def\s/i, /import\s/i, /elif\s/i, /print\(/i] },
        { lang: "javascript", keywords: [/function\s/i, /const\s/i, /let\s/i, /console\./i, /=>/i] },
        { lang: "typescript", keywords: [/interface\s/i, /type\s/i, /namespace\s/i, /public\s/i] },
        { lang: "cpp", keywords: [/#include/i, /std::/i, /cout\s/i, /int\smain/i] },
        { lang: "java", keywords: [/public\sclass/i, /System\.out/i] },
        { lang: "sql", keywords: [/SELECT\s/i, /FROM\s/i, /WHERE\s/i, /INSERT\sINTO/i] },
        { lang: "markdown", keywords: [/^#\s/m, /^##\s/m, /^-\s/m] }
    ];

    for (const { lang, keywords } of tokens) {
        if (keywords.some(regex => regex.test(code))) return lang;
    }
    return "text";
};

export default function CodeBlock({ language, value, className }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const { actualTheme } = useAppSelector((state) => state.theme);

    const detectedLanguage = useMemo(() => {
        if (language && language !== "text") return language;
        return detectLanguage(value);
    }, [language, value]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    const isDark = actualTheme === "dark";

    return (
        <div className={cn("relative group rounded-md overflow-hidden my-4 bg-muted/20 dark:bg-muted/10 border border-border/40 hover:border-border transition-colors", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1 bg-muted/30 dark:bg-muted/20 border-b border-border/20">
                <div className="flex gap-1.5 items-center">
                    <span className="size-2 rounded-full bg-red-500/50" />
                    <span className="size-2 rounded-full bg-amber-500/50" />
                    <span className="size-2 rounded-full bg-emerald-500/50" />
                    <span className="ml-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest font-mono">
                        {detectedLanguage === "text" ? "plain-text" : detectedLanguage}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-6 w-6 text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 transition-all opacity-0 group-hover:opacity-100"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            </div>

            {/* Code Body */}
            <div className="text-[13px] font-mono leading-relaxed overflow-x-auto scrollbar-thin scrollbar-thumb-border/50">
                <SyntaxHighlighter
                    language={detectedLanguage.toLowerCase()}
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                    }}
                    codeTagProps={{
                        className: "font-mono"
                    }}
                >
                    {value.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
