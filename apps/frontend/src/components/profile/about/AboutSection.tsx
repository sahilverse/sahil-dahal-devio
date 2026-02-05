"use client";

import { ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    isEmpty?: boolean;
    emptyMessage?: string;
    isCurrentUser?: boolean;
    onAdd?: () => void;
    onEdit?: () => void;
}

export default function AboutSection({
    title,
    icon,
    children,
    isEmpty = false,
    emptyMessage = "Nothing to show yet",
    isCurrentUser = false,
    onAdd,
    onEdit,
}: AboutSectionProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{icon}</span>
                    <h3 className="text-base font-semibold">{title}</h3>
                </div>
                {isCurrentUser && (
                    <div className="flex items-center gap-1">
                        {onAdd && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={onAdd}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                        {onEdit && !isEmpty && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={onEdit}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {isEmpty ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    {isCurrentUser && onAdd && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={onAdd}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add {title}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">{children}</div>
            )}
        </div>
    );
}
