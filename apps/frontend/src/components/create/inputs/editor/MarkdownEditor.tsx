"use client";

import MonacoEditor from "@monaco-editor/react";
import { useAppSelector } from "@/store/hooks";

interface MarkdownEditorProps {
    content: string;
    onChange: (value: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
    const { actualTheme } = useAppSelector((state) => state.theme);

    return (
        <div className="py-2">
            <MonacoEditor
                height="300px"
                defaultLanguage="markdown"
                theme={actualTheme === "dark" ? "vs-dark" : "light"}
                value={content}
                onChange={(val) => onChange(val || "")}
                options={{
                    minimap: { enabled: false },
                    padding: { top: 16, bottom: 16 },
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    lineNumbers: "on",
                    wordWrap: "on",
                    lineDecorationsWidth: 16,
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
