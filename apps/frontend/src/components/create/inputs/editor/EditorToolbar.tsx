"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Strikethrough,
    Terminal,
    Code
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

interface EditorToolbarProps {
    editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between p-1.5 bg-muted/5 border-b border-border/10">
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
                <div className="w-px h-4 bg-border mx-1" />
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
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton
                    icon={Code}
                    isActive={editor.isActive("code")}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    label="Inline Code"
                />
                <ToolbarButton
                    icon={Terminal}
                    isActive={editor.isActive("codeBlock")}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    label="Code Block"
                />
                <ToolbarButton
                    icon={Quote}
                    isActive={editor.isActive("blockquote")}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    label="Quote"
                />
            </div>
        </div>
    );
}
