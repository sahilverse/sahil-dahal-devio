import React from 'react';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import CodeBlock from '@/components/profile/posts/CodeBlock';

interface MarkdownContentProps {
    content: string;
    className?: string;
    components?: any;
}

export const MarkdownContent = ({ content, className, components }: MarkdownContentProps) => {
    const processMentions = (text: string) => {
        if (!text) return '';

        const parts = text.split(/(```[\s\S]*?```|`[^`]*`)/g);

        return parts.map(part => {
            if (part && (part.startsWith('`') || part.startsWith('```'))) return part;

            return part
                .replace(/(^|\s)u\/([a-zA-Z0-9_-]+)/g, '$1[u/$2](/user/$2)')
                .replace(/(^|\s)d\/([a-zA-Z0-9_-]+)/g, '$1[d/$2](/d/$2)');
        }).join('');
    };

    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none text-muted-foreground", className)}>
            <Markdown
                components={{
                    a: ({ node, ...props }: any) => {
                        const href = props.href || '';
                        const isUserMention = href.startsWith('/user/');
                        const isCommunityMention = href.startsWith('/d/');

                        if (isUserMention || isCommunityMention) {
                            return (
                                <Link
                                    href={href}
                                    className={cn(
                                        "font-bold no-underline hover:underline",
                                        isUserMention ? "text-brand-primary" : "text-brand-secondary"
                                    )}
                                >
                                    {props.children}
                                </Link>
                            );
                        }

                        return (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {props.children}
                            </a>
                        );
                    },
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "text";

                        return !inline ? (
                            <CodeBlock
                                language={language}
                                value={String(children).replace(/\n$/, "")}
                                className="my-3"
                            />
                        ) : (
                            <code className={cn("bg-muted/50 px-1.5 py-0.5 rounded text-[13px] font-mono", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    ...components
                }}
            >
                {processMentions(content)}
            </Markdown>
        </div>
    );
};
