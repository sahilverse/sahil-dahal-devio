"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Code,
    Quote,
    Strikethrough,
    Terminal,
    Type,
    ChevronDown
} from "lucide-react";

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    hideToolbar?: boolean;
}

export default function TiptapEditor({ content, onChange, placeholder, className, hideToolbar }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Markdown,
            Placeholder.configure({
                placeholder: placeholder || "Body text (optional)",
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-brand-primary underline underline-offset-4 cursor-pointer",
                },
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange((editor.storage as any).markdown.getMarkdown());
        },
        editorProps: {
            attributes: {
                class: "tiptap prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] text-base leading-relaxed text-foreground p-4",
            },
        },
    });

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
            "flex flex-col border border-muted-foreground/20 focus-within:border-foreground/80 transition-all rounded-[12px] bg-transparent overflow-hidden",
            className
        )}>
            {!hideToolbar && <EditorToolbar editor={editor} />}
            <EditorContent editor={editor} className="outline-none" />
        </div>
    );
}

function EditorToolbar({ editor }: { editor: Editor }) {
    return (
        <div className="flex flex-wrap items-center justify-between p-2 bg-muted/20 border-b border-muted-foreground/10">
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    icon={Bold}
                    isActive={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    label="Bold"
                />
                <ToolbarButton
                    icon={Italic}
                    isActive={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    label="Italic"
                />
                <ToolbarButton
                    icon={Strikethrough}
                    isActive={editor.isActive("strike")}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    label="Strikethrough"
                />
                <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
                <ToolbarButton
                    icon={List}
                    isActive={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    label="Bullet List"
                />
                <ToolbarButton
                    icon={ListOrdered}
                    isActive={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    label="Ordered List"
                />
                <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
                <ToolbarButton
                    icon={Code}
                    isActive={editor.isActive("code")}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    label="Inline Code"
                />
                <ToolbarButton
                    icon={Quote}
                    isActive={editor.isActive("blockquote")}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    label="Quote"
                />
                <ToolbarButton
                    icon={Terminal}
                    isActive={editor.isActive("codeBlock")}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    label="Code Block"
                />
            </div>
        </div>
    );
}

function ToolbarButton({
    icon: Icon,
    onClick,
    isActive,
    label
}: {
    icon: any;
    onClick: () => void;
    isActive?: boolean;
    label: string;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            title={label}
            className={cn(
                "h-8 w-8 rounded-lg transition-all",
                isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
