"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Italic, Code } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

interface EditorBubbleMenuProps {
    editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
    return (
        <BubbleMenu
            editor={editor}
            className="flex items-center gap-0.5 p-1 bg-background border border-border shadow-soft rounded-lg overflow-hidden animate-in fade-in zoom-in duration-200"
        >
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
            <div className="w-px h-3 bg-border mx-0.5 shadow-none" />
            <ToolbarButton
                icon={Code}
                isActive={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
                label="Code"
            />
        </BubbleMenu>
    );
}
