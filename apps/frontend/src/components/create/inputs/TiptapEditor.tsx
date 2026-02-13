"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Highlighter, FileCode } from "lucide-react";

import { EditorToolbar } from "./editor/EditorToolbar";
import { EditorBubbleMenu } from "./editor/EditorBubbleMenu";
import { MarkdownEditor } from "./editor/MarkdownEditor";
import { SlashCommand } from "./extensions/SlashCommand";
import { suggestion } from "./extensions/suggestion";
import Mention from "@tiptap/extension-mention";
import { createUnifiedSuggestion } from "./extensions/mentionSuggestion";
import "tippy.js/dist/tippy.css";
import { PluginKey } from "prosemirror-state";

const lowlight = createLowlight(common);

const unifiedMentionKey = new PluginKey("unifiedMention");
const slashCommandKey = new PluginKey("slashCommand");

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    hideToolbar?: boolean;
}

type EditorMode = "rich" | "markdown";

export default function TiptapEditor({ content, onChange, placeholder, className, hideToolbar }: TiptapEditorProps) {
    const [mode, setMode] = useState<EditorMode>("rich");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Mention.extend({
                name: "communityMention",
                addStorage() {
                    return {
                        markdown: {
                            serialize: (state: any, node: any) => {
                                state.write(`d/${node.attrs.label ?? node.attrs.id}`);
                            }
                        }
                    }
                }
            }).configure({
                HTMLAttributes: {
                    class: "text-brand-secondary font-bold hover:underline cursor-pointer",
                },
                renderLabel: ({ node }) => `d/${node.attrs.label ?? node.attrs.id}`,
                renderHTML({ options, node }) {
                    return [
                        'span',
                        options.HTMLAttributes,
                        `d/${node.attrs.label ?? node.attrs.id}`,
                    ]
                },
            }),
            Mention.extend({
                name: "userMention",
                addStorage() {
                    return {
                        markdown: {
                            serialize: (state: any, node: any) => {
                                state.write(`u/${node.attrs.label ?? node.attrs.id}`);
                            }
                        }
                    }
                }
            }).configure({
                HTMLAttributes: {
                    class: "text-brand-primary font-bold hover:underline cursor-pointer",
                },
                suggestion: {
                    ...createUnifiedSuggestion(unifiedMentionKey),
                    allowSpaces: false,
                },
                renderLabel: ({ node }) => `u/${node.attrs.label ?? node.attrs.id}`,
                renderHTML({ options, node }) {
                    return [
                        'span',
                        options.HTMLAttributes,
                        `u/${node.attrs.label ?? node.attrs.id}`,
                    ]
                },
            }),
            SlashCommand.configure({
                suggestion: {
                    ...suggestion,
                    pluginKey: slashCommandKey,
                },
            }),
            Markdown,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Placeholder.configure({
                placeholder: placeholder || "Body text (optional)",
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onChange(markdown);
        },
        editorProps: {
            attributes: {
                class: "tiptap prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] text-base leading-relaxed text-foreground p-4",
            },
        },
    });

    // Content sync for Tiptap
    useEffect(() => {
        if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return <div className="min-h-[200px] w-full bg-muted/5 animate-pulse rounded-xl" />;
    }

    return (
        <div className={cn(
            "flex flex-col border border-border/50 focus-within:border-border transition-all rounded-[12px] bg-card overflow-hidden h-full",
            className
        )}>
            {/* Mode Switcher Header */}
            <div className="flex items-center justify-between px-2 bg-muted/10 border-b border-border/10 h-10">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setMode("rich")}
                        className={cn(
                            "px-4 h-10 text-[13px] font-medium transition-all relative flex items-center gap-2 cursor-pointer",
                            mode === "rich" ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        <Highlighter className="size-3.5" /> Write
                        {mode === "rich" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("markdown")}
                        className={cn(
                            "px-4 h-10 text-[13px] font-medium transition-all relative flex items-center gap-2 cursor-pointer",
                            mode === "markdown" ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        <FileCode className="size-3.5" /> Markdown
                        {mode === "markdown" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
                    </button>
                </div>
            </div>

            {/* Toolbar (Only for Rich Mode) */}
            {mode === "rich" && !hideToolbar && <EditorToolbar editor={editor} />}

            {/* Editor Content Area */}
            <div className="relative min-h-[200px] bg-background/50">
                {mode === "rich" ? (
                    <>
                        <EditorContent editor={editor} className="outline-none" />
                        <EditorBubbleMenu editor={editor} />
                    </>
                ) : (
                    <MarkdownEditor content={content} onChange={onChange} />
                )}
            </div>
        </div>
    );
}
