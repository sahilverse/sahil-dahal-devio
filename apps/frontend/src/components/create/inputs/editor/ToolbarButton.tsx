"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
    label: string;
}

export function ToolbarButton({
    icon: Icon,
    onClick,
    isActive,
    label
}: ToolbarButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            title={label}
            className={cn(
                "h-8 w-8 rounded-md transition-all",
                isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground/40 hover:bg-foreground/5 hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
