"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
    text: string;
    lines?: number;
    className?: string;
}

export default function ExpandableText({
    text,
    lines = 3,
    className,
}: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const element = textRef.current;
        if (element) {
            const lineHeight = parseInt(getComputedStyle(element).lineHeight);
            const maxHeight = lineHeight * lines;
            setNeedsTruncation(element.scrollHeight > maxHeight);
        }
    }, [text, lines]);

    return (
        <div className={className}>
            <p
                ref={textRef}
                className={cn(
                    "text-sm text-muted-foreground",
                    !isExpanded && needsTruncation && "line-clamp-2"
                )}
            >
                {text}
            </p>
            {needsTruncation && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary hover:underline mt-1 font-medium cursor-pointer"
                >
                    {isExpanded ? "Show less" : "Show more"}
                </button>
            )}
        </div>
    );
}
